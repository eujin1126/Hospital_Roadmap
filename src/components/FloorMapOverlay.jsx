import { useState, useEffect } from 'react';
import { extractFloorCode, extractTargetName } from '../services/pathfindingService';
import { useAuth } from '../context/AuthContext';
import './FloorMapOverlay.css';

const S3_BASE = 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/maps';
const AI_API_URL = 'https://euh2dnu6ybhvo5kay6dof4h7ke0qrmzj.lambda-url.us-east-1.on.aws/';

function getFloorImageUrl(floorCode) {
  if (!floorCode) return null;
  const fileName = floorCode === 'b1' ? 'b1f.png' : `${floorCode}.png`;
  return `${S3_BASE}/${fileName}?v=${Date.now()}`;
}

function getFloorLabel(floorCode) {
  if (floorCode === 'b1') return '지하 1층';
  return `${floorCode.replace('f', '')}층`;
}

function getFloorImageKey(floorCode) {
  if (!floorCode) return null;
  const fileName = floorCode === 'b1' ? 'b1f.png' : `${floorCode}.png`;
  return `maps/${fileName}`;
}

// Claude Vision에 직접 좌표 질문
async function findLocationFromAI(floorCode, targetName) {
  const floorImage = getFloorImageKey(floorCode);
  if (!floorImage || !targetName) return null;

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'findLocation', floorImage, targetName }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (data.found) return { x: data.x, y: data.y };
    return null;
  } catch (err) {
    console.error('AI 위치 찾기 실패:', err);
    return null;
  }
}

function FloorMapOverlay({ location, examName }) {
  const [pinPosition, setPinPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hospitalInfo } = useAuth();

  const floorCode = extractFloorCode(location);
  const targetName = extractTargetName(location);

  // 해당 층이 사용 가능한지 확인 (hospitalInfo 없으면 모든 층 허용)
  const floorFileCode = floorCode === 'b1' ? 'b1f' : floorCode;
  const mapsAvailable = hospitalInfo?.mapsAvailable;
  if (mapsAvailable && !mapsAvailable.includes(floorFileCode)) {
    return null;
  }

  const imageUrl = getFloorImageUrl(floorCode);

  useEffect(() => {
    async function loadPin() {
      if (!floorCode || !targetName) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const pos = await findLocationFromAI(floorCode, targetName);
      setPinPosition(pos);
      setIsLoading(false);
    }
    loadPin();
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
    </div>
  );
}

export default FloorMapOverlay;
