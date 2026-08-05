import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './Calendar.css';

function Calendar() {
  const { calendarData, allAppointments, isLoading } = useData();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // 2026년 8월
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const today = new Date();
  const isToday = (day) => {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  const getDateStr = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getAppointmentCount = (day) => {
    return calendarData[getDateStr(day)] || 0;
  };

  // 선택한 날짜의 예약 환자 목록
  const selectedDateStr = selectedDay ? getDateStr(selectedDay) : null;
  const selectedPatients = selectedDateStr
    ? allAppointments.filter(a => a.visitDate === selectedDateStr)
    : [];

  const formatSelectedDate = () => {
    if (!selectedDay) return '';
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const d = new Date(year, month, selectedDay);
    return `${year}년 ${month + 1}월 ${selectedDay}일 (${days[d.getDay()]})`;
  };

  const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const count = getAppointmentCount(day);
    const dayOfWeek = new Date(year, month, day).getDay();
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    const isSelected = selectedDay === day;

    cells.push(
      <div
        key={day}
        className={`calendar-cell ${isToday(day) ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => setSelectedDay(day)}
      >
        <span className={`cell-day ${isSunday ? 'sunday' : ''} ${isSaturday ? 'saturday' : ''}`}>
          {day}
          {isToday(day) && <span className="today-label"> 오늘</span>}
        </span>
        {count > 0 && (
          <span className={`cell-count ${count >= 10 ? 'high' : ''}`}>
            {count}건
          </span>
        )}
      </div>
    );
  }

  if (isLoading) return <div className="calendar-page"><p>데이터 로딩 중...</p></div>;

  return (
    <div className="calendar-page">
      <h1 className="page-title">예약 캘린더</h1>
      <p className="page-subtitle">날짜를 선택하면 해당 날짜의 예약 환자 목록을 확인할 수 있습니다.</p>

      <div className="calendar-combined-layout">
        {/* 왼쪽: 캘린더 */}
        <div className="calendar-left-panel">
          <div className="calendar-header">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <h2 className="cal-month-title">{year}년 {month + 1}월</h2>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>

          <div className="calendar-grid">
            {dayHeaders.map((day, idx) => (
              <div key={day} className={`calendar-day-header ${idx === 0 ? 'sunday' : ''} ${idx === 6 ? 'saturday' : ''}`}>
                {day}
              </div>
            ))}
            {cells}
          </div>
        </div>

        {/* 오른쪽: 예약 환자 목록 */}
        <div className="calendar-right-panel">
          <div className="patient-list-header">
            <h3 className="patient-list-title">
              {selectedDay ? `${formatSelectedDate()} 예약 환자 ${selectedPatients.length}명` : '날짜를 선택하세요'}
            </h3>
          </div>

          {!selectedDay && (
            <div className="no-date-selected">
              <span className="no-date-icon">📅</span>
              <p>캘린더에서 날짜를 클릭하면<br/>해당 날짜의 예약 환자 목록이 표시됩니다.</p>
            </div>
          )}

          {selectedDay && selectedPatients.length === 0 && (
            <div className="no-date-selected">
              <span className="no-date-icon">📭</span>
              <p>해당 날짜에 예약된 환자가 없습니다.</p>
            </div>
          )}

          {selectedDay && selectedPatients.length > 0 && (
            <table className="cal-patient-table">
              <thead>
                <tr>
                  <th>접수번호</th>
                  <th>환자이름</th>
                  <th>예약시간</th>
                  <th>진료과</th>
                  <th>검사수</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {selectedPatients.map(apt => (
                  <tr key={apt.aptId}>
                    <td>{apt.patientId}</td>
                    <td>
                      <div className="cal-patient-name">{apt.name}</div>
                      <div className="cal-patient-sub">{apt.gender} / 만 {apt.age}세</div>
                    </td>
                    <td>{apt.time}</td>
                    <td>{apt.department}</td>
                    <td>{apt.examCount}건</td>
                    <td>
                      <button
                        className="cal-detail-btn"
                        onClick={() => navigate(`/patient/${apt.aptId}`)}
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
