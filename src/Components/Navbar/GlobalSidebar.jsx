import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, IconButton, Typography, Menu, MenuItem, Tooltip, Collapse,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import HotelIcon from '@mui/icons-material/Hotel';
import HistoryIcon from '@mui/icons-material/History';
import TodayIcon from '@mui/icons-material/Today';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ScienceIcon from '@mui/icons-material/Science';
import TvIcon from '@mui/icons-material/Tv';
import EmailIcon from '@mui/icons-material/Email';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import UserSelfPasswordModal from './UserSelfPasswordModal';
import NotificationBell from './NotificationBell';
import { BackendAPI } from '../../services/BackendApi';
import { APP_VERSION } from '../../version';
import usePermissions from '../../hooks/usePermissions';

const COLLAPSED_WIDTH = 48;
const EXPANDED_WIDTH = 200;

const NAV_ITEMS = [
  {
    key: 'dashboard', label: 'Dashboard', path: '/patients/dashboard',
    icon: <DashboardIcon />, perm: 'emergencia.view',
  },
  {
    key: 'atencion', label: 'Atención', basePath: '/patients/atencion',
    icon: <LocalHospitalIcon />, perm: 'emergencia.view',
    subSections: [
      { key: 'portal', label: 'Emergencia', icon: <LocalHospitalIcon /> },
      { key: 'hospitalizacion', label: 'Hospitalización', icon: <HotelIcon /> },
      { key: 'quirofano', label: 'Quirófano', icon: <MedicalServicesIcon />, perm: 'quirofano.view' },
      { key: 'historial', label: 'Historial', icon: <HistoryIcon /> },
    ],
  },
  {
    key: 'citas', label: 'Citas', basePath: '/patients/citas',
    icon: <CalendarMonthIcon />, perm: 'citas.view',
    subSections: [
      { key: 'hoy', label: 'Hoy', icon: <TodayIcon /> },
      { key: 'calendario', label: 'Calendario', icon: <CalendarMonthIcon /> },
    ],
  },
  {
    key: 'pacientes', label: 'Pacientes', path: '/patients/pacientes',
    icon: <PeopleIcon />, perm: 'pacientes.view',
  },
  {
    key: 'config', label: 'Config.', basePath: '/patients/configuraciones',
    icon: <SettingsIcon />, perm: 'configuraciones.view',
    subSections: [
      { key: 'medicos', label: 'Médicos', icon: <MedicalServicesIcon />, perm: 'medicos.view' },
      { key: 'especialidades', label: 'Especialidades', icon: <CategoryIcon />, perm: 'especialidades.view' },
      { key: 'agenda', label: 'Agenda Médica', icon: <CalendarMonthIcon />, perm: 'agenda.edit' },
      { key: 'usuarios', label: 'Usuarios', icon: <PersonIcon />, perm: 'usuarios.view' },
      { key: 'perfiles', label: 'Perfiles', icon: <AdminPanelSettingsIcon />, perm: 'perfiles.view' },
      { key: 'salas', label: 'Salas', icon: <MeetingRoomIcon />, perm: 'rooms.view', adminOnly: true },
      { key: 'laboratorio', label: 'Laboratorio', icon: <ScienceIcon />, perm: 'lab_params.view' },
      { key: 'tv_screens', label: 'Pantallas TV', icon: <TvIcon />, perm: 'configuraciones.view', adminOnly: true },
      { key: 'displays', label: 'Pantallas Citas', icon: <TvIcon />, perm: 'citas.view', adminOnly: true },
      { key: 'correo', label: 'Correo', icon: <EmailIcon />, adminOnly: true },
    ],
  },
];

const GlobalSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const permissions = usePermissions();
  const isAdmin = user.is_admin;
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const prevPathRef = useRef(location.pathname);
  const [expandedMenu, setExpandedMenu] = useState(() => {
    const item = NAV_ITEMS.find(i =>
      location.pathname.startsWith(i.basePath || i.path) && i.subSections
    );
    return item?.key || null;
  });

  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      const item = NAV_ITEMS.find(i =>
        location.pathname.startsWith(i.basePath || i.path) && i.subSections
      );
      setExpandedMenu(item?.key || null);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try { await BackendAPI.auth.signOut(); } catch { }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_permissions');
    navigate('/', { replace: true });
  };

  const userName = ((user.name || '') + (user.lastname ? ' ' + user.lastname : '')) || 'Usuario';
  const currentTab = searchParams.get('tab') || '';

  const activeMainKey = NAV_ITEMS.find((item) => {
    const p = item.path || item.basePath;
    return location.pathname.startsWith(p);
  })?.key;

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!permissions.includes(item.perm)) return false;
    if (item.subSections) {
      item.subSections = item.subSections.filter((sub) => {
        if (sub.perm && !permissions.includes(sub.perm)) return false;
        if (sub.adminOnly && !isAdmin) return false;
        return true;
      });
      if (item.subSections.length === 0) return false;
    }
    return true;
  });

  const handleMainClick = (item) => {
    if (!item.subSections) {
      navigate(item.path);
      return;
    }
    setExpandedMenu((prev) => prev === item.key ? null : item.key);
  };

  const handleSubClick = (item, sub) => {
    navigate(`${item.basePath}?tab=${sub.key}`);
  };

  const renderSubSection = (item, sub) => {
    const isActive = activeMainKey === item.key && currentTab === sub.key;
    const btn = (
      <ListItemButton
        key={sub.key}
        selected={isActive}
        onClick={() => handleSubClick(item, sub)}
        sx={{
          mx: 0.5,
          borderRadius: 0.5,
          mb: 0.15,
          pl: 3.5,
          minHeight: 28,
          borderLeft: '2px solid',
          borderColor: isActive ? 'primary.main' : 'rgba(255,255,255,0.12)',
          bgcolor: isActive ? 'primary.main' : 'transparent',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '& .MuiListItemIcon-root': { color: 'white' },
          },
          '&:not(.Mui-selected):hover': {
            bgcolor: 'rgba(255,255,255,0.08)',
            borderColor: 'rgba(255,255,255,0.3)',
          },
        }}
      >
        <ListItemText
          primary={sub.label}
          primaryTypographyProps={{ fontSize: 11, fontWeight: isActive ? 600 : 400, noWrap: true }}
        />
      </ListItemButton>
    );
    return collapsed ? null : btn;
  };

  return (
    <>
      <Box
        sx={{
          width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
          minWidth: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#0d1b2a',
          color: 'white',
          transition: 'width 0.2s ease, min-width 0.2s ease',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            px: collapsed ? 0.5 : 1,
            py: 0.75,
            minHeight: 40,
          }}
        >
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                Emerboard
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.55rem' }}>
                v{APP_VERSION}
              </Typography>
            </Box>
          )}
          <IconButton size="small" onClick={() => setCollapsed((c) => !c)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <List sx={{ flex: 1, pt: 0.5, overflow: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 } }}>
          {visibleItems.map((item) => {
            const isMainActive = activeMainKey === item.key;
            const mainBtn = (
              <ListItemButton
                key={item.key}
                selected={isMainActive && !item.subSections}
                onClick={() => handleMainClick(item)}
                sx={{
                  mx: 0.5,
                  borderRadius: 0.5,
                  mb: 0.15,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: collapsed ? 0.5 : 1,
                  minHeight: 32,
                  bgcolor: isMainActive && item.subSections ? 'rgba(255,255,255,0.06)' : 'transparent',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'white' },
                  },
                  '&:not(.Mui-selected):hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 32, justifyContent: 'center', color: isMainActive ? 'white' : 'rgba(255,255,255,0.6)' }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 12, fontWeight: isMainActive ? 700 : 500, noWrap: true }}
                  />
                )}
              </ListItemButton>
            );

            const mainEl = collapsed ? (
              <Tooltip key={item.key} title={item.label} arrow placement="right">
                {mainBtn}
              </Tooltip>
            ) : (
              mainBtn
            );

            return (
              <Box key={item.key}>
                {mainEl}
                {!collapsed && expandedMenu === item.key && item.subSections && (
                  <Collapse in={true} timeout="auto">
                    <Box
                      sx={{
                        ml: 1,
                        pl: 0.5,
                        borderLeft: '1px solid',
                        borderColor: 'rgba(255,255,255,0.08)',
                        mt: 0.25,
                        mb: 0.25,
                        bgcolor: 'rgba(255,255,255,0.04)',
                        borderRadius: '0 4px 4px 0',
                      }}
                    >
                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 0.25 }} />
                      {item.subSections.map((sub) => renderSubSection(item, sub))}
                    </Box>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <Box
          sx={{
            p: collapsed ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 0.5,
            minHeight: 40,
          }}
        >
          {collapsed ? (
            <Tooltip title={userName} arrow placement="right">
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <AccountCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                <AccountCircle fontSize="small" />
              </IconButton>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: '0.75rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {userName}
                </Typography>
              </Box>
              <NotificationBell />
            </>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { minWidth: 160 } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); setPasswordOpen(true); }}>
          <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
          Cambiar Contraseña
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>
      <UserSelfPasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
};

export default GlobalSidebar;
