import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './PatientDetail.css';

function PatientDetail() {
  const { aptId } = useParams();
  const navigate = useNavigate();
  const { patientDetails, isLoading } = useData();

  if (isLoading) return <div className="patient-detail-page"><p>데이터 로딩 중...</p></div>;

  const detail = patientDetails[aptId];

  if (!detail) {
    return (
      <div className="patient-detail-page">
        <div className="detail-header">
          <div className="detail-header-left">
            <span className="back-link" onClick={() => navigate(-1)}>← 목록으로</span>
            <h1 className="page-title">환자 상세 정보</h1>
          </div>
        </div>
        <p>해당 환자 정보를 찾을 수 없습니다. (접수번호: {aptId})</p>
      </div>
    );
  }

  const { basicInfo, appointmentInfo, preExamChecks, exams } = detail;

  return (
    <div className="patient-detail-page">
      <div className="detail-header">
        <div className="detail-header-left">
          <span className="back-link" onClick={() => navigate(-1)}>← 목록으로</span>
          <h1 className="page-title">환자 상세 정보</h1>
        </div>
        <button className="ai-guide-btn" onClick={() => navigate(`/ai-guide/${aptId}`)}>
          ✨ AI 안내문 생성
        </button>
      </div>

      <div className="detail-cards">
        <div className="detail-card">
          <h3 className="detail-card-title">환자 기본 정보</h3>
          <div className="patient-name-large">
            {basicInfo.name}
            <span className="patient-gender-age">
              <span className="patient-gender-badge">{basicInfo.gender}</span>
              {basicInfo.age}세
            </span>
          </div>
          <div className="detail-grid">
            <div className="detail-field">
              <span className="detail-field-label">생년월일</span>
              <span className="detail-field-value">{basicInfo.birthDate}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">접수번호</span>
              <span className="detail-field-value">{basicInfo.aptId}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">등록번호</span>
              <span className="detail-field-value">{basicInfo.registrationId}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">연락처</span>
              <span className="detail-field-value">{basicInfo.phone}</span>
            </div>
            <div className="detail-field" style={{ gridColumn: 'span 2' }}>
              <span className="detail-field-label">보호자</span>
              <span className="detail-field-value">{basicInfo.guardian}</span>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h3 className="detail-card-title">오늘 예약 정보</h3>
          <div className="detail-grid">
            <div className="detail-field">
              <span className="detail-field-label">예약일</span>
              <span className="detail-field-value">{appointmentInfo.date}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">예약시간</span>
              <span className="detail-field-value">{appointmentInfo.time}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">진료과</span>
              <span className="detail-field-value" style={{ color: '#4f8cff' }}>{appointmentInfo.department}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">담당 의료진</span>
              <span className="detail-field-value">{appointmentInfo.doctor}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">예상 소요시간</span>
              <span className="detail-field-value">{appointmentInfo.estimatedTime}</span>
            </div>
            <div className="detail-field">
              <span className="detail-field-label">보험 구분</span>
              <span className="detail-field-value">{appointmentInfo.insuranceType}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pre-exam-section">
        <h3 className="pre-exam-title">검사 전 확인사항</h3>
        <div className="pre-exam-grid">
          <div className="pre-exam-item">
            <div className="pre-exam-label">금식 여부</div>
            <span className={`pre-exam-status ${preExamChecks.fasting.status.includes('필요') ? 'required' : 'none'}`}>
              {preExamChecks.fasting.status}
            </span>
            <span className="pre-exam-detail">{preExamChecks.fasting.detail}</span>
          </div>
          <div className="pre-exam-item">
            <div className="pre-exam-label">알레르기</div>
            <span className={`pre-exam-status ${preExamChecks.allergy.status === '없음' ? 'none' : 'required'}`}>
              {preExamChecks.allergy.status}
            </span>
            <span className="pre-exam-detail">{preExamChecks.allergy.detail}</span>
          </div>
          <div className="pre-exam-item">
            <div className="pre-exam-label">조영제 사용</div>
            <span className={`pre-exam-status ${preExamChecks.contrastAgent.status === '해당 없음' ? 'none' : 'required'}`}>
              {preExamChecks.contrastAgent.status}
            </span>
            <span className="pre-exam-detail">{preExamChecks.contrastAgent.detail}</span>
          </div>
          <div className="pre-exam-item">
            <div className="pre-exam-label">MRI 금속 여부</div>
            <span className={`pre-exam-status ${preExamChecks.mriMetal.status === '해당 없음' ? 'none' : 'required'}`}>
              {preExamChecks.mriMetal.status}
            </span>
            <span className="pre-exam-detail">{preExamChecks.mriMetal.detail}</span>
          </div>
          <div className="pre-exam-item">
            <div className="pre-exam-label">기타 주의사항</div>
            <span className={`pre-exam-status ${preExamChecks.others.status === '없음' ? 'none' : 'required'}`}>
              {preExamChecks.others.status}
            </span>
            <span className="pre-exam-detail">{preExamChecks.others.detail}</span>
          </div>
        </div>
      </div>

      <div className="exam-section">
        <h3 className="exam-section-title">검사 순서 (총 {exams.length}건)</h3>
        <div className="exam-list">
          {exams.map(exam => (
            <div key={exam.order} className="exam-item">
              <div className="exam-number">{exam.order}</div>
              <div className="exam-info">
                <div className="exam-name">{exam.name}</div>
                <div className="exam-desc">{exam.description}</div>
              </div>
              <div className="exam-meta">
                <span className="exam-location">📍 {exam.location}</span>
                <span className="exam-wait">⏱ {exam.waitTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PatientDetail;
