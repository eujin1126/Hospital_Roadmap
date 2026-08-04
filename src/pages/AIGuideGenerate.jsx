import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { settings } from '../data/mockData';
import './AIGuideGenerate.css';

// AI가 생성하는 안내문 데이터 (시뮬레이션)
const generateGuideData = (detail) => {
  if (!detail) return null;

  const mapData = {
    '혈액검사 (CBC)': {
      floor: '2층',
      prep: ['8시간 이상 금식'],
      caution: ['검사 당일 아침 물만 소량 허용'],
      mapNodes: [
        { type: 'start', label: '내과\n진료실' },
        { type: 'elevator', label: '엘리베이터' },
        { type: 'destination', label: '혈액검사실 A\n(검사실)' }
      ],
      direction: '원무과에서 엘리베이터를 이용해 2층으로 이동 후,\n우측에 있는 혈액검사실 A로 오세요.',
      waitCount: 12
    },
    '흉부 X-ray': {
      floor: '1층',
      prep: ['금속 장신구 제거', '상의를 검사복으로 교체'],
      caution: ['임신 가능성이 있는 경우 반드시 사전 고지'],
      mapNodes: [
        { type: 'start', label: '원무과\n(접수)' },
        { type: 'elevator', label: '엘리베이터' },
        { type: 'destination', label: '영상의학과\n(X-ray실)' }
      ],
      direction: '2층 검사 완료 후 엘리베이터를 이용해 1층으로 이동 후,\n우측에 있는 영상의학과(X-ray실)로 오세요.',
      waitCount: 7
    },
    '심전도 (ECG)': {
      floor: '3층',
      prep: ['편안한 복장 착용'],
      caution: ['검사 전 카페인 섭취 자제'],
      mapNodes: [
        { type: 'start', label: '심장\n내과' },
        { type: 'elevator', label: '엘리베이터' },
        { type: 'destination', label: '심장검사실\n(ECG)' }
      ],
      direction: '1층 검사 완료 후 엘리베이터를 이용해 3층으로 이동 후,\n우측에 있는 심장검사실로 오세요.',
      waitCount: 5
    },
    '복부 초음파': {
      floor: '2층',
      prep: ['6시간 이상 금식', '물 500ml 이상 섭취 (방광 충만)'],
      caution: ['검사 30분 전 물 섭취 권장'],
      mapNodes: [
        { type: 'start', label: '소화기내과\n진료실' },
        { type: 'elevator', label: '엘리베이터' },
        { type: 'destination', label: '초음파실\n(2층)' }
      ],
      direction: '원무과에서 엘리베이터를 이용해 2층으로 이동 후,\n좌측에 있는 초음파실로 오세요.',
      waitCount: 8
    },
    '혈액검사': {
      floor: '2층',
      prep: ['금식 유지'],
      caution: [],
      mapNodes: [
        { type: 'start', label: '초음파실' },
        { type: 'elevator', label: '복도 이동' },
        { type: 'destination', label: '혈액검사실 A' }
      ],
      direction: '초음파 검사 완료 후 같은 층 복도를 따라 혈액검사실 A로 이동하세요.',
      waitCount: 10
    }
  };

  return detail.exams.map(exam => ({
    ...exam,
    guideInfo: mapData[exam.name] || {
      floor: exam.location.split(' ')[0],
      prep: [],
      caution: [],
      mapNodes: [
        { type: 'start', label: '현재 위치' },
        { type: 'elevator', label: '이동' },
        { type: 'destination', label: exam.location }
      ],
      direction: `${exam.location}로 이동해주세요.`,
      waitCount: 5
    }
  }));
};

