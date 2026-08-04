// 카카오톡 공유 서비스

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
export function shareViaKakao({ patientName, hospitalName, examDate, guideUrl, wayUrl }) {
  if (!window.Kakao?.isInitialized()) {
    alert('카카오톡 공유 기능이 초기화되지 않았습니다.\n카카오 개발자 앱 설정이 필요합니다.');
    return;
  }

  const description = `접수가 완료되었습니다!\n\n검사 안내문을 확인하려면 아래의 'PDF 검사 안내문' 버튼을 눌러 파일을 확인하거나 다운로드해 주세요.\n\n병원 내부의 구체적인 검사실 위치와 이동 경로 안내가 필요하다면 '병원 가이드 시작' 버튼을 눌러 길 안내를 진행해 주세요.`;

  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `[${hospitalName}] ${patientName}님 검사 안내`,
      description: description,
      imageUrl: 'https://hospital-demo-data-6zo.s3.us-east-1.amazonaws.com/knuh-logo.png',
      link: {
        mobileWebUrl: guideUrl,
        webUrl: guideUrl,
      },
    },
    buttons: [
      {
        title: 'PDF 검사 안내문',
        link: {
          mobileWebUrl: guideUrl,
          webUrl: guideUrl,
        },
      },
      {
        title: '병원 가이드 시작',
        link: {
          mobileWebUrl: wayUrl,
          webUrl: wayUrl,
        },
      },
    ],
  });
}
