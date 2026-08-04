import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import './Sidebar.css';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', { hour12: false });
  };

  const formatDate = (date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}`;
  };

  const menuItems = [
    { path: '/dashboard', label: '대시보드' },
    { path: '/patients', label: '전체 환자 목록' },
    { path: '/calendar', label: '예약 캘린더' },
    { path: '/guides', label: '안내문 관리' },
    { path: '/today', label: '오늘 예약 환자' },
    { path: '/print-history', label: '출력 이력' },
    { path: '/settings', label: '설정' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">
            <span className="logo-emoji">🚩</span>
          </div>
          <div>
            <h2 className="logo-title">병원길잡이</h2>
            <p className="logo-subtitle">병원 안내 및 예약 관리 시스템</p>
          </div>
        </div>
      </div>

      <div className="sidebar-time">
        <div className="time-display">{formatTime(currentTime)}</div>
        <div className="date-display">{formatDate(currentTime)}</div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0)}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
      </div>
    </aside>
  );
}

export default Sidebar;
