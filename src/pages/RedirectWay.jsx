import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function RedirectWay() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const reservationId = searchParams.get('reservationId');
    if (reservationId) {
      window.location.href = `https://mm80.github.io/wa1/?reservationId=${encodeURIComponent(reservationId)}`;
    } else {
      window.location.href = 'https://mm80.github.io/wa1/';
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <p>병원 가이드로 이동 중...</p>
    </div>
  );
}

export default RedirectWay;
