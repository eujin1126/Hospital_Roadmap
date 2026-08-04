// 카카오톡 공유 서비스
// 사용하기 전 public/index.html에 카카오 SDK 스크립트 추가 필요
// 그리고 VITE_KAKAO_JS_KEY 환경변수 설정 필요

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY || '';

// 카카오 SDK 초기화
export function initKakao() {
  if (!KAKAO_JS_KEY) {
    console.warn('카카오 JavaScript 키가 설정되지 않았습니다.');
    return false;
  }
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
  }
  return window.Kakao?.isInitialized() || false;
}

// 카카오톡으로 안내문 공유
export function shareViaKakao({ patientName, hospitalName, examDate, pdfUrl }) {
  if (!window.Kakao?.isInitialized()) {
    alert('카카오톡 공유 기능이 초기화되지 않았습니다.\n카카오 개발자 앱 설정이 필요합니다.');
    return;
  }

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `${hospitalName} 검사 안내문`,
      description: `${patientName}님의 검사 안내문이 준비되었습니다.\n방문일: ${examDate}`,
      imageUrl: 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/knuh-logo.png',
      link: {
        mobileWebUrl: pdfUrl || window.location.href,
        webUrl: pdfUrl || window.location.href,
      },
    },
    buttons: [
      {
        title: '검사 안내문 확인하기',
        link: {
          mobileWebUrl: pdfUrl || window.location.href,
          webUrl: pdfUrl || window.location.href,
        },
      },
    ],
  });
}
