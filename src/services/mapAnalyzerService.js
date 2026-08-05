// Amazon Rekognition 기반 평면도 분석 서비스

const MAP_ANALYZER_URL = 'https://gepq4kkx6j.execute-api.us-east-1.amazonaws.com/default/hospital-map-analyzer';
const S3_BASE = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com';

// 층 코드에서 S3 이미지 키 반환
function getFloorImageKey(floorCode) {
  if (!floorCode) return null;
  const fileName = floorCode === 'b1' ? 'b1f.png' : `${floorCode}.png`;
  return `maps/${fileName}`;
}

// 위치 문자열에서 층 코드 추출
function extractFloor(location) {
  if (!location) return null;
  const basementMatch = location.match(/지하\s*(\d+)\s*층/);
  if (basementMatch) return `b${basementMatch[1]}`;
  const floorMatch = location.match(/(\d+)\s*층/);
  if (floorMatch) return `${floorMatch[1]}f`;
  return null;
}

// 위치 문자열에서 과/실 이름 추출 (층 정보 제거)
function extractTargetName(location) {
  if (!location) return '';
  return location.replace(/지하?\s*\d+\s*층\s*/, '').trim();
}

// Rekognition API로 평면도 분석
export async function analyzeFloorMap(location) {
  const floorCode = extractFloor(location);
  if (!floorCode) return null;

  const floorImage = getFloorImageKey(floorCode);
  const targetText = extractTargetName(location);

  if (!floorImage || !targetText) return null;

  try {
    const response = await fetch(MAP_ANALYZER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ floorImage, targetText }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      floorCode,
      floorImageUrl: `${S3_BASE}/${floorImage}`,
      targetLocation: data.targetLocation,
      elevatorLocation: data.elevatorLocation,
      allTexts: data.allTexts || [],
    };
  } catch (err) {
    console.error('평면도 분석 실패:', err);
    return null;
  }
}
