import { createContext, useContext, useState } from 'react';
import { getHospitalConfig, getAllEmployeeIds } from '../data/hospitalConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);

  const login = (employeeId, password) => {
    const config = getHospitalConfig(employeeId);
    if (config) {
      setUser({ employeeId });
      setHospitalInfo(config);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setHospitalInfo(null);
  };

  return (
    <AuthContext.Provider value={{ user, hospitalInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
