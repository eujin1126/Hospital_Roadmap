import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!employeeId) {
      setError('사번을 입력하세요.');
      return;
    }
    const success = login(employeeId, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('사번 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏥</div>
        </div>
        <h1 className="login-title">병원길잡이</h1>
        <p className="login-subtitle">병원길잡이 이용을 위한 로그인이 필요합니다.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">사번</label>
            <input
              type="text"
              className="form-input"
              placeholder="사번을 입력하세요"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-input"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn">로그인</button>
        </form>

        <div className="login-test-info">
          <p className="test-title">테스트 계정</p>
          <p className="test-detail">사번: EMP2024001 | 비밀번호: 아무 값 입력</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
