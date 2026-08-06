import { QRCodeSVG } from 'qrcode.react';

/**
 * QR 코드 생성 컴포넌트
 * 
 * @param {string} reservationId - S3에서 가져온 예약번호
 * @param {string} token - (선택) 향후 보안 토큰 확장용
 * @param {number} size - QR 코드 크기 (기본 100)
 * @param {string} className - 추가 CSS 클래스
 */
function QRCodeGenerator({ reservationId, token, size = 100, className = '' }) {
  if (!reservationId) return null;

  // QR 데이터 생성 (향후 token 방식 확장 가능)
  const qrData = JSON.stringify({
    reservationId,
    ...(token && { token }),
    generatedAt: new Date().toISOString(),
  });

  return (
    <div className={`qr-code-container ${className}`}>
      <QRCodeSVG
        value={qrData}
        size={size}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
        includeMargin={false}
      />
    </div>
  );
}

export default QRCodeGenerator;
