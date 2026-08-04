import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { todayAppointments } from '../data/mockData';
import './GuideManagement.css';

function GuideManagement() {
  const [activeTab, setActiveTab] = useState('completed');
  const navigate = useNavigate();

  const completedGuides = todayAppointments.filter(a => a.guideStatus === '확정됨');
  const pendingGuides = todayAppointments.filter(a => a.guideStatus === '확인 필요' || a.guideStatus === '미생성');

  const currentList = activeTab === 'completed' ? completedGuides : pendingGuides;

  return (
    <div className="guide-page">
      <h1 className="page-title">안내문 관리</h1>

      <div className="guide-tabs">
        <button
          className={`guide-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          안내문 생성 완료 ({completedGuides.length})
        </button>
        <button
          className={`guide-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          안내문 미생성 ({pendingGuides.length})
        </button>
      </div>

      <table className="guide-table">
        <thead>
          <tr>
            <th>접수번호</th>
            <th>환자이름</th>
            <th>예약시간</th>
            <th>진료과</th>
            <th>검사수</th>
            <th>상태</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentList.map(item => (
            <tr key={item.aptId}>
              <td>{item.aptId}</td>
              <td className="patient-name">{item.name}</td>
              <td>{item.time}</td>
              <td className="dept-text">{item.department}</td>
              <td>{item.examCount}건</td>
              <td>
                <span className={`status-badge ${
                  item.guideStatus === '확정됨' ? 'confirmed' :
                  item.guideStatus === '확인 필요' ? 'warning' : 'pending'
                }`}>
                  {item.guideStatus}
                </span>
              </td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/patient/${item.aptId}`)}
                >
                  면신
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GuideManagement;
