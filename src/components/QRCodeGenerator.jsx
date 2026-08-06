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

  // QR 데이터: 병원 가이드 웹페이지 URL에 예약번호 포함
  const qrData = `http://hospital-demo-data-6zo.s3-website-us-east-1.amazonaws.com/?reservationId=${encodeURIComponent(reservationId)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

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
