import { useState, useEffect } from 'react';
import { getFloorGrid, findPath, extractFloorCode, extractTargetName } from '../services/pathfindingService';
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
  const [path, setPath] = useState(null);
  const [gridData, setGridData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const floorCode = extractFloorCode(location);
  const targetName = extractTargetName(location);
  const imageUrl = getFloorImageUrl(floorCode);

  useEffect(() => {
    async function loadAndFindPath() {
      if (!floorCode || !targetName) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const data = await getFloorGrid(floorCode);
      setGridData(data);

      if (data) {
        // 엘리베이터 → 목적지 경로 찾기 (elevator 못 찾으면 entrance 시도)
        let foundPath = findPath(data, 'elevator', targetName);
        if (!foundPath) {
          foundPath = findPath(data, 'entrance', targetName);
        }
        setPath(foundPath);
      }
      setIsLoading(false);
    }
    loadAndFindPath();
  }, [location]);

  if (!floorCode || !imageUrl) return null;

  if (isLoading) {
    return (
      <div className="floor-map-overlay-container">
        <p className="map-loading">경로 분석 중...</p>
      </div>
    );
  }

  const gridRows = gridData?.grid?.length || 12;
  const gridCols = gridData?.grid?.[0]?.length || 12;

  return (
    <div className="floor-map-overlay-container">
      <div className="floor-map-header-bar">
        <span className="floor-map-floor-label">{getFloorLabel(floorCode)} 안내도</span>
        <span className="floor-map-location-text">위치: {location}</span>
      </div>
      <div className="floor-map-wrapper">
        {/* 평면도 이미지 */}
        <img src={imageUrl} alt={`${getFloorLabel(floorCode)} 안내도`} className="floor-map-bg" crossOrigin="anonymous" />

        {/* 경로 오버레이 */}
        {path && path.length > 1 && (
          <svg className="floor-map-path" viewBox={`0 0 ${gridCols} ${gridRows}`} preserveAspectRatio="none">
            <defs>
              <marker id={`pathArrow-${examName}`} markerWidth="4" markerHeight="3" refX="4" refY="1.5" orient="auto">
                <polygon points="0 0, 4 1.5, 0 3" fill="#4f8cff" />
              </marker>
            </defs>
            {/* 경로 점선 */}
            <polyline
              points={path.map(p => `${p.col + 0.5},${p.row + 0.5}`).join(' ')}
              fill="none"
              stroke="#4f8cff"
              strokeWidth="0.3"
              strokeDasharray="0.5 0.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={`url(#pathArrow-${examName})`}
            />
            {/* 출발점 (엘리베이터) */}
            <circle
              cx={path[0].col + 0.5}
              cy={path[0].row + 0.5}
              r="0.4"
              fill="#4f8cff"
            />
            {/* 도착점 */}
            <circle
              cx={path[path.length - 1].col + 0.5}
              cy={path[path.length - 1].row + 0.5}
              r="0.4"
              fill="#ef4444"
            />
          </svg>
        )}

        {/* 목적지 마커 (경로가 없어도 표시) */}
        {!path && gridData?.legend && (
          <div className="floor-map-no-path">
            <span>📍</span>
          </div>
        )}
      </div>

      {/* 이동 안내 */}
      <div className="floor-map-direction">
        {path ? (
          <span className="direction-step">🚶 엘리베이터에서 내린 후 <strong>{location}</strong>까지 표시된 경로를 따라 이동하세요.</span>
        ) : (
          <span className="direction-step">🚶 엘리베이터에서 내린 후 <strong>{location}</strong>으로 이동하세요.</span>
        )}
      </div>
    </div>
  );
}

export default FloorMapOverlay;
