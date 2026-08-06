// Amazon Bedrock AI를 통한 검사 위치 추측 서비스

const AI_API_URL = 'https://euh2dnu6ybhvo5kay6dof4h7ke0qrmzj.lambda-url.us-east-1.on.aws/';

// AI에게 검사 위치를 물어보기
export async function predictExamLocation(examName, department) {
  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examName, department }),
    });

    if (!response.ok) throw new Error(`AI API 오류: ${response.status}`);

    const data = await response.json();
    // 응답: { floor: "2층", location: "2층 채혈실", confidence: "high" }
    return data;
  } catch (err) {
    console.error('AI 위치 추측 실패:', err);
    return null;
  }
}