function AIGuideGenerate() {
  const { aptId } = useParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(true);
  const [guideExams, setGuideExams] = useState([]);
  const { patientDetails } = useData();

  const detail = patientDetails[aptId];

  useEffect(() => {
    // AI 생성 시뮬레이션 (2초 딜레이)
    const timer = setTimeout(() => {
      if (detail) {
        setGuideExams(generateGuideData(detail));
      }
      setIsGenerating(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [aptId]);

  if (!detail) {
    return (
      <div className="ai-guide-page">
        <p>해당 환자 정보를 찾을 수 없습니다.</p>
        <button className="guide-back-btn" onClick={() => navigate(-1)}>뒤로가기</button>
      </div>
    );
  }

  const { basicInfo, appointmentInfo } = detail;

  const handlePrint = () => {
    window.print();
  };

  if (isGenerating) {
    return (
      <div className="ai-guide-page">
        <div className="guide-doc">
          <div className="generating-overlay">
            <div className="generating-spinner"></div>
            <p className="generating-text">AI가 안내문을 생성하고 있습니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-guide-page">
      <div className="guide-actions">
        <button className="guide-back-btn" onClick={() => navigate(-1)}>← 돌아가기</button>
        <button className="guide-print-btn" onClick={handlePrint}>🖨️ 인쇄하기</button>
      </div>

      <div className="guide-doc">
        {/* 문서 헤더 */}
        <div className="guide-doc-header">
          <div className="hospital-logo-area">
            <img src="/knuh-logo.svg" alt="강원대학교병원" className="hospital-full-logo" />
          </div>
          <div className="guide-doc-type">검사 안내문</div>
        </div>

        {/* 환자 정보 바 */}
        <div className="guide-patient-info">
          <span><strong>환자명:</strong> {basicInfo.name} ({basicInfo.gender}/{basicInfo.age}세)</span>
          <span><strong>방문일:</strong> {appointmentInfo.date}</span>
          <span><strong>예약시간:</strong> {appointmentInfo.time}</span>
          <span><strong>진료과:</strong> {appointmentInfo.department}</span>
        </div>

        {/* 검사 순서 */}
        <div className="guide-exam-title">📋 검사 순서 (총 {guideExams.length}건)</div>

        {guideExams.map((exam, idx) => (
          <div key={idx} className="guide-exam-card">
            <div className="guide-exam-card-header">
              <span className="guide-exam-number">{exam.order}. {exam.name}</span>
              <div>
                <span className="guide-exam-location">📍 {exam.guideInfo.floor} {exam.location.includes('층') ? exam.location.substring(exam.location.indexOf(' ') + 1) : exam.location}</span>
                <span className="guide-exam-wait">| 대기 {exam.guideInfo.waitCount}명</span>
              </div>
            </div>

            {/* 준비사항 / 주의사항 */}
            {(exam.guideInfo.prep.length > 0 || exam.guideInfo.caution.length > 0) && (
              <div className="guide-prep-section">
                {exam.guideInfo.prep.length > 0 && (
                  <div>
                    {exam.guideInfo.prep.map((p, i) => (
                      <div key={i} className="guide-prep-item">
                        <span className="guide-prep-check">✅</span>
                        <span><strong>준비:</strong> {p}</span>
                      </div>
                    ))}
                  </div>
                )}
                {exam.guideInfo.caution.length > 0 && (
                  <div>
                    {exam.guideInfo.caution.map((c, i) => (
                      <div key={i} className="guide-prep-item">
                        <span className="guide-prep-warn">⚠️</span>
                        <span><strong>주의:</strong> {c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 안내도 */}
            <div className="guide-map-container">
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span className="guide-map-title">{exam.guideInfo.floor} 안내도</span>
              </div>
              <div className="guide-map-flow">
                {exam.guideInfo.mapNodes.map((node, i) => (
                  <span key={i} style={{ display: 'contents' }}>
                    <div className={`guide-map-node ${node.type}`}>
                      {node.label.split('\n').map((line, li) => (
                        <span key={li}>{line}{li < node.label.split('\n').length - 1 && <br/>}</span>
                      ))}
                    </div>
                    {i < exam.guideInfo.mapNodes.length - 1 && (
                      <span className="guide-map-arrow">- - - →</span>
                    )}
                  </span>
                ))}
                <span className="guide-map-people">🧑‍🤝‍🧑</span>
              </div>
            </div>

            {/* 이동 안내 */}
            <div className="guide-direction">
              <span className="guide-direction-icon">🚶</span>
              <strong>이동 안내: </strong>
              {exam.guideInfo.direction.split('\n').map((line, i) => (
                <span key={i}>{line}{i < exam.guideInfo.direction.split('\n').length - 1 && <br/>}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              ))}
            </div>
          </div>
        ))}

        {/* 문서 하단 */}
        <div className="guide-doc-footer">
          <div className="guide-footer-left">
            <span>📞 문의: 원무과 (내선 1번) / {settings.phone}</span>
            <span>|</span>
            <span>담당의: {appointmentInfo.doctor}</span>
          </div>
          <div className="guide-qr">
            QR코드<br/>환자편에서<br/>스캔하세요
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIGuideGenerate;
