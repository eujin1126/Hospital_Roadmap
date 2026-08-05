import { useState, useEffect } from 'react';
import { analyzeFloorMap } from '../services/mapAnalyzerService';
import './FloorMapOverlay.css';

const S3_BASE = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/maps';

// location에서 층 코드 추출 → 이미지 URL 생성 (fallback용)
function getFloorImageUrl(location) {
  if (!location) return null;
  const basementMatch = location.match(/지하\s*(\d+)\s*층/);
  if (basementMatch) return `${S3_BASE}/b${basementMatch[1]}f.png`;
  const floorMatch = location.match(/(\d+)\s*층/);
  if (floorMatch) return `${S3_BASE}/${floorMatch[1]}f.png`;
  return null;
}

function FloorMapOverlay({ location, examName }) {
  const [mapData, setMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    async function loadMap() {
      setIsLoading(true);
      setApiError(false);
      try {
        const result = await analyzeFloorMap(location);
        setMapData(result);
        if (!result) setApiError(true);
      } catch {
        setApiError(true);
      }
      setIsLoading(false);
    }
    if (location) loadMap();
    else setIsLoading(false);
  }, [location]);

  // fallback 이미지 URL
  const fallbackImageUrl = getFloorImageUrl(location);

  if (isLoading) {
    return (
      <div className="floor-map-overlay-container">
        <p className="map-loading">평면도 분석 중...</p>
      </div>
    );
  }

  // API 성공 시: 하이라이트 오버레이 포함
  if (mapData && mapData.floorImageUrl) {
    const { targetLocation, elevatorLocation, floorImageUrl } = mapData;

    return (
      <div className="floor-map-overlay-container">
        <div className="floor-map-wrapper">
          <img src={floorImageUrl} alt="층별 안내도" className="floor-map-bg" crossOrigin="anonymous" />
          <div className="floor-map-gray-overlay"></div>

          {targetLocation && (
            <div
              className="floor-map-highlight"
              style={{
                left: `${targetLocation.x * 100}%`,
                top: `${targetLocation.y * 100}%`,
                width: `${targetLocation.width * 100}%`,
                height: `${targetLocation.height * 100}%`,
              }}
            >
              <div className="highlight-pin">📍</div>
            </div>
          )}

          {elevatorLocation && targetLocation && (
            <svg className="floor-map-path" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#4f8cff" />
                </marker>
              </defs>
              <line
                x1={`${(elevatorLocation.x + elevatorLocation.width / 2) * 100}`}
                y1={`${(elevatorLocation.y + elevatorLocation.height / 2) * 100}`}
                x2={`${(targetLocation.x + targetLocation.width / 2) * 100}`}
                y2={`${(targetLocation.y + targetLocation.height / 2) * 100}`}
                stroke="#4f8cff"
                strokeWidth="0.4"
                strokeDasharray="1.5 1"
                markerEnd="url(#arrowhead)"
              />
              <circle
                cx={`${(elevatorLocation.x + elevatorLocation.width / 2) * 100}`}
                cy={`${(elevatorLocation.y + elevatorLocation.height / 2) * 100}`}
                r="1.2"
                fill="#4f8cff"
              />
            </svg>
          )}
        </div>
        <div className="floor-map-direction">
          <span className="direction-step">🚶 엘리베이터에서 내린 후 <strong>{location}</strong>으로 이동하세요.</span>
        </div>
      </div>
    );
  }

  // API 실패 시: fallback으로 평면도 이미지만 표시
  if (fallbackImageUrl) {
    return (
      <div className="floor-map-overlay-container">
        <div className="floor-map-wrapper">
          <img src={fallbackImageUrl} alt="층별 안내도" className="floor-map-bg" crossOrigin="anonymous" />
        </div>
        <div className="floor-map-direction">
          <span className="direction-step">🚶 엘리베이터에서 내린 후 <strong>{location}</strong>으로 이동하세요.</span>
        </div>
      </div>
    );
  }

  return null;
}

export default FloorMapOverlay;
