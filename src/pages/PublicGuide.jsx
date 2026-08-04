import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { settings } from '../data/mockData';
import './AIGuideGenerate.css';

// 검사별 안내 데이터 생성 (AI 시뮬레이션)
const generateGuideData = (detail) => {
  if (!detail) return null;
  return detail.exams.map(exam => ({
    ...exam,
    guideInfo: {
      floor: exam.location.split(' ')[0] || '1층',
      prep: exam.description.includes('금식') ? ['금식 유지'] : [],
      caution: [],
      mapNodes: [
        { type: 'start', label: '현재 위치' },
        { type: 'elevator', label: '이동' },
        { type: 'destination', label: exam.location || '검사실' }
      ],
      direction: `${exam.location}로 이동해주세요.`,
      waitCount: Math.floor(Math.random() * 12) + 3
    }
  }));
};

function PublicGuide() {
  const { aptId } = useParams();
  const { patientDetails, isLoading } = useData();
  const [guideExams, setGuideExams] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);

  const detail = patientDetails[aptId];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (detail) {
        setGuideExams(generateGuideData(detail));
      }
      setIsGenerating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [aptId, detail]);

  if (isLoading) {
    return (
      <div className="ai-guide-page" style={{ margin: '0 auto', padding: '40px', maxWidth: '900px' }}>
        <p>데이터 로딩 중...</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="ai-guide-page" style={{ margin: '0 auto', padding: '40px', maxWidth: '900px' }}>
        <p>해당 안내문을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { basicInfo, appointmentInfo } = detail;

  if (isGenerating) {
    return (
      <div className="ai-guide-page" style={{ margin: '0 auto', padding: '40px', maxWidth: '900px' }}>
        <div className="guide-doc">
          <div className="generating-overlay">
            <div className="generating-spinner"></div>
            <p className="generating-text">검사 안내문을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-guide-page" style={{ margin: '0 auto', padding: '20px', maxWidth: '900px' }}>
      <div className="guide-doc" id="guide-doc-content">
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
        <div className="guide-exam-title">검사 순서 (총 {guideExams.length}건)</div>

        {guideExams.map((exam, idx) => (
          <div key={idx} className="guide-exam-card">
            <div className="guide-exam-card-header">
              <span className="guide-exam-number">{exam.order}. {exam.name}</span>
              <div>
                <span className="guide-exam-location">📍 {exam.location}</span>
                <span className="guide-exam-wait">| 대기 {exam.guideInfo.waitCount}명</span>
              </div>
            </div>

            {exam.guideInfo.prep.length > 0 && (
              <div className="guide-prep-section">
                {exam.guideInfo.prep.map((p, i) => (
                  <div key={i} className="guide-prep-item">
                    <span className="guide-prep-check">✅</span>
                    <span><strong>준비:</strong> {p}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="guide-map-container">
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span className="guide-map-title">{exam.guideInfo.floor} 안내도</span>
              </div>
              <div className="guide-map-flow">
                {exam.guideInfo.mapNodes.map((node, i) => (
                  <span key={i} style={{ display: 'contents' }}>
                    <div className={`guide-map-node ${node.type}`}>
                      {node.label}
                    </div>
                    {i < exam.guideInfo.mapNodes.length - 1 && (
                      <span className="guide-map-arrow">- - - →</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="guide-direction">
              <span className="guide-direction-icon">🚶</span>
              <strong>이동 안내: </strong>{exam.guideInfo.direction}
            </div>
          </div>
        ))}

        {/* 문서 하단 */}
        <div className="guide-doc-footer">
          <div className="guide-footer-left">
            <span>📞 문의: 원무과 (내선 1번) / {settings.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicGuide;
