import { createContext, useContext, useState, useEffect } from 'react';
import { fetchPatientData, transformPatientData } from '../services/s3DataService';
import * as mockData from '../data/mockData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState({
    patients: mockData.patients,
    todayAppointments: mockData.todayAppointments,
    patientDetails: mockData.patientDetails,
    isLoading: true,
    error: null,
    isLive: false, // S3 데이터 사용 여부
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const rawData = await fetchPatientData();
      const transformed = transformPatientData(rawData);
      setData({
        patients: transformed.patients,
        todayAppointments: transformed.todayAppointments,
        patientDetails: transformed.patientDetails,
        isLoading: false,
        error: null,
        isLive: true,
      });
    } catch (err) {
      console.warn('S3 데이터 로드 실패, mock 데이터를 사용합니다:', err);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: err.message,
        isLive: false,
      }));
    }
  }

  // 데이터 새로고침
  const refreshData = () => {
    setData(prev => ({ ...prev, isLoading: true }));
    loadData();
  };

  return (
    <DataContext.Provider value={{ ...data, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
