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
import HospitalizationBoard from './Components/Hospitalizacion/HospitalizationBoard';
import HospitalizationDetail from './Components/Hospitalizacion/HospitalizationDetail';
import TvPinGuard from './Components/Commons/TvPinGuard';
import ErrorBoundary from './Components/Commons/ErrorBoundary';
import usePermissions from './hooks/usePermissions';
import useSessionTimeout from './hooks/useSessionTimeout';
import SessionTimeoutModal from './Components/Commons/SessionTimeoutModal';
import ForcePasswordChange from './Components/Login/ForcePasswordChange';
import SignIn from './Components/Login/SignIn';
import ForgotPassword from './Components/Login/ForgotPassword';
import ResetPassword from './Components/Login/ResetPassword';
import AppointmentsLayout from './Components/Citas/AppointmentsLayout';
import AppointmentDisplayScreen from './Components/Citas/AppointmentDisplayScreen';
import PatientsModule from './Components/Patients/PatientsModule';
import AtencionLayout from './Components/Atencion/AtencionLayout';

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

  const userData = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  if (userData.must_change_password) {
    return <ForcePasswordChange onComplete={() => window.location.reload()} />;
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
      <Route path="/display/:displayId" element={<AppointmentDisplayScreen />} />
      <Route path="/patients" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="portal" element={<EmergencyPortal />} />
        <Route path="atencion" element={<AtencionLayout />} />
        <Route path="pacientes" element={<PatientsModule />} />
        <Route path="hospitalizacion" element={<HospitalizationBoard />} />
        <Route path="hospitalizacion/:emergencyId" element={<HospitalizationDetail />} />
        <Route path="citas/*" element={<AppointmentsLayout />} />
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
