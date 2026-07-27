import { useState, useRef, useEffect, useMemo, useCallback, useContext } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Divider, IconButton, Typography, Menu, MenuItem, Tooltip, Collapse,
  Badge,
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
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationBell from './notification-bell';
import UserSelfPasswordModal from './user-self-password-modal';
import HelpPanel from '../../Components/Commons/HelpPanel';
import { BackendAPI } from '../../services/BackendApi';
import { APP_VERSION } from '../../version';
import usePermissions from '../../hooks/usePermissions';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '@mui/material/styles';
import ColorModeContext from '../../context/ColorModeContext';

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
      { key: 'enfermeria', label: 'Enfermería', icon: null, perm: 'enfermeria.view' },
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
    key: 'config', label: 'Config.', path: '/patients/configuraciones',
    icon: <SettingsIcon />, perm: 'configuraciones.view',
  },
];

const LIST_SCROLLBAR_SX = {
  '&::-webkit-scrollbar': { width: 4 },
  '&::-webkit-scrollbar-track': { bgcolor: 'rgba(255,255,255,0.02)' },
  '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 },
  '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(255,255,255,0.15) transparent',
};

const GlobalSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, signOut: authSignOut } = useAuth();
  const permissions = usePermissions();
  const theme = useTheme();
  const { toggleColorMode } = useContext(ColorModeContext);
  const isAdmin = user?.is_admin;
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

  const visibleItems = useMemo(() => {
    return NAV_ITEMS.reduce((acc, item) => {
      if (!permissions.includes(item.perm)) return acc;
      const filtered = { ...item };
      if (item.subSections) {
        const visibleSubs = item.subSections.filter((sub) => {
          if (sub.perm && !permissions.includes(sub.perm)) return false;
          if (sub.adminOnly && !isAdmin) return false;
          return true;
        });
        if (visibleSubs.length === 0) return acc;
        filtered.subSections = visibleSubs;
      }
      acc.push(filtered);
      return acc;
    }, []);
  }, [permissions, isAdmin]);

  const activeMainKey = useMemo(() => {
    return NAV_ITEMS.find((item) => {
      const p = item.path || item.basePath;
      return location.pathname.startsWith(p);
    })?.key;
  }, [location.pathname]);

  const handleLogout = useCallback(async () => {
    try { await BackendAPI.auth.signOut(); } catch { }
    authSignOut();
    navigate('/', { replace: true });
  }, [authSignOut, navigate]);

  const userName = ((user?.name || '') + (user?.lastname ? ' ' + user.lastname : '')) || 'Usuario';
  const currentTab = searchParams.get('tab') || '';

  const handleMainClick = useCallback((item) => {
    if (!item.subSections) {
      navigate(item.path);
      return;
    }
    setExpandedMenu((prev) => prev === item.key ? null : item.key);
  }, [navigate]);

  const handleSubClick = useCallback((item, sub) => {
    navigate(`${item.basePath}?tab=${sub.key}`);
  }, [navigate]);

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
          transition: 'width 0.15s ease, min-width 0.15s ease',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            px: collapsed ? 0.5 : 1.5,
            py: 0.75,
            minHeight: 40,
          }}
        >
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                Emerboard
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', flexShrink: 0 }}>
                v{APP_VERSION}
              </Typography>
            </Box>
          )}
          <Tooltip title={collapsed ? 'Expandir' : 'Colapsar'} arrow placement="right">
            <IconButton
              size="small"
              onClick={() => setCollapsed((c) => !c)}
              sx={{
                color: 'rgba(255,255,255,0.5)',
                '&:hover': { color: 'rgba(255,255,255,0.85)', bgcolor: 'rgba(255,255,255,0.08)' },
                transition: 'color 0.15s, background-color 0.15s',
              }}
            >
              {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        <List sx={{ flex: 1, pt: 0.5, overflow: 'auto', ...LIST_SCROLLBAR_SX }}>
          {visibleItems.map((item) => {
            const isMainActive = activeMainKey === item.key;
            const hasChildren = !!item.subSections;

            return (
              <Box key={item.key}>
                {collapsed ? (
                  <Tooltip
                    title={hasChildren ? `${item.label} (expandible)` : item.label}
                    arrow
                    placement="right"
                  >
                    <ListItemButton
                      selected={isMainActive && !hasChildren}
                      onClick={() => handleMainClick(item)}
                      sx={{
                        mx: 0.5,
                        borderRadius: 0.5,
                        mb: 0.15,
                        justifyContent: 'center',
                        px: 0.5,
                        minHeight: 32,
                        bgcolor: isMainActive && hasChildren ? 'rgba(255,255,255,0.12)' : 'transparent',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                          '& .MuiListItemIcon-root': { color: 'white' },
                        },
                        '&:not(.Mui-selected):hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 'auto', justifyContent: 'center', color: isMainActive ? 'white' : 'rgba(255,255,255,0.6)' }}>
                        {hasChildren ? (
                          <Badge
                            variant="dot"
                            invisible={expandedMenu !== item.key}
                            color="primary"
                            sx={{ '& .MuiBadge-dot': { right: -1, top: 0, width: 5, height: 5, borderRadius: '50%' } }}
                          >
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )}
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                ) : (
                  <ListItemButton
                    selected={isMainActive && !hasChildren}
                    onClick={() => handleMainClick(item)}
                    sx={{
                      mx: 0.5,
                      borderRadius: 0.5,
                      mb: 0.15,
                      px: 1.5,
                      minHeight: 32,
                      bgcolor: isMainActive && hasChildren ? 'rgba(255,255,255,0.12)' : 'transparent',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '& .MuiListItemIcon-root': { color: 'white' },
                      },
                      '&:not(.Mui-selected):hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, justifyContent: 'center', color: isMainActive ? 'white' : 'rgba(255,255,255,0.6)' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 12, fontWeight: isMainActive ? 700 : 500, noWrap: true }}
                    />
                    {hasChildren && (
                      <Box
                        component="span"
                        sx={{
                          ml: 'auto',
                          fontSize: 10,
                          color: isMainActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                          transition: 'transform 0.2s ease',
                          transform: expandedMenu === item.key ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      >
                        ›
                      </Box>
                    )}
                  </ListItemButton>
                )}

                {!collapsed && expandedMenu === item.key && item.subSections && (
                  <Collapse in={true} timeout="auto">
                      <Box
                        sx={{
                          ml: 1,
                          pl: 0.5,
                          mt: 0.25,
                          mb: 0.25,
                          bgcolor: 'rgba(255,255,255,0.04)',
                          borderRadius: '0 4px 4px 0',
                        }}
                      >
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 0.25 }} />
                      {item.subSections.map((sub) => {
                        const isActive = activeMainKey === item.key && currentTab === sub.key;
                        return (
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
                      })}
                    </Box>
                  </Collapse>
                )}
              </Box>
            );
          })}

          {visibleItems.length === 0 && (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>
                Sin secciones disponibles
              </Typography>
            </Box>
          )}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
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
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': { color: 'rgba(255,255,255,0.95)', bgcolor: 'rgba(255,255,255,0.08)' },
                  transition: 'color 0.15s, background-color 0.15s',
                }}
              >
                <AccountCircle fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  flexShrink: 0,
                  '&:hover': { color: 'rgba(255,255,255,0.95)', bgcolor: 'rgba(255,255,255,0.08)' },
                  transition: 'color 0.15s, background-color 0.15s',
                }}
              >
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
              <HelpPanel />
              <Tooltip title={theme.palette.mode === 'dark' ? 'Modo claro' : 'Modo oscuro'} arrow placement="top">
                <IconButton size="small" onClick={toggleColorMode} aria-label={theme.palette.mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'rgba(255,255,255,0.9)' } }}>
                  {theme.palette.mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); setPasswordOpen(true); }}>
          <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
          Cambiar Contraseña
        </MenuItem>
        <Divider sx={{ my: 0.75, borderColor: 'divider' }} />
        <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }}>
          <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>
      <UserSelfPasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
    </>
  );
};

export default GlobalSidebar;
