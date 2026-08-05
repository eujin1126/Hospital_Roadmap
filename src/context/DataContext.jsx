import { createContext, useContext, useState, useEffect } from 'react';
import { fetchPatientData, transformPatientData } from '../services/s3DataService';
import { syncGuideStatusToS3, syncPrintStatusToS3 } from '../services/s3SyncService';

const DataContext = createContext(null);

// localStorage 유틸
function loadFromStorage(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`${key} 저장 실패:`, e);
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
  const [guideStatus, setGuideStatus] = useState(() => loadFromStorage('guideStatus'));
  // 인쇄 상태: { [aptId]: '출력' | '미출력' }
  const [printStatus, setPrintStatus] = useState(() => loadFromStorage('printStatus'));

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

  // 안내문 생성 완료 처리 (aptId 기준) + S3 동기화
  const markGuideGenerated = (aptId) => {
    if (!aptId) return;
    if (guideStatus[aptId] === '생성') return;
    const updated = { ...guideStatus, [aptId]: '생성' };
    setGuideStatus(updated);
    saveToStorage('guideStatus', updated);

    // S3에 동기화 (reservationId 찾기)
    const apt = data.allAppointments.find(a => a.aptId === aptId);
    if (apt?.patientId) {
      syncGuideStatusToS3(apt.patientId).then(success => {
        if (success) console.log(`안내문 상태 S3 동기화 완료: ${apt.patientId}`);
      });
    }
  };

  // 인쇄 완료 처리 (aptId 기준) + S3 동기화
  const markPrinted = (aptId) => {
    if (!aptId) return;
    if (printStatus[aptId] === '출력') return;
    const updated = { ...printStatus, [aptId]: '출력' };
    setPrintStatus(updated);
    saveToStorage('printStatus', updated);

    // S3에 동기화 (reservationId 찾기)
    const apt = data.allAppointments.find(a => a.aptId === aptId);
    if (apt?.patientId) {
      syncPrintStatusToS3(apt.patientId).then(success => {
        if (success) console.log(`인쇄 상태 S3 동기화 완료: ${apt.patientId}`);
      });
    }
  };

  // 상태 가져오기 헬퍼 (localStorage 우선, 없으면 원본 데이터 참조)
  const getGuideStatus = (aptId, originalStatus) => {
    if (guideStatus[aptId]) return guideStatus[aptId];
    return originalStatus || '미생성';
  };
  const getPrintStatus = (aptId, originalStatus) => {
    if (printStatus[aptId]) return printStatus[aptId];
    return originalStatus || '미출력';
  };

  // 오늘 예약 환자 (날짜 기준 필터) + 상태 반영
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = data.allAppointments
    .filter(a => a.visitDate === today)
    .map(a => ({
      ...a,
      guideStatus: getGuideStatus(a.aptId, a.guideStatus),
      printStatus: getPrintStatus(a.aptId, a.printStatus),
    }));

  // allAppointments에도 상태 반영
  const allAppointmentsWithStatus = data.allAppointments.map(a => ({
    ...a,
    guideStatus: getGuideStatus(a.aptId, a.guideStatus),
    printStatus: getPrintStatus(a.aptId, a.printStatus),
  }));

  return (
    <DataContext.Provider value={{
      ...data,
      allAppointments: allAppointmentsWithStatus,
      todayAppointments,
      refreshData,
      markGuideGenerated,
      markPrinted,
      getGuideStatus,
      getPrintStatus,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
