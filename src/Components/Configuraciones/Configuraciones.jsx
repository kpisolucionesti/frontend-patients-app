import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import usePermissions from '../../hooks/usePermissions';
import MedicalIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import TvIcon from '@mui/icons-material/Tv';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ScienceIcon from '@mui/icons-material/Science';
import SectionSidebar from '../Commons/SectionSidebar';
import DoctorsList from '../Doctors/DoctorsList';
import UsersList from '../Users/UsersList';
import ProfilesList from '../Profiles/ProfilesList';
import EmailSettingsForm from '../Settings/EmailSettingsForm';
import TvScreensManager from './TvScreensManager';
import UbicacionesManager from './UbicacionesManager';
import LabParametersManager from './LabParametersManager';

const ALL_SECTIONS = [
  { key: 'medicos', label: 'Medicos', icon: <MedicalIcon />, perm: 'medicos.view' },
  { key: 'usuarios', label: 'Usuarios', icon: <PersonIcon />, perm: 'usuarios.view' },
  { key: 'perfiles', label: 'Perfiles', icon: <AdminPanelSettingsIcon />, perm: 'perfiles.view' },
  { key: 'salas', label: 'Salas', icon: <MeetingRoomIcon />, perm: 'rooms.view', adminOnly: true },
  { key: 'laboratorio', label: 'Laboratorio', icon: <ScienceIcon />, perm: 'lab_params.view' },
  { key: 'tv_screens', label: 'Pantallas TV', icon: <TvIcon />, perm: 'configuraciones.view', adminOnly: true },
];

const SECTION_MAP = {
  medicos: <DoctorsList />,
  usuarios: <UsersList />,
  perfiles: <ProfilesList />,
  correo: <EmailSettingsForm />,
  salas: <UbicacionesManager />,
  laboratorio: <LabParametersManager />,
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
      <SectionSidebar
        sections={SECTIONS}
        activeSection={selected}
        onSectionChange={setSelected}
        collapsible={false}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f0f4ff' }}>
        {SECTION_MAP[selected]}
      </Box>
    </Box>
  );
};

export default Configuraciones;
