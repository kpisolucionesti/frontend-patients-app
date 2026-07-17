import { useState, useCallback } from 'react';
import { Box, Button, List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ICON_MAP = {
  local_hospital: <LocalHospitalIcon />,
  people: <PeopleIcon />,
  history: <HistoryIcon />,
  assessment: <AssessmentIcon />,
};

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 220;

const PortalSidebar = ({ sections, activeSection, onSectionChange, onNewIngreso }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  return (
    <Box
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        minWidth: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,
        bgcolor: '#f5f7fa',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: collapsed ? '8px 4px' : 2, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 1 }}>
        {collapsed ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={onNewIngreso} sx={{ color: '#1565c0' }}>
              <AddCircleIcon />
            </IconButton>
            <IconButton size="small" onClick={handleToggle} sx={{ color: 'text.secondary' }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddCircleIcon />}
              onClick={onNewIngreso}
              sx={{ bgcolor: '#1565c0', color: 'white', '&:hover': { bgcolor: '#0d47a1' }, fontSize: '0.75rem', flex: 1, minWidth: 0 }}
            >
              Nuevo Ingreso
            </Button>
            <IconButton size="small" onClick={handleToggle} sx={{ color: 'text.secondary' }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
      <Divider />
      <List component="nav" sx={{ flex: 1, pt: 1 }}>
        {sections.map((section) => (
          <ListItemButton
            key={section.key}
            selected={activeSection === section.key}
            onClick={() => onSectionChange(section.key)}
            sx={{
              mx: 1,
              borderRadius: 1,
              mb: 0.5,
              justifyContent: collapsed ? 'center' : 'initial',
              px: collapsed ? 0.5 : 1.5,
              minHeight: 40,
              '&.Mui-selected': {
                bgcolor: '#e3f2fd',
                '&:hover': { bgcolor: '#bbdefb' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40, justifyContent: 'center' }}>
              {ICON_MAP[section.icon] || <LocalHospitalIcon />}
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={section.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: activeSection === section.key ? 600 : 400, noWrap: true }}
              />
            )}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default PortalSidebar;
