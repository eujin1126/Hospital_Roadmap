import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './PrintHistory.css';

function PrintHistory() {
  const navigate = useNavigate();
  const { allAppointments, isLoading } = useData();

  if (isLoading) return <div className="print-history-page"><p>데이터 로딩 중...</p></div>;

  const printed = allAppointments.filter(a => a.printStatus === '출력됨');
  const notPrinted = allAppointments.filter(a => a.printStatus !== '출력됨');

  return (
    <div className="print-history-page">
      <h1 className="page-title">출력 이력</h1>
      <p className="print-summary">
        출력 완료 {printed.length}건 / 미출력 {notPrinted.length}건
      </p>

      <div className="print-section">
        <h2 className="print-section-title">출력 완료</h2>
        {printed.length === 0 && <p style={{color:'#94a3b8',fontSize:'14px'}}>출력 완료된 안내문이 없습니다.</p>}
        {printed.map((item, idx) => (
          <div key={idx} className="print-card">
            <div className="print-card-left">
              <span className="print-badge done">출력됨</span>
              <span className="print-name">{item.name}</span>
              <span className="print-detail">{item.department} | {item.time}</span>
            </div>
            <div className="print-card-right">
              <span>{item.visitDate}</span>
              <button className="reprint-btn">재출력</button>
            </div>
          </div>
        ))}
      </div>

      <div className="print-section">
        <h2 className="print-section-title">미출력</h2>
        {notPrinted.length === 0 && <p style={{color:'#94a3b8',fontSize:'14px'}}>미출력 안내문이 없습니다.</p>}
        {notPrinted.map((item, idx) => (
          <div key={idx} className="print-card">
            <div className="print-card-left">
              <span className="print-badge not-done">미출력</span>
              <span className="print-name">{item.name}</span>
              <span className="print-detail">{item.department} | {item.time}</span>
            </div>
            <div className="print-card-right">
              <button
                className="detail-link"
                onClick={() => navigate(`/ai-guide/${item.aptId}`)}
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
