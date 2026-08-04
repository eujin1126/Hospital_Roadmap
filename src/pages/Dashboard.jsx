import { weeklyAppointments, hourlyDistribution, monthlyPatients, departmentStats, todayAppointments } from '../data/mockData';
import './Dashboard.css';

function Dashboard() {
  const todayStats = {
    totalAppointments: todayAppointments.length,
    waiting: 6,
    pendingGuides: todayAppointments.filter(a => a.guideStatus === '미생성').length,
    printed: todayAppointments.filter(a => a.printStatus === '출력됨').length,
  };

  const maxWeekly = Math.max(...weeklyAppointments.map(d => d.count));
  const maxMonthly = Math.max(...monthlyPatients.map(d => d.count));

  return (
    <div className="dashboard">
      <h1 className="page-title">대시보드</h1>
      <p className="page-subtitle">오늘의 현시 현황과 통계를 한눈에 확인할 수 있습니다.</p>

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
                  className={`bar ${item.day === '화' ? 'bar-active' : ''}`}
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
            {hourlyDistribution.map((item, idx) => (
              <div key={idx} className="h-bar-item">
                <span className="h-bar-time">{item.time}</span>
                <div className="h-bar-track">
                  <div
                    className="h-bar-fill"
                    style={{ width: `${(item.count / 3) * 100}%` }}
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
        <div className="chart-card chart-wide">
          <h3 className="chart-title">2026년 월별 환자 수 추이</h3>
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

        <div className="chart-card">
          <h3 className="chart-title">오늘 진료과별 현황</h3>
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
