import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './Components/Navbar/NavBar';
import CurrentPatients from './Components/Emergency/CurrentPatients';
import TablePatients from './Components/History/TablePatients';
import PatientsList from './Components/Patients/PatientsList';
import DoctorsList from './Components/Doctors/DoctorsList';
import Configuraciones from './Components/Configuraciones/Configuraciones';
import RoomTable from './Components/Board/RoomTable';
import TvPinGuard from './Components/Commons/TvPinGuard';
import ErrorBoundary from './Components/Commons/ErrorBoundary';
import usePermissions from './hooks/usePermissions';
import SignIn from './Components/Login/SignIn';
import ForgotPassword from './Components/Login/ForgotPassword';
import ResetPassword from './Components/Login/ResetPassword';

function ProtectedLayout() {
  const token = localStorage.getItem('auth_token');
  const permissions = usePermissions();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <NavBar />
      <ErrorBoundary>
        <Outlet context={{ permissions }} />
      </ErrorBoundary>
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
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><SignIn /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/patients" element={<ProtectedLayout />}>
        <Route index element={<Navigate to="emergencia" replace />} />
        <Route path="emergencia" element={<CurrentPatients />} />
        <Route path="historial" element={<TablePatients />} />
        <Route path="configuraciones" element={<Configuraciones />} />
        <Route path="pacientes" element={<PatientsList />} />
        <Route path="medicos" element={<DoctorsList />} />
      </Route>
      <Route path="/adulto" element={<TvPinGuard><RoomTable /></TvPinGuard>} />
    </Routes>
  );
}

export default App;
