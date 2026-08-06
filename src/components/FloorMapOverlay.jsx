import { useState, useEffect } from 'react';
import { getFloorGrid, extractFloorCode, extractTargetName } from '../services/pathfindingService';
import './FloorMapOverlay.css';

const S3_BASE = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/maps';

function getFloorImageUrl(floorCode) {
  if (!floorCode) return null;
  const fileName = floorCode === 'b1' ? 'b1f.png' : `${floorCode}.png`;
  return `${S3_BASE}/${fileName}?v=${Date.now()}`;
}

function getFloorLabel(floorCode) {
  if (floorCode === 'b1') return '지하 1층';
  return `${floorCode.replace('f', '')}층`;
}

// 격자 맵에서 목적지 좌표 찾기
function findTargetPosition(gridData, targetName) {
  if (!gridData || !gridData.grid || !gridData.legend) return null;

  const { grid, legend } = gridData;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  if (rows === 0 || cols === 0) return null;

  // legend에서 찾기 (값이 객체 또는 배열일 수 있음)
  const getPos = (legendEntry) => {
    if (!legendEntry) return null;
    // 배열이면 첫 번째 요소 사용
    if (Array.isArray(legendEntry)) {
      if (legendEntry.length === 0) return null;
      return legendEntry[0];
    }
    // 객체면 그대로
    if (legendEntry.row !== undefined) return legendEntry;
    return null;
  };

  // legend에서 정확 매칭
  if (legend[targetName]) {
    const pos = getPos(legend[targetName]);
    if (pos) return { x: (pos.col + 0.5) / cols, y: (pos.row + 0.5) / rows };
  }

  // legend에서 부분 매칭
  for (const [key, val] of Object.entries(legend)) {
    if (key.includes(targetName) || targetName.includes(key)) {
      const pos = getPos(val);
      if (pos) return { x: (pos.col + 0.5) / cols, y: (pos.row + 0.5) / rows };
    }
  }

  // grid에서 직접 검색 (정확 매칭)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell === targetName) {
        return { x: (c + 0.5) / cols, y: (r + 0.5) / rows };
      }
    }
  }

  // grid에서 부분 매칭
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell !== 'wall' && cell !== 'corridor' && cell !== 'elevator' && cell !== 'entrance') {
        if (cell.includes(targetName) || targetName.includes(cell)) {
          return { x: (c + 0.5) / cols, y: (r + 0.5) / rows };
        }
      }
    }
  }

  return null;
}

function FloorMapOverlay({ location, examName }) {
  const [pinPosition, setPinPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const floorCode = extractFloorCode(location);
  const targetName = extractTargetName(location);
  const imageUrl = getFloorImageUrl(floorCode);

  useEffect(() => {
    async function loadAndFindTarget() {
      if (!floorCode || !targetName) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await getFloorGrid(floorCode);

      if (data) {
        const pos = findTargetPosition(data, targetName);
        setPinPosition(pos);
      }
      setIsLoading(false);
    }
    loadAndFindTarget();
  }, [location]);

  if (!floorCode || !imageUrl) return null;

  if (isLoading) {
    return (
      <div className="floor-map-overlay-container">
        <p className="map-loading">위치 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="floor-map-overlay-container">
      <div className="floor-map-header-bar">
        <span className="floor-map-floor-label">{getFloorLabel(floorCode)} 안내도</span>
        <span className="floor-map-location-text">위치: {location}</span>
      </div>
      <div className="floor-map-wrapper">
        <img src={imageUrl} alt={`${getFloorLabel(floorCode)} 안내도`} className="floor-map-bg" crossOrigin="anonymous" />

        {/* 목적지 핀 */}
        {pinPosition && (
          <div
            className="floor-map-pin"
            style={{
              left: `${pinPosition.x * 100}%`,
              top: `${pinPosition.y * 100}%`,
            }}
          >
            📍
          </div>
        )}
      </div>

      <div className="floor-map-direction">
        <span className="direction-step">🚶 엘리베이터에서 내린 후 <strong>{location}</strong>으로 이동하세요.</span>
      </div>
    </div>
  );
}

export default FloorMapOverlay;
