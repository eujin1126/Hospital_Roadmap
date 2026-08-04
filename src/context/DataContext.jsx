import { createContext, useContext, useState, useEffect } from 'react';
import { fetchPatientData, transformPatientData } from '../services/s3DataService';

const DataContext = createContext(null);

// localStorage에서 안내문 생성 상태 불러오기
function loadGuideStatus() {
  try {
    const stored = localStorage.getItem('guideStatus');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// localStorage에 안내문 생성 상태 저장
function saveGuideStatus(status) {
  try {
    localStorage.setItem('guideStatus', JSON.stringify(status));
  } catch (e) {
    console.error('guideStatus 저장 실패:', e);
  }
}

export function DataProvider({ children }) {
  const [data, setData] = useState({
    patients: [],
    allAppointments: [],
    calendarData: {},
    appointmentsByDate: {},
    patientDetails: {},
    departmentStats: [],
    isLoading: true,
    error: null,
  });

  // 안내문 생성 상태: { [aptId]: '생성' | '미생성' }
  const [guideStatus, setGuideStatus] = useState(loadGuideStatus);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const rawData = await fetchPatientData();
      const transformed = transformPatientData(rawData);
      setData({
        ...transformed,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('S3 데이터 로드 실패:', err);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err.message,
      }));
    }
  }

  const refreshData = () => {
    setData(prev => ({ ...prev, isLoading: true }));
    loadData();
  };

  // 안내문 생성 완료 처리 (aptId 기준)
  const markGuideGenerated = (aptId) => {
    if (!aptId) return;
    // 이미 생성 상태면 중복 업데이트 안 함
    if (guideStatus[aptId] === '생성') return;

    const updated = { ...guideStatus, [aptId]: '생성' };
    setGuideStatus(updated);
    saveGuideStatus(updated);
  };

  // 특정 환자의 안내문 상태 가져오기
  const getGuideStatus = (aptId) => {
    return guideStatus[aptId] || '미생성';
  };

  // 오늘 예약 환자 (날짜 기준 필터) + 안내문 상태 반영
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = data.allAppointments
    .filter(a => a.visitDate === today)
    .map(a => ({
      ...a,
      guideStatus: getGuideStatus(a.aptId),
    }));

  // allAppointments에도 안내문 상태 반영
  const allAppointmentsWithStatus = data.allAppointments.map(a => ({
    ...a,
    guideStatus: getGuideStatus(a.aptId),
  }));

  return (
    <DataContext.Provider value={{
      ...data,
      allAppointments: allAppointmentsWithStatus,
      todayAppointments,
      refreshData,
      markGuideGenerated,
      getGuideStatus,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
