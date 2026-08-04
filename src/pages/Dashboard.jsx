import { useData } from '../context/DataContext';
import './Dashboard.css';

function Dashboard() {
  const { todayAppointments, allAppointments, departmentStats, calendarData, isLoading } = useData();

  if (isLoading) return <div className="dashboard"><p>데이터 로딩 중...</p></div>;

  const todayStats = {
    totalAppointments: todayAppointments.length,
    waiting: todayAppointments.filter(a => a.guideStatus === '미생성').length,
    pendingGuides: todayAppointments.filter(a => a.guideStatus === '미생성').length,
    printed: todayAppointments.filter(a => a.printStatus === '출력됨').length,
  };

  // 이번 주 예약 현황 계산
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
  const weeklyAppointments = weekDays.map((day, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    return { day, count: calendarData[dateStr] || 0 };
  });

  // 시간대별 예약 분포 (오늘 기준)
  const hourlyMap = {};
  todayAppointments.forEach(apt => {
    const hour = apt.time ? apt.time.substring(0, 5) : '기타';
    hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
  });
  const hourlyDistribution = Object.entries(hourlyMap)
    .map(([time, count]) => ({ time, count }))
    .sort((a, b) => a.time.localeCompare(b.time));

  // 월별 환자 수 (캘린더 데이터 기반)
  const monthlyMap = {};
  Object.entries(calendarData).forEach(([date, count]) => {
    const m = parseInt(date.split('-')[1]);
    const monthLabel = `${m}월`;
    monthlyMap[monthLabel] = (monthlyMap[monthLabel] || 0) + count;
  });
  const monthlyPatients = Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}월`,
    count: monthlyMap[`${i + 1}월`] || 0,
  })).filter(m => m.count > 0);

  const maxWeekly = Math.max(...weeklyAppointments.map(d => d.count), 1);
  const maxMonthly = Math.max(...monthlyPatients.map(d => d.count), 1);

  return (
    <div className="dashboard">
      <h1 className="page-title">대시보드</h1>
      <p className="page-subtitle">오늘의 현황과 통계를 한눈에 확인할 수 있습니다.</p>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-label">오늘 전체 예약</div>
          <div className="stat-value">{todayStats.totalAppointments}<span className="stat-unit">명</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">대기 환자</div>
          <div className="stat-value">{todayStats.waiting}<span className="stat-unit">명</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">안내문 미생성</div>
          <div className="stat-value">{todayStats.pendingGuides}<span className="stat-unit">건</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">출력 완료</div>
          <div className="stat-value">{todayStats.printed}<span className="stat-unit">건</span></div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">이번 주 예약 현황</h3>
          <div className="bar-chart">
            {weeklyAppointments.map((item, idx) => (
              <div key={idx} className="bar-item">
                <span className="bar-value">{item.count}</span>
                <div
                  className={`bar ${idx === dayOfWeek - 1 ? 'bar-active' : ''}`}
                  style={{ height: `${(item.count / maxWeekly) * 160}px` }}
                ></div>
                <span className="bar-label">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">오늘 시간대별 예약 분포</h3>
          <div className="horizontal-chart">
            {hourlyDistribution.length === 0 && <p style={{color:'#94a3b8',fontSize:'14px'}}>오늘 예약이 없습니다.</p>}
            {hourlyDistribution.map((item, idx) => (
              <div key={idx} className="h-bar-item">
                <span className="h-bar-time">{item.time}</span>
                <div className="h-bar-track">
                  <div
                    className="h-bar-fill"
                    style={{ width: `${(item.count / Math.max(...hourlyDistribution.map(h => h.count), 1)) * 100}%` }}
                  >
                    {item.count}명
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="charts-row">
        {monthlyPatients.length > 0 && (
          <div className="chart-card chart-wide">
            <h3 className="chart-title">월별 예약 현황</h3>
            <div className="bar-chart monthly-chart">
              {monthlyPatients.map((item, idx) => (
                <div key={idx} className="bar-item">
                  <span className="bar-value bar-value-small">{item.count}</span>
                  <div
                    className="bar bar-light"
                    style={{ height: `${(item.count / maxMonthly) * 140}px` }}
                  ></div>
                  <span className="bar-label bar-label-small">{item.month.replace('월', '')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="chart-card">
          <h3 className="chart-title">진료과별 현황</h3>
          <div className="dept-list">
            {departmentStats.map((item, idx) => (
              <div key={idx} className="dept-item">
                <span className="dept-name">{item.name}</span>
                <span className="dept-dots"></span>
                <span className="dept-count">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
