import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchPatientData, transformPatientData } from '../services/s3DataService';
import FloorMapOverlay from '../components/FloorMapOverlay';
import hospitalConfig from '../data/hospitalConfig';
import './AIGuideGenerate.css';

// 검사별 안내 데이터 생성
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
  const [detail, setDetail] = useState(null);
  const [guideExams, setGuideExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hospitalInfo, setHospitalInfo] = useState(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // 모든 병원의 CSV 파일 시도
        const hospitalEntries = Object.entries(hospitalConfig);
        let foundDetail = null;

        for (const [empId, config] of hospitalEntries) {
          try {
            const rawData = await fetchPatientData(config.csvFileName);
            const transformed = transformPatientData(rawData);
            if (transformed.patientDetails[aptId]) {
              foundDetail = transformed.patientDetails[aptId];
              setHospitalInfo(config);
              break;
            }
          } catch (e) {
            continue;
          }
        }

        if (foundDetail) {
          setDetail(foundDetail);
          setGuideExams(generateGuideData(foundDetail));
        }
      } catch (err) {
        console.error('데이터 로드 실패:', err);
      }
      setIsLoading(false);
    }
    loadData();
  }, [aptId]);

  if (isLoading) {
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

  if (!detail) {
    return (
      <div className="ai-guide-page" style={{ margin: '0 auto', padding: '40px', maxWidth: '900px' }}>
        <p>해당 안내문을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { basicInfo, appointmentInfo } = detail;

  return (
    <div className="ai-guide-page" style={{ margin: '0 auto', padding: '20px', maxWidth: '900px' }}>
      <div className="guide-doc" id="guide-doc-content">
        {/* 문서 헤더 */}
        <div className="guide-doc-header" style={{ justifyContent: 'center' }}>
          <div className="hospital-logo-area">
            <img src={hospitalInfo?.logo || '/knuh-logo.svg'} alt={hospitalInfo?.hospitalName || '병원'} className="hospital-full-logo" />
            <span className="hospital-name-text">{hospitalInfo?.hospitalName || ''}</span>
          </div>
        </div>
        <div className="guide-doc-type-row">
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

            {/* 층별 안내도 */}
            <FloorMapOverlay location={exam.location} examName={exam.name} hospitalInfoOverride={hospitalInfo} />
          </div>
        ))}

        {/* 문서 하단 */}
        <div className="guide-doc-footer">
          <div className="guide-footer-left">
            <span>📞 문의: 원무과 (내선 1번)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicGuide;
