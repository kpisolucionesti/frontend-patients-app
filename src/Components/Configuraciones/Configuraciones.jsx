import React, { useEffect, useState } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import usePermissions from '../../hooks/usePermissions';
import PeopleIcon from '@mui/icons-material/People';
import MedicalIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import TvIcon from '@mui/icons-material/Tv';
import PatientsList from '../Patients/PatientsList';
import DoctorsList from '../Doctors/DoctorsList';
import UsersList from '../Users/UsersList';
import ProfilesList from '../Profiles/ProfilesList';
import EmailSettingsForm from '../Settings/EmailSettingsForm';
import TvScreensManager from './TvScreensManager';

const ALL_SECTIONS = [
  { key: 'pacientes', label: 'Pacientes', icon: <PeopleIcon />, perm: 'pacientes.view' },
  { key: 'medicos', label: 'Medicos', icon: <MedicalIcon />, perm: 'medicos.view' },
  { key: 'usuarios', label: 'Usuarios', icon: <PersonIcon />, perm: 'usuarios.view' },
  { key: 'perfiles', label: 'Perfiles', icon: <AdminPanelSettingsIcon />, perm: 'perfiles.view' },
  { key: 'tv_screens', label: 'Pantallas TV', icon: <TvIcon />, perm: 'configuraciones.view', adminOnly: true },
];

const SECTION_MAP = {
  pacientes: <PatientsList />,
  medicos: <DoctorsList />,
  usuarios: <UsersList />,
  perfiles: <ProfilesList />,
  correo: <EmailSettingsForm />,
  tv_screens: <TvScreensManager />,
};

const Configuraciones = () => {
  const permissions = usePermissions();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [selected, setSelected] = useState('');

  const permSections = ALL_SECTIONS.filter((s) => {
    if (s.adminOnly && !user.is_admin) return false;
    return permissions.includes(s.perm);
  });
  const SECTIONS = user.is_admin
    ? [...permSections, { key: 'correo', label: 'Correo', icon: <EmailIcon /> }]
    : permSections;

  useEffect(() => {
    if (!selected && SECTIONS.length > 0) {
      setSelected(SECTIONS[0].key);
    } else if (selected && !SECTIONS.find((s) => s.key === selected)) {
      setSelected(SECTIONS.length > 0 ? SECTIONS[0].key : '');
    }
  }, [selected, SECTIONS]);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', gap: 0 }}>
      <Paper
        square
        sx={{
          width: 220,
          minWidth: 220,
          bgcolor: 'grey.100',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <List sx={{ pt: 2 }}>
          {SECTIONS.map((s) => (
            <ListItemButton
              key={s.key}
              selected={selected === s.key}
              onClick={() => setSelected(s.key)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{s.icon}</ListItemIcon>
              <ListItemText primary={s.label} />
            </ListItemButton>
          ))}
        </List>
      </Paper>
      <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
        {SECTION_MAP[selected]}
      </Box>
    </Box>
  );
};

export default Configuraciones;
