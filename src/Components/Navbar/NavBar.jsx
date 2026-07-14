import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import LogoutIcon from '@mui/icons-material/Logout';
import EmergencyIcon from '@mui/icons-material/LocalHospital';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import UserSelfPasswordModal from './UserSelfPasswordModal';
import { BackendAPI } from '../../services/BackendApi';

const MENUS = [
  { label: 'Emergencia', path: '/patients/emergencia', icon: <EmergencyIcon />, perm: 'emergencia.view' },
  { label: 'Historial', path: '/patients/historial', icon: <HistoryIcon />, perm: 'historial.view' },
  { label: 'Configuraciones', path: '/patients/configuraciones', icon: <SettingsIcon />, perm: 'configuraciones.view' },
];

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const permissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');
  const [anchorEl, setAnchorEl] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleLogout = async () => {
    try { await BackendAPI.auth.signOut(); } catch { /* ignore if server is unreachable */ }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_permissions');
    navigate('/', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const visibleMenus = MENUS.filter((m) => permissions.includes(m.perm));

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: 'darkblue', width: '100%', mx: 0 }}>
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {visibleMenus.map((m) => (
            <Button
              key={m.path}
              color="inherit"
              startIcon={m.icon}
              onClick={() => navigate(m.path)}
              sx={{ fontWeight: isActive(m.path) ? 'bold' : 'normal', textDecoration: isActive(m.path) ? 'underline' : 'none' }}
            >
              {m.label}
            </Button>
          ))}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            {user.name || 'Usuario'}
          </Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircle />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setAnchorEl(null); setPasswordOpen(true); }}>
              <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
              Cambiar Contrasena
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Cerrar Sesion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <UserSelfPasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
};

export default NavBar;
