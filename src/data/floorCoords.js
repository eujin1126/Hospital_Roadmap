// 각 층별 과/실의 이미지 내 좌표 (비율 0~1)
// x, y는 좌상단 기준, width/height는 비율

const floorCoords = {
  'b1': {
    '방사선종양학과': { x: 0.28, y: 0.03, width: 0.28, height: 0.22 },
    '인체자원은행': { x: 0.38, y: 0.35, width: 0.18, height: 0.10 },
    '시설과': { x: 0.28, y: 0.42, width: 0.12, height: 0.10 },
    '의무기록실': { x: 0.28, y: 0.52, width: 0.12, height: 0.12 },
    '약제과': { x: 0.25, y: 0.62, width: 0.15, height: 0.10 },
    '조제실': { x: 0.05, y: 0.72, width: 0.15, height: 0.15 },
    '기계실': { x: 0.60, y: 0.25, width: 0.18, height: 0.15 },
    '자동제어실': { x: 0.82, y: 0.10, width: 0.12, height: 0.18 },
    'MRI실': { x: 0.28, y: 0.03, width: 0.28, height: 0.22 },
    '엘리베이터': { x: 0.35, y: 0.30, width: 0.05, height: 0.05 },
    '원무과': { x: 0.05, y: 0.85, width: 0.12, height: 0.08 },
  },
  '1f': {
    '영상의학과': { x: 0.22, y: 0.05, width: 0.20, height: 0.12 },
    '초음파검사실': { x: 0.08, y: 0.15, width: 0.15, height: 0.10 },
    '소화기센터': { x: 0.05, y: 0.30, width: 0.15, height: 0.15 },
    '정형외과': { x: 0.30, y: 0.42, width: 0.12, height: 0.10 },
    '재활의학과': { x: 0.08, y: 0.55, width: 0.12, height: 0.12 },
    '가정의학과': { x: 0.15, y: 0.55, width: 0.12, height: 0.12 },
    '국가건강검진센터': { x: 0.10, y: 0.72, width: 0.18, height: 0.10 },
    '응급의료센터': { x: 0.75, y: 0.02, width: 0.15, height: 0.12 },
    '원무과': { x: 0.62, y: 0.50, width: 0.10, height: 0.08 },
    '주사실': { x: 0.25, y: 0.30, width: 0.08, height: 0.08 },
    '임상검사실': { x: 0.22, y: 0.05, width: 0.20, height: 0.12 },
    '엘리베이터': { x: 0.55, y: 0.48, width: 0.05, height: 0.05 },
  },
  '2f': {
    '구강외과': { x: 0.22, y: 0.02, width: 0.10, height: 0.08 },
    '치과': { x: 0.22, y: 0.02, width: 0.10, height: 0.08 },
    '외과': { x: 0.35, y: 0.02, width: 0.08, height: 0.08 },
    '이비인후과': { x: 0.08, y: 0.10, width: 0.10, height: 0.08 },
    '피부과': { x: 0.18, y: 0.18, width: 0.08, height: 0.08 },
    '안과': { x: 0.18, y: 0.28, width: 0.08, height: 0.08 },
    '호흡기내과': { x: 0.55, y: 0.02, width: 0.22, height: 0.12 },
    '호흡기전문질환센터': { x: 0.55, y: 0.02, width: 0.22, height: 0.12 },
    '알레르기내과': { x: 0.55, y: 0.02, width: 0.22, height: 0.12 },
    '혈액종양내과': { x: 0.02, y: 0.28, width: 0.15, height: 0.08 },
    '미용성형센터': { x: 0.25, y: 0.15, width: 0.12, height: 0.10 },
    '성형외과': { x: 0.25, y: 0.15, width: 0.12, height: 0.10 },
    '비뇨의학과': { x: 0.05, y: 0.55, width: 0.12, height: 0.08 },
    '비뇨기과': { x: 0.05, y: 0.55, width: 0.12, height: 0.08 },
    '정신건강의학과': { x: 0.05, y: 0.65, width: 0.14, height: 0.08 },
    '내과': { x: 0.12, y: 0.78, width: 0.08, height: 0.08 },
    '신장내과': { x: 0.12, y: 0.88, width: 0.10, height: 0.06 },
    '감염내과': { x: 0.30, y: 0.82, width: 0.08, height: 0.06 },
    '류머티스내과': { x: 0.22, y: 0.82, width: 0.10, height: 0.06 },
    '채혈실': { x: 0.35, y: 0.30, width: 0.08, height: 0.08 },
    '채혈·채뇨실': { x: 0.35, y: 0.30, width: 0.08, height: 0.08 },
    '신경생리검사실': { x: 0.32, y: 0.38, width: 0.12, height: 0.08 },
    '심장검사실': { x: 0.28, y: 0.55, width: 0.12, height: 0.08 },
    '심전도실': { x: 0.28, y: 0.55, width: 0.12, height: 0.08 },
    '심장초음파실': { x: 0.20, y: 0.55, width: 0.12, height: 0.08 },
    '뇌혈관센터': { x: 0.38, y: 0.55, width: 0.12, height: 0.08 },
    '권역심뇌혈관질환센터': { x: 0.55, y: 0.42, width: 0.20, height: 0.08 },
    '신경외과': { x: 0.50, y: 0.50, width: 0.08, height: 0.06 },
    '신경과': { x: 0.55, y: 0.50, width: 0.08, height: 0.06 },
    '심장외과': { x: 0.62, y: 0.50, width: 0.08, height: 0.06 },
    '흉부외과': { x: 0.55, y: 0.28, width: 0.10, height: 0.06 },
    '응급종합차실': { x: 0.80, y: 0.18, width: 0.12, height: 0.10 },
    '안과검사실': { x: 0.02, y: 0.38, width: 0.10, height: 0.06 },
    '사회사업상담팀': { x: 0.42, y: 0.32, width: 0.12, height: 0.06 },
    '엘리베이터': { x: 0.45, y: 0.45, width: 0.05, height: 0.05 },
  },
  '3f': {
    '수술실': { x: 0.15, y: 0.02, width: 0.55, height: 0.15 },
    '회복실': { x: 0.70, y: 0.10, width: 0.12, height: 0.08 },
    'NCU': { x: 0.28, y: 0.52, width: 0.18, height: 0.15 },
    'CCU': { x: 0.48, y: 0.52, width: 0.18, height: 0.15 },
    '심혈관조영실': { x: 0.68, y: 0.52, width: 0.15, height: 0.15 },
    '물리치료실': { x: 0.15, y: 0.35, width: 0.15, height: 0.12 },
    '엘리베이터': { x: 0.45, y: 0.30, width: 0.05, height: 0.05 },
  },
  '4f': {
    '인공신장실': { x: 0.70, y: 0.05, width: 0.18, height: 0.20 },
    '수면센터': { x: 0.05, y: 0.35, width: 0.12, height: 0.08 },
    '재활의학과': { x: 0.05, y: 0.35, width: 0.12, height: 0.08 },
    '기능검사실': { x: 0.05, y: 0.35, width: 0.12, height: 0.08 },
    '엘리베이터': { x: 0.45, y: 0.30, width: 0.05, height: 0.05 },
  },
  '5f': {
    '정신건강의학과': { x: 0.55, y: 0.05, width: 0.18, height: 0.10 },
    '검사실': { x: 0.55, y: 0.05, width: 0.18, height: 0.10 },
    '엘리베이터': { x: 0.45, y: 0.30, width: 0.05, height: 0.05 },
  },
  '6f': {
    '진단검사의학과': { x: 0.65, y: 0.05, width: 0.25, height: 0.30 },
    '엘리베이터': { x: 0.45, y: 0.30, width: 0.05, height: 0.05 },
  },
};

