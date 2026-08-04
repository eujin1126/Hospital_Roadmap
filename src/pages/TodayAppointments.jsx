import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './TodayAppointments.css';

function TodayAppointments() {
  const navigate = useNavigate();
  const { todayAppointments, isLoading } = useData();

  if (isLoading) return <div className="today-page"><p>데이터 로딩 중...</p></div>;

  return (
    <div className="today-page">
      <h1 className="page-title">오늘 예약 환자</h1>
      <p className="page-subtitle">오늘 예약된 환자 {todayAppointments.length}명의 목록입니다.</p>

      <table className="today-table">
        <thead>
          <tr>
            <th>접수번호</th>
            <th>환자이름</th>
            <th>생년월일</th>
            <th>예약시간</th>
            <th>진료과</th>
            <th>검사수</th>
            <th>안내문</th>
            <th>출력</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {todayAppointments.map(apt => (
            <tr key={apt.aptId}>
              <td>{apt.aptId}</td>
              <td className="patient-name">{apt.name}</td>
              <td>{apt.birthDate}</td>
              <td>{apt.time}</td>
              <td className="dept-text">{apt.department}</td>
              <td>{apt.examCount}건</td>
              <td>
                <span className={`guide-status ${
                  apt.guideStatus === '확정됨' ? 'completed' :
                  apt.guideStatus === '확인 필요' ? 'needed' : 'not-created'
                }`}>
                  {apt.guideStatus}
                </span>
              </td>
              <td>
                <span className={`print-status ${apt.printStatus === '출력됨' ? 'printed' : 'not-printed'}`}>
                  {apt.printStatus}
                </span>
              </td>
              <td>
                <button
                  className="action-btn"
                  onClick={() => navigate(`/patient/${apt.aptId}`)}
                >
                  상세
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TodayAppointments;
