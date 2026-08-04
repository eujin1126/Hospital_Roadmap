import { useAuth } from '../context/AuthContext';
import { settings } from '../data/mockData';
import './Settings.css';

function Settings() {
  const { user } = useAuth();

  return (
    <div className="settings-page">
      <h1 className="page-title">설정</h1>

      <div className="settings-section">
        <h2 className="settings-section-title">계정 정보</h2>
        <div className="settings-grid">
          <div className="settings-item">
            <span className="settings-label">이름</span>
            <span className="settings-value">{user?.name}</span>
          </div>
          <div className="settings-item">
            <span className="settings-label">사번</span>
            <span className="settings-value">{user?.employeeId}</span>
          </div>
          <div className="settings-item">
            <span className="settings-label">부서</span>
            <span className="settings-value">{user?.department}</span>
          </div>
          <div className="settings-item">
            <span className="settings-label">직책</span>
            <span className="settings-value">{user?.position}</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">안내문 설정</h2>

        <div className="settings-row">
          <div className="settings-row-left">
            <h3 className="settings-row-title">병원명</h3>
            <p className="settings-row-desc">안내문에 표시되는 병원 이름</p>
          </div>
          <span className="settings-row-value">{settings.hospitalName}</span>
        </div>

        <div className="settings-row">
          <div className="settings-row-left">
            <h3 className="settings-row-title">문의 전화번호</h3>
            <p className="settings-row-desc">안내문 하단에 표시되는 번호</p>
          </div>
          <span className="settings-row-value">{settings.phone}</span>
        </div>

        <div className="settings-row">
          <div className="settings-row-left">
            <h3 className="settings-row-title">QR 코드 연동</h3>
            <p className="settings-row-desc">환자별 연결 QR 코드 포함 여부</p>
          </div>
          <span className="settings-row-value">{settings.qrEnabled ? '활성' : '비활성'}</span>
        </div>

        <div className="settings-row">
          <div className="settings-row-left">
            <h3 className="settings-row-title">기본 인쇄 크기</h3>
            <p className="settings-row-desc">안내문 인쇄 시 기본 글씨 크기</p>
          </div>
          <span className="settings-row-value">{settings.defaultFontSize} (기본)</span>
        </div>
      </div>
    </div>
  );
}

export default Settings;
