import { useState } from 'react';
import { useData } from '../context/DataContext';
import './Calendar.css';

function Calendar() {
  const { calendarData, appointmentsByDate, isLoading } = useData();
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

  const selectedDateStr = selectedDay ? getDateStr(selectedDay) : null;
  const selectedAppointments = selectedDateStr ? (appointmentsByDate[selectedDateStr] || []) : [];

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

      <div className="calendar-layout">
        <div className="calendar-left">
          <div className="calendar-header">
            <button className="cal-nav-btn" onClick={prevMonth}>← 이전</button>
            <h2 className="cal-month-title">{year}년 {month + 1}월</h2>
            <button className="cal-nav-btn" onClick={nextMonth}>다음 →</button>
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

        <div className="calendar-right">
          <div className="appointment-panel">
            <h3 className="panel-title">
              {selectedDay ? formatSelectedDate() : '날짜를 선택하세요'}
            </h3>
            {selectedDay && (
              <p className="panel-count">
                예약 {selectedAppointments.length}건
              </p>
            )}

            <div className="appointment-list">
              {!selectedDay && (
                <div className="no-selection">
                  <span className="no-selection-icon">📅</span>
                  <p>캘린더에서 날짜를 클릭하면<br/>해당 날짜의 예약 목록이 표시됩니다.</p>
                </div>
              )}
              {selectedDay && selectedAppointments.length === 0 && (
                <div className="no-selection">
                  <span className="no-selection-icon">📭</span>
                  <p>해당 날짜에 예약된 환자가 없습니다.</p>
                </div>
              )}
              {selectedAppointments.map((apt, idx) => (
                <div key={idx} className="appointment-item">
                  <div className="apt-time">{apt.time}</div>
                  <div className="apt-info">
                    <div className="apt-name">{apt.name}</div>
                    <div className="apt-detail">{apt.department}</div>
                  </div>
                  <span className={`apt-status ${apt.status === '확정' ? 'confirmed' : 'waiting'}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