// location 문자열로 좌표 찾기
export function findLocationCoords(location) {
  if (!location) return null;

  // 층 코드 추출
  let floorCode = null;
  const basementMatch = location.match(/지하\s*(\d+)\s*층/);
  if (basementMatch) floorCode = `b${basementMatch[1]}`;
  const floorMatch = location.match(/(\d+)\s*층/);
  if (floorMatch && !floorCode) floorCode = `${floorMatch[1]}f`;
  
  if (!floorCode || !floorCoords[floorCode]) return null;

  // 과/실 이름 추출 (층 정보 제거)
  const targetName = location.replace(/지하?\s*\d+\s*층\s*/, '').trim();
  if (!targetName) return null;

  const floorData = floorCoords[floorCode];

  // 정확한 매칭
  if (floorData[targetName]) {
    return {
      floorCode,
      target: floorData[targetName],
      elevator: floorData['엘리베이터'] || null,
    };
  }

  // 부분 매칭 (포함 관계)
  for (const [key, coords] of Object.entries(floorData)) {
    if (key === '엘리베이터') continue;
    if (targetName.includes(key) || key.includes(targetName)) {
      return {
        floorCode,
        target: coords,
        elevator: floorData['엘리베이터'] || null,
      };
    }
  }

  return null;
}

export default floorCoords;
