import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './GuideManagement.css';

const ITEMS_PER_PAGE = 6;

function GuideManagement() {
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();
  const { allAppointments, isLoading } = useData();

  // 필터 상태
  const [filterDate, setFilterDate] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterTimeFrom, setFilterTimeFrom] = useState('');
  const [filterTimeTo, setFilterTimeTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 안내문 상태 분류
  const completedGuides = allAppointments.filter(a => a.guideStatus === '생성');
  const pendingGuides = allAppointments.filter(a => a.guideStatus === '미생성');

  // 진료과 목록
  const departments = useMemo(() => {
    const depts = [...new Set(allAppointments.map(a => a.department).filter(Boolean))];
    return depts.sort();
  }, [allAppointments]);

  // 현재 탭의 기본 목록
  const baseList = activeTab === 'completed' ? completedGuides : pendingGuides;

  // 필터 적용
  const filteredList = useMemo(() => {
    let list = baseList;
    if (filterDate) list = list.filter(a => a.visitDate === filterDate);
    if (filterDept) list = list.filter(a => a.department === filterDept);
    if (filterTimeFrom) list = list.filter(a => a.time >= filterTimeFrom);
    if (filterTimeTo) list = list.filter(a => a.time <= filterTimeTo);
    return list;
  }, [baseList, filterDate, filterDept, filterTimeFrom, filterTimeTo]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterDate('');
    setFilterDept('');
    setFilterTimeFrom('');
    setFilterTimeTo('');
    setCurrentPage(1);
  };

  if (isLoading) return <div className="guide-page"><p>데이터 로딩 중...</p></div>;

  return (
    <div className="guide-page">
      <h1 className="page-title">안내문 관리</h1>

      <div className="guide-tabs">
        <button
          className={`guide-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => handleTabChange('pending')}
        >
          안내문 미생성 ({pendingGuides.length})
        </button>
        <button
          className={`guide-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => handleTabChange('completed')}
        >
          안내문 생성 완료 ({completedGuides.length})
        </button>
      </div>

      {/* 필터 */}
      <div className="guide-filters">
        <div className="filter-row">
          <div className="filter-item">
            <label className="filter-label">방문일</label>
            <input
              type="date"
              className="filter-input"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="filter-item">
            <label className="filter-label">진료과</label>
            <select
              className="filter-select"
              value={filterDept}
              onChange={(e) => { setFilterDept(e.target.value); setCurrentPage(1); }}
            >
              <option value="">전체</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">예약시간</label>
            <div className="filter-time-range">
              <input
                type="time"
                className="filter-input filter-time"
                value={filterTimeFrom}
                onChange={(e) => { setFilterTimeFrom(e.target.value); setCurrentPage(1); }}
              />
              <span className="filter-time-sep">~</span>
              <input
                type="time"
                className="filter-input filter-time"
                value={filterTimeTo}
                onChange={(e) => { setFilterTimeTo(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button className="filter-btn reset" onClick={handleResetFilters}>초기화</button>
          </div>
        </div>
        <p className="filter-result-count">검색 결과: {filteredList.length}건</p>
      </div>

      <table className="guide-table">
        <thead>
          <tr>
            <th>등록번호</th>
            <th>환자이름</th>
            <th>방문일</th>
            <th>예약시간</th>
            <th>진료과</th>
            <th>검사수</th>
            <th>상태</th>
            <th>안내문</th>
          </tr>
        </thead>
        <tbody>
          {paginatedList.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                조건에 맞는 환자가 없습니다.
              </td>
            </tr>
          )}
          {paginatedList.map(item => (
            <tr key={item.aptId}>
              <td>{item.patientId}</td>
              <td className="patient-name">{item.name}</td>
              <td>{item.visitDate}</td>
              <td>{item.time}</td>
              <td className="dept-text">{item.department}</td>
              <td>{item.examCount}건</td>
              <td>
                <span className={`status-badge ${item.guideStatus === '생성' ? 'confirmed' : 'pending'}`}>
                  {item.guideStatus}
                </span>
              </td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/ai-guide/${item.aptId}`)}
                >
                  자세히
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            ← 이전
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-num ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            다음 →
          </button>
        </div>
      )}
    </div>
  );
}

export default GuideManagement;
