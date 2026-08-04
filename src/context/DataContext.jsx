import { createContext, useContext, useState, useEffect } from 'react';
import { fetchPatientData, transformPatientData } from '../services/s3DataService';

const DataContext = createContext(null);

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

  // 오늘 예약 환자 (날짜 기준 필터)
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = data.allAppointments.filter(a => a.visitDate === today);

  return (
    <DataContext.Provider value={{
      ...data,
      todayAppointments,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
