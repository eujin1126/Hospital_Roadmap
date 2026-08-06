// A* 알고리즘 기반 경로 탐색 서비스

const AI_API_URL = 'https://6s6v23t2p0.execute-api.us-east-1.amazonaws.com/default/hospital-ai-location';
const S3_BASE = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com';

// 격자 맵 캐시
const gridCache = {};

// S3에서 격자 맵 가져오기 (캐시 사용)
export async function getFloorGrid(floorCode) {
  if (gridCache[floorCode]) return gridCache[floorCode];

  const gridKey = `maps/${floorCode === 'b1' ? 'b1f' : floorCode}-grid.json`;
  const url = `${S3_BASE}/${gridKey}?v=${Date.now()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // 격자 맵이 없으면 Lambda에서 생성 요청
      const generated = await generateGrid(floorCode);
      if (generated) {
        gridCache[floorCode] = generated;
        return generated;
      }
      return null;
    }
    const data = await response.json();
    gridCache[floorCode] = data;
    return data;
  } catch (err) {
    console.error('격자 맵 로드 실패:', err);
    return null;
  }
}

// Lambda에서 격자 맵 생성 요청
async function generateGrid(floorCode) {
  const floorImage = `maps/${floorCode === 'b1' ? 'b1f' : floorCode}.png`;
  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generateGrid', floorImage, gridSize: 12 }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.grid || data;
  } catch (err) {
    console.error('격자 맵 생성 실패:', err);
    return null;
  }
}

// A* 알고리즘으로 경로 찾기
export function findPath(gridData, startName, targetName) {
  if (!gridData || !gridData.grid || !gridData.legend) return null;

  const grid = gridData.grid;
  const rows = grid.length;
  const cols = grid[0].length;

  // 시작점과 목적지 좌표 찾기
  const start = findCellPosition(grid, gridData.legend, startName);
  const target = findCellPosition(grid, gridData.legend, targetName);

  if (!start || !target) return null;

  // A* 탐색
  const path = astar(grid, start, target, rows, cols);
  return path;
}

// 격자에서 특정 이름의 위치 찾기
function findCellPosition(grid, legend, name) {
  // legend에서 먼저 찾기
  if (legend[name]) {
    return { row: legend[name].row, col: legend[name].col };
  }

  // 부분 매칭으로 legend 검색
  for (const [key, pos] of Object.entries(legend)) {
    if (key.includes(name) || name.includes(key)) {
      return { row: pos.row, col: pos.col };
    }
  }

  // grid에서 직접 검색
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      const cell = grid[r][c];
      if (cell === name || cell.includes(name) || name.includes(cell)) {
        return { row: r, col: c };
      }
    }
  }

  return null;
}

// A* 알고리즘
function astar(grid, start, target, rows, cols) {
  const openSet = [{ ...start, g: 0, h: heuristic(start, target), f: heuristic(start, target), parent: null }];
  const closedSet = new Set();
  const directions = [
    { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
    { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
  ];

  while (openSet.length > 0) {
    // f가 가장 작은 노드 선택
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    const key = `${current.row},${current.col}`;

    if (current.row === target.row && current.col === target.col) {
      // 경로 역추적
      const path = [];
      let node = current;
      while (node) {
        path.unshift({ row: node.row, col: node.col });
        node = node.parent;
      }
      return path;
    }

    closedSet.add(key);

    for (const dir of directions) {
      const newRow = current.row + dir.dr;
      const newCol = current.col + dir.dc;
      const newKey = `${newRow},${newCol}`;

      if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) continue;
      if (closedSet.has(newKey)) continue;

      const cell = grid[newRow][newCol];
      // wall은 지나갈 수 없음
      if (cell === 'wall') continue;

      const g = current.g + 1;
      const h = heuristic({ row: newRow, col: newCol }, target);
      const f = g + h;

      const existing = openSet.find(n => n.row === newRow && n.col === newCol);
      if (existing && existing.g <= g) continue;

      if (existing) {
        existing.g = g;
        existing.f = f;
        existing.parent = current;
      } else {
        openSet.push({ row: newRow, col: newCol, g, h, f, parent: current });
      }
    }
  }

  return null; // 경로 없음
}

// 맨해튼 거리 휴리스틱
function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// location에서 층 코드 추출
export function extractFloorCode(location) {
  if (!location) return null;
  const basementMatch = location.match(/지하\s*(\d+)\s*층/);
  if (basementMatch) return `b${basementMatch[1]}`;
  const floorMatch = location.match(/(\d+)\s*층/);
  if (floorMatch) return `${floorMatch[1]}f`;
  return null;
}

// location에서 목적지 이름 추출
export function extractTargetName(location) {
  if (!location) return '';
  return location.replace(/지하?\s*\d+\s*층\s*/, '').trim();
}
