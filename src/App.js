import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import NavBar from './Components/Navbar/NavBar';
import PatientsView from './Components/Table/PatientsView';
import RoomTable from './Components/Table/RoomTable';
import SignIn from './Components/Login/sign-in';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <NavBar />
      {children}
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
      <Route path="/patients" element={<ProtectedRoute><PatientsView /></ProtectedRoute>} />
      <Route path="/adulto" element={<ProtectedRoute><RoomTable /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
