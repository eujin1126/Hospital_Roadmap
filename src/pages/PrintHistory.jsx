import { useNavigate } from 'react-router-dom';
import { printHistory } from '../data/mockData';
import './PrintHistory.css';

function PrintHistory() {
  const navigate = useNavigate();

  return (
    <div className="print-history-page">
      <h1 className="page-title">출력 이력</h1>
      <p className="print-summary">
        출력 완료 {printHistory.completed.length}건 / 미출력 {printHistory.pending.length}건
      </p>

      <div className="print-section">
        <h2 className="print-section-title">출력 완료</h2>
        {printHistory.completed.map((item, idx) => (
          <div key={idx} className="print-card">
            <div className="print-card-left">
              <span className="print-badge done">출력됨</span>
              <span className="print-name">{item.name}</span>
              <span className="print-detail">{item.department} | {item.time}</span>
            </div>
            <div className="print-card-right">
              <span>출력: {item.printDate}</span>
              <button className="reprint-btn">재출력</button>
            </div>
          </div>
        ))}
      </div>

      <div className="print-section">
        <h2 className="print-section-title">미출력</h2>
        {printHistory.pending.map((item, idx) => (
          <div key={idx} className="print-card">
            <div className="print-card-left">
              <span className="print-badge not-done">미출력</span>
              <span className="print-name">{item.name}</span>
              <span className="print-detail">{item.department} | {item.time}</span>
            </div>
            <div className="print-card-right">
              <button
                className="detail-link"
                onClick={() => navigate(`/patient/APT-00${idx + 2}`)}
              >
                안내문 생성
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrintHistory;
