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
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import UserSelfPasswordModal from './UserSelfPasswordModal';
import { BackendAPI } from '../../services/BackendApi';
import { APP_VERSION } from '../../version';
import usePermissions from '../../hooks/usePermissions';

const MENUS = [
  { label: 'Dashboard', path: '/patients/dashboard', icon: <DashboardIcon />, perm: 'emergencia.view' },
  { label: 'Pacientes', path: '/patients/pacientes', icon: <PeopleIcon />, perm: 'pacientes.view' },
  { label: 'Atención', path: '/patients/atencion', icon: <LocalHospitalIcon />, perm: 'emergencia.view' },
  { label: 'Citas', path: '/patients/citas', icon: <CalendarMonthIcon />, perm: 'citas.view' },
  { label: 'Configuraciones', path: '/patients/configuraciones', icon: <SettingsIcon />, perm: 'configuraciones.view' },
];

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const permissions = usePermissions();
  const [anchorEl, setAnchorEl] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleLogout = async () => {
    try { await BackendAPI.auth.signOut(); } catch { /* ignore if server is unreachable */ }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_permissions');
    navigate('/', { replace: true });
  };

  const visibleMenus = MENUS.filter((m) => permissions.includes(m.perm));

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: 'darkblue', width: '100%', mx: 0 }}>
        <Toolbar variant="dense" sx={{ px: { xs: 1, sm: 1.5 } }}>
          <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', mr: 0.5, fontSize: '0.9rem' }}>
            Emerboard
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.5)" sx={{ mr: 1, fontSize: '0.65rem' }}>
            v{APP_VERSION}
          </Typography>
          {visibleMenus.map((m) => {
            const active = location.pathname.startsWith(m.path);
            return (
              <Button
                key={m.path}
                startIcon={m.icon}
                onClick={() => navigate(m.path)}
                variant={active ? 'contained' : 'text'}
                size="small"
                sx={{
                  mr: 0.3, py: 0.25, px: 0.75, fontSize: '0.75rem', minWidth: 0,
                  '& .MuiButton-startIcon': { mr: 0.25, '& > svg': { fontSize: '1rem' } },
                  ...(active
                    ? { bgcolor: 'white', color: 'darkblue', '&:hover': { bgcolor: '#f0f0f0' } }
                    : { color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }
                  ),
                }}
              >
                {m.label}
              </Button>
            );
          })}
          <Typography variant="body2" component="div" sx={{ flexGrow: 1 }} />
          <Typography variant="body2" component="div" sx={{ mr: 1, fontSize: '0.8rem' }}>
            {(user.name || '') + (user.lastname ? ' ' + user.lastname : '') || 'Usuario'}
          </Typography>
          <IconButton color="inherit" size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircle fontSize="small" />
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
