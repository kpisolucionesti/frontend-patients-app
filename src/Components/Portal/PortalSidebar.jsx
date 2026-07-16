import { Box, Button, List, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const ICON_MAP = {
  local_hospital: <LocalHospitalIcon />,
  people: <PeopleIcon />,
  history: <HistoryIcon />,
  assessment: <AssessmentIcon />,
};

const PortalSidebar = ({ sections, activeSection, onSectionChange, onNewIngreso }) => {
  return (
    <Box
      sx={{
        width: 280,
        minWidth: 280,
        bgcolor: '#f5f7fa',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<AddCircleIcon />}
          onClick={onNewIngreso}
          sx={{ bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' } }}
        >
          Nuevo Ingreso
        </Button>
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
              '&.Mui-selected': {
                bgcolor: '#e3f2fd',
                '&:hover': { bgcolor: '#bbdefb' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {ICON_MAP[section.icon] || <LocalHospitalIcon />}
            </ListItemIcon>
            <ListItemText
              primary={section.label}
              primaryTypographyProps={{ fontSize: 14, fontWeight: activeSection === section.key ? 600 : 400 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default PortalSidebar;
