import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './PatientList.css';

function PatientList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('등록번호순');
  const navigate = useNavigate();
  const { patients, allAppointments, isLoading } = useData();

  const filteredPatients = patients.filter(p =>
    p.name.includes(searchTerm) ||
    p.id.includes(searchTerm) ||
    p.phone.includes(searchTerm) ||
    p.department.includes(searchTerm) ||
    p.birthDate.includes(searchTerm)
  );

  // 환자 ID로 해당 aptId 찾기
  const getAptId = (patientId) => {
    const apt = allAppointments.find(a => a.patientId === patientId);
    return apt ? apt.aptId : null;
  };

  if (isLoading) return <div className="patient-list-page"><p>데이터 로딩 중...</p></div>;

  return (
    <div className="patient-list-page">
      <h1 className="page-title">전체 환자 목록</h1>
      <p className="page-subtitle">등록된 전체 환자 인원</p>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="환자 이름, 등록번호, 생년월일, 연락처, 진료과 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option>등록번호순</option>
          <option>이름순</option>
          <option>최근방문순</option>
        </select>
      </div>

      <table className="patient-table">
        <thead>
          <tr>
            <th>등록번호</th>
            <th>환자이름</th>
            <th>생년월일</th>
            <th>성별</th>
            <th>연락처</th>
            <th>최근 진료과</th>
            <th>최근 예약</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.id}</td>
              <td className="patient-name">{patient.name}</td>
              <td>{patient.birthDate}</td>
              <td>
                <span className={`gender-badge ${patient.gender === '남' ? 'male' : 'female'}`}>
                  {patient.gender}
                </span>
              </td>
              <td>{patient.phone}</td>
              <td>{patient.department}</td>
              <td>{patient.lastVisit}</td>
              <td>
                <button
                  className="detail-btn"
                  onClick={() => {
                    const aptId = getAptId(patient.id);
                    if (aptId) navigate(`/patient/${aptId}`);
                  }}
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

export default PatientList;
