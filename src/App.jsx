import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import Calendar from './pages/Calendar';
import GuideManagement from './pages/GuideManagement';
import PrintHistory from './pages/PrintHistory';
import Settings from './pages/Settings';
import PatientDetail from './pages/PatientDetail';
import AIGuideGenerate from './pages/AIGuideGenerate';
import PublicGuide from './pages/PublicGuide';
import RedirectWay from './pages/RedirectWay';
import DataManagement from './pages/DataManagement';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      {/* 공개 페이지: 로그인 없이 접근 가능 */}
      <Route path="/public-guide/:aptId" element={<PublicGuide />} />
      <Route path="/way" element={<RedirectWay />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="data-management" element={<DataManagement />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="guides" element={<GuideManagement />} />
        <Route path="print-history" element={<PrintHistory />} />
        <Route path="settings" element={<Settings />} />
        <Route path="patient/:aptId" element={<PatientDetail />} />
        <Route path="ai-guide/:aptId" element={<AIGuideGenerate />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
