import { useState } from 'react';
import { calendarData } from '../data/mockData';
import './Calendar.css';

// 날짜별 예약 상세 목록 (mock)
const appointmentsByDate = {
  '2026-08-04': [
    { time: '09:00', name: '이*준', department: '내과', doctor: '김철수 교수', status: '확정' },
    { time: '09:30', name: '김*진', department: '소화기내과', doctor: '박영희 교수', status: '확정' },
    { time: '10:00', name: '박*호', department: '외과', doctor: '이상민 교수', status: '대기' },
    { time: '10:30', name: '장*늘', department: '성형외과', doctor: '최지우 교수', status: '확정' },
    { time: '11:00', name: '최*현', department: '소화기내과', doctor: '박영희 교수', status: '대기' },
    { time: '13:00', name: '한*울', department: '내분비내과', doctor: '정민호 교수', status: '확정' },
    { time: '14:00', name: '윤*석', department: '호흡기내과', doctor: '강유진 교수', status: '확정' },
    { time: '14:30', name: '송*래', department: '산부인과', doctor: '임수현 교수', status: '확정' },
  ],
  '2026-08-05': [
    { time: '09:00', name: '김*수', department: '정형외과', doctor: '한민수 교수', status: '확정' },
    { time: '09:30', name: '이*영', department: '내과', doctor: '김철수 교수', status: '확정' },
    { time: '10:00', name: '박*진', department: '외과', doctor: '이상민 교수', status: '대기' },
    { time: '10:30', name: '최*리', department: '안과', doctor: '윤서진 교수', status: '확정' },
    { time: '11:00', name: '강*호', department: '이비인후과', doctor: '김하늘 교수', status: '확정' },
    { time: '13:00', name: '윤*정', department: '내과', doctor: '김철수 교수', status: '대기' },
    { time: '13:30', name: '한*미', department: '피부과', doctor: '조은비 교수', status: '확정' },
    { time: '14:00', name: '임*준', department: '소화기내과', doctor: '박영희 교수', status: '확정' },
    { time: '14:30', name: '정*원', department: '호흡기내과', doctor: '강유진 교수', status: '대기' },
    { time: '15:00', name: '서*아', department: '산부인과', doctor: '임수현 교수', status: '확정' },
    { time: '15:30', name: '조*현', department: '내분비내과', doctor: '정민호 교수', status: '확정' },
  ],
  '2026-08-09': [
    { time: '09:00', name: '김*호', department: '내과', doctor: '김철수 교수', status: '확정' },
    { time: '09:30', name: '이*진', department: '외과', doctor: '이상민 교수', status: '확정' },
    { time: '10:00', name: '박*서', department: '소화기내과', doctor: '박영희 교수', status: '대기' },
    { time: '10:30', name: '최*윤', department: '성형외과', doctor: '최지우 교수', status: '확정' },
    { time: '11:00', name: '한*준', department: '정형외과', doctor: '한민수 교수', status: '확정' },
    { time: '13:00', name: '강*미', department: '안과', doctor: '윤서진 교수', status: '확정' },
    { time: '13:30', name: '윤*석', department: '이비인후과', doctor: '김하늘 교수', status: '대기' },
    { time: '14:00', name: '임*영', department: '피부과', doctor: '조은비 교수', status: '확정' },
    { time: '14:30', name: '정*수', department: '내과', doctor: '김철수 교수', status: '확정' },
    { time: '15:00', name: '서*호', department: '호흡기내과', doctor: '강유진 교수', status: '확정' },
    { time: '15:30', name: '조*아', department: '산부인과', doctor: '임수현 교수', status: '대기' },
    { time: '16:00', name: '송*진', department: '내분비내과', doctor: '정민호 교수', status: '확정' },
    { time: '16:30', name: '노*현', department: '소화기내과', doctor: '박영희 교수', status: '확정' },
    { time: '17:00', name: '유*원', department: '외과', doctor: '이상민 교수', status: '확정' },
    { time: '17:30', name: '배*리', department: '내과', doctor: '김철수 교수', status: '대기' },
  ],
};

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // 2026년 8월
  const [selectedDay, setSelectedDay] = useState(4); // 기본 선택: 4일

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

  const getAppointmentCount = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData[dateStr] || 0;
  };

  const getSelectedDateStr = () => {
    if (!selectedDay) return null;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  };

  const selectedDateStr = getSelectedDateStr();
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

  return (
    <div className="calendar-page">
      <h1 className="page-title">예약 캘린더</h1>

      <div className="calendar-layout">
        {/* 왼쪽: 캘린더 */}
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

        {/* 오른쪽: 예약 목록 */}
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
                    <div className="apt-detail">{apt.department} · {apt.doctor}</div>
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
