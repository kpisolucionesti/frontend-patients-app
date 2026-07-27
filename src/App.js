import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { Box, CircularProgress } from '@mui/material';
import GlobalSidebar from './widgets/global-sidebar/global-sidebar';
import { BackendAPI } from './services/BackendApi';
import { useAuth } from './hooks/useAuth';
import useGlobalKeyboardShortcuts from './hooks/useGlobalKeyboardShortcuts';
import ErrorBoundary from './shared/ui/error-boundary';
import useSessionTimeout from './hooks/useSessionTimeout';
import SessionTimeoutModal from './Components/Commons/SessionTimeoutModal';
import ForcePasswordChange from './features/auth/force-password-change';
import SignIn from './features/auth/sign-in-form';
import ForgotPassword from './features/auth/forgot-password-form';
import ResetPassword from './features/auth/reset-password-form';

const Dashboard = lazy(() => import('./pages/dashboard/dashboard-page'));
const AtencionLayout = lazy(() => import('./pages/emergency/atencion-layout'));
const PatientsPage = lazy(() => import('./pages/patients/patients-page'));
const HospitalizationBoard = lazy(() => import('./pages/hospitalization/hospitalization-board'));
const HospitalizationDetail = lazy(() => import('./Components/Hospitalizacion/HospitalizationDetail'));
const AppointmentsPage = lazy(() => import('./pages/appointments/appointments-page'));
const SettingsPage = lazy(() => import('./pages/settings/settings-page'));
const DoctorsPage = lazy(() => import('./pages/doctors/doctors-page'));
const AppointmentDisplayScreen = lazy(() => import('./Components/Citas/AppointmentDisplayScreen'));
const TvPinGuard = lazy(() => import('./shared/ui/tv-pin-guard'));
const RoomTable = lazy(() => import('./widgets/room-table/room-table'));

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flex: 1 }}>
      <CircularProgress size={32} />
    </Box>
  );
}

function ProtectedLayout() {
  const { token, user, signOut, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSessionExpired = () => {
    signOut();
    navigate('/', { replace: true });
  };

  const { warning, resetTimer } = useSessionTimeout(handleSessionExpired);

  useGlobalKeyboardShortcuts(navigate);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (user?.must_change_password) {
    return <ForcePasswordChange onComplete={() => setRefreshKey((k) => k + 1)} />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <GlobalSidebar />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ErrorBoundary>
          <Outlet context={{ permissions: hasPermission }} />
        </ErrorBoundary>
      </Box>
      <SessionTimeoutModal open={warning} onContinue={resetTimer} />
    </Box>
  );
}

function PublicRoute({ children }) {
  const { token } = useAuth();
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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<PublicRoute><SignIn /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/display/:displayId" element={<AppointmentDisplayScreen />} />
        <Route path="/patients" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="atencion" element={<AtencionLayout />} />
          <Route path="pacientes" element={<PatientsPage />} />
          <Route path="hospitalizacion" element={<HospitalizationBoard />} />
          <Route path="hospitalizacion/:emergencyId" element={<HospitalizationDetail />} />
          <Route path="citas/*" element={<AppointmentsPage />} />
          <Route path="configuraciones" element={<SettingsPage />} />
          <Route path="medicos" element={<DoctorsPage />} />
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
    </Suspense>
  );
}

export default App;
