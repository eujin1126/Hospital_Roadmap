import { findLocationCoords } from '../data/floorCoords';
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

function FloorMapOverlay({ location, examName }) {
  if (!location) return null;

  const coordsData = findLocationCoords(location);
  
  // 층 코드 추출 (좌표 찾기 실패해도 이미지는 보여주기 위함)
  let floorCode = coordsData?.floorCode;
  if (!floorCode) {
    const basementMatch = location.match(/지하\s*(\d+)\s*층/);
    if (basementMatch) floorCode = `b${basementMatch[1]}`;
    const floorMatch = location.match(/(\d+)\s*층/);
    if (floorMatch && !floorCode) floorCode = `${floorMatch[1]}f`;
  }

  const imageUrl = getFloorImageUrl(floorCode);
  if (!imageUrl) return null;

  const target = coordsData?.target;
  const elevator = coordsData?.elevator;

  return (
    <div className="floor-map-overlay-container">
      <div className="floor-map-header-bar">
        <span className="floor-map-floor-label">{getFloorLabel(floorCode)} 안내도</span>
        <span className="floor-map-location-text">위치: {location}</span>
      </div>
      <div className="floor-map-wrapper">
        {/* 평면도 이미지 */}
        <img src={imageUrl} alt={`${getFloorLabel(floorCode)} 안내도`} className="floor-map-bg" crossOrigin="anonymous" />

        {/* 회색 오버레이 (전체) */}
        <div className="floor-map-gray-overlay"></div>

        {/* 목적지 하이라이트 */}
        {target && (
          <div
            className="floor-map-highlight"
            style={{
              left: `${target.x * 100}%`,
              top: `${target.y * 100}%`,
              width: `${target.width * 100}%`,
              height: `${target.height * 100}%`,
            }}
          >
            <div className="highlight-pin">📍</div>
          </div>
        )}

        {/* 엘리베이터 → 목적지 경로 */}
        {elevator && target && (
          <svg className="floor-map-path" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <marker id={`arrow-${examName}`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#4f8cff" />
              </marker>
            </defs>
            {/* 출발점 (엘리베이터) */}
            <circle
              cx={`${(elevator.x + elevator.width / 2) * 100}`}
              cy={`${(elevator.y + elevator.height / 2) * 100}`}
              r="1.5"
              fill="#4f8cff"
            />
            {/* 경로 점선 */}
            <line
              x1={`${(elevator.x + elevator.width / 2) * 100}`}
              y1={`${(elevator.y + elevator.height / 2) * 100}`}
              x2={`${(target.x + target.width / 2) * 100}`}
              y2={`${(target.y + target.height / 2) * 100}`}
              stroke="#4f8cff"
              strokeWidth="0.5"
              strokeDasharray="2 1"
              markerEnd={`url(#arrow-${examName})`}
            />
          </svg>
        )}
      </div>

      {/* 이동 안내 */}
      <div className="floor-map-direction">
        <span className="direction-step">🚶 엘리베이터에서 내린 후 <strong>{location}</strong>으로 이동하세요.</span>
      </div>
    </div>
  );
}

export default FloorMapOverlay;
