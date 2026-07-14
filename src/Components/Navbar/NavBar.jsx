import { useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import EmergencyIcon from '@mui/icons-material/LocalHospital';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import MedicalIcon from '@mui/icons-material/MedicalServices';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="static" sx={{ bgcolor: 'darkblue', width: '100%', mx: 0 }}>
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component="div" sx={{ mr: 4 }}>
          {user.name || 'Usuario'}
        </Typography>
        <Button
          color="inherit"
          startIcon={<EmergencyIcon />}
          onClick={() => navigate('/patients/emergencia')}
          sx={{ fontWeight: isActive('/patients/emergencia') ? 'bold' : 'normal', textDecoration: isActive('/patients/emergencia') ? 'underline' : 'none' }}
        >
          Emergencia
        </Button>
        <Button
          color="inherit"
          startIcon={<HistoryIcon />}
          onClick={() => navigate('/patients/historial')}
          sx={{ fontWeight: isActive('/patients/historial') ? 'bold' : 'normal', textDecoration: isActive('/patients/historial') ? 'underline' : 'none' }}
        >
          Historial
        </Button>
        <Button
          color="inherit"
          startIcon={<PeopleIcon />}
          onClick={() => navigate('/patients/pacientes')}
          sx={{ fontWeight: isActive('/patients/pacientes') ? 'bold' : 'normal', textDecoration: isActive('/patients/pacientes') ? 'underline' : 'none' }}
        >
          Pacientes
        </Button>
        <Button
          color="inherit"
          startIcon={<MedicalIcon />}
          onClick={() => navigate('/patients/medicos')}
          sx={{ fontWeight: isActive('/patients/medicos') ? 'bold' : 'normal', textDecoration: isActive('/patients/medicos') ? 'underline' : 'none' }}
        >
          Medicos
        </Button>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
        <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
