import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import NavBar from './Components/Navbar/NavBar';
import { BackendAPI } from './services/BackendApi';
import EmergencyPortal from './Components/Portal/EmergencyPortal';
import DoctorsList from './Components/Doctors/DoctorsList';
import Configuraciones from './Components/Configuraciones/Configuraciones';
import Dashboard from './Components/Dashboard/Dashboard';
import RoomTable from './Components/Board/RoomTable';
import TvPinGuard from './Components/Commons/TvPinGuard';
import ErrorBoundary from './Components/Commons/ErrorBoundary';
import usePermissions from './hooks/usePermissions';
import useSessionTimeout from './hooks/useSessionTimeout';
import SessionTimeoutModal from './Components/Commons/SessionTimeoutModal';
import SignIn from './Components/Login/SignIn';
import ForgotPassword from './Components/Login/ForgotPassword';
import ResetPassword from './Components/Login/ResetPassword';

function ProtectedLayout() {
  const token = localStorage.getItem('auth_token');
  const permissions = usePermissions();
  const navigate = useNavigate();

  const handleSessionExpired = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_permissions');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  const { warning, resetTimer } = useSessionTimeout(handleSessionExpired);

  if (!token) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <NavBar />
      <ErrorBoundary>
        <Outlet context={{ permissions }} />
      </ErrorBoundary>
      <SessionTimeoutModal open={warning} onContinue={resetTimer} />
    </>
  );
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return <Navigate to="/patients" replace />;
  }
  return children;
}

function App() {
  const [tvScreens, setTvScreens] = useState([]);
  const [routesLoaded, setRoutesLoaded] = useState(false);

  useEffect(() => {
    BackendAPI.tvScreens.listActive()
      .then((screens) => setTvScreens(screens.filter((s) => s.route)))
      .catch(() => {})
      .finally(() => setRoutesLoaded(true));
  }, []);

  return (
    <Routes>
      <Route path="/" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/patients" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="portal" element={<EmergencyPortal />} />
        <Route path="configuraciones" element={<Configuraciones />} />
        <Route path="medicos" element={<DoctorsList />} />
      </Route>
      {tvScreens.map((s) => (
        <Route
          key={s.id}
          path={`/${s.route}`}
          element={<TvPinGuard screen={s}><RoomTable screenRoute={s.route} /></TvPinGuard>}
        />
      ))}
      {routesLoaded && <Route path="*" element={<Navigate to="/" replace />} />}
    </Routes>
  );
}

export default App;
