import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './PrintHistory.css';
import './GuideManagement.css';

const ITEMS_PER_PAGE = 6;

function PrintHistory() {
  const navigate = useNavigate();
  const { allAppointments, isLoading } = useData();

  const [activeTab, setActiveTab] = useState('printed');
  const [filterDate, setFilterDate] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterTimeFrom, setFilterTimeFrom] = useState('');
  const [filterTimeTo, setFilterTimeTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const printedList = allAppointments.filter(a => a.printStatus === '출력');
  const notPrintedList = allAppointments.filter(a => a.printStatus !== '출력');

  const departments = useMemo(() => {
    const depts = [...new Set(allAppointments.map(a => a.department).filter(Boolean))];
    return depts.sort();
  }, [allAppointments]);

  const baseList = activeTab === 'printed' ? printedList : notPrintedList;

  const filteredList = useMemo(() => {
    let list = baseList;
    if (filterDate) list = list.filter(a => a.visitDate === filterDate);
    if (filterDept) list = list.filter(a => a.department === filterDept);
    if (filterTimeFrom) list = list.filter(a => a.time >= filterTimeFrom);
    if (filterTimeTo) list = list.filter(a => a.time <= filterTimeTo);
    return list;
  }, [baseList, filterDate, filterDept, filterTimeFrom, filterTimeTo]);

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

  if (isLoading) return <div className="print-history-page"><p>데이터 로딩 중...</p></div>;

  return (
    <div className="print-history-page guide-page">
      <h1 className="page-title">출력 이력</h1>

      <div className="guide-tabs">
        <button
          className={`guide-tab ${activeTab === 'printed' ? 'active' : ''}`}
          onClick={() => handleTabChange('printed')}
        >
          출력 완료 ({printedList.length})
        </button>
        <button
          className={`guide-tab ${activeTab === 'notPrinted' ? 'active' : ''}`}
          onClick={() => handleTabChange('notPrinted')}
        >
          출력 미진행 ({notPrintedList.length})
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
            <th>출력상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {paginatedList.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                {activeTab === 'printed' ? '출력 완료된 안내문이 없습니다.' : '미출력 안내문이 없습니다.'}
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
                <span className={`status-badge ${item.printStatus === '출력' ? 'confirmed' : 'pending'}`}>
                  {item.printStatus === '출력' ? '출력' : '미출력'}
                </span>
              </td>
              <td>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/ai-guide/${item.aptId}`)}
                >
                  {activeTab === 'printed' ? '재출력' : '안내문 생성'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

export default PrintHistory;
