import { useState, useEffect } from 'react';
import { analyzeFloorMap } from '../services/mapAnalyzerService';
import './FloorMapOverlay.css';

function FloorMapOverlay({ location, examName }) {
  const [mapData, setMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMap() {
      setIsLoading(true);
      const result = await analyzeFloorMap(location);
      setMapData(result);
      setIsLoading(false);
    }
    loadMap();
  }, [location]);

  if (isLoading) {
    return (
      <div className="floor-map-overlay-container">
        <p className="map-loading">평면도 분석 중...</p>
      </div>
    );
  }

  if (!mapData || !mapData.floorImageUrl) {
    return null;
  }

  const { targetLocation, elevatorLocation, floorImageUrl } = mapData;

  return (
    <div className="floor-map-overlay-container">
      <div className="floor-map-wrapper">
        {/* 배경 평면도 이미지 (회색 처리) */}
        <img
          src={floorImageUrl}
          alt="층별 안내도"
          className="floor-map-bg"
          crossOrigin="anonymous"
        />

        {/* 전체 회색 오버레이 */}
        <div className="floor-map-gray-overlay"></div>

        {/* 목적지 하이라이트 */}
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

        {/* 엘리베이터 → 목적지 경로 화살표 */}
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
            {/* 출발점 표시 */}
            <circle
              cx={`${(elevatorLocation.x + elevatorLocation.width / 2) * 100}`}
              cy={`${(elevatorLocation.y + elevatorLocation.height / 2) * 100}`}
              r="1.2"
              fill="#4f8cff"
            />
          </svg>
        )}
      </div>

      {/* 이동 안내 텍스트 */}
      <div className="floor-map-direction">
        <span className="direction-step">🚶 엘리베이터에서 내린 후 <strong>{location}</strong>으로 이동하세요.</span>
      </div>
    </div>
  );
}

export default FloorMapOverlay;
