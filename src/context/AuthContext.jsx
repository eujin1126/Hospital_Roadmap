import { createContext, useContext, useState } from 'react';
import { currentUser } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (employeeId, password) => {
    // 테스트 계정: EMP2024001 / 아무 값
    if (employeeId === 'EMP2024001') {
      setUser(currentUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
