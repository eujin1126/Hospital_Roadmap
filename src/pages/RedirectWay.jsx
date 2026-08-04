import { useEffect } from 'react';

function RedirectWay() {
  useEffect(() => {
    window.location.href = 'https://mm80.github.io/way4/';
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <p>병원 가이드로 이동 중...</p>
    </div>
  );
}

export default RedirectWay;
