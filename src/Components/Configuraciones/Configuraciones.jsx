import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import usePermissions from '../../hooks/usePermissions';
import DoctorsList from '../Doctors/DoctorsList';
import UsersList from '../Users/UsersList';
import ProfilesList from '../Profiles/ProfilesList';
import EmailSettingsForm from '../Settings/EmailSettingsForm';
import TvScreensManager from './TvScreensManager';
import UbicacionesManager from './UbicacionesManager';
import LabParametersManager from './LabParametersManager';
import SpecialtiesManager from './SpecialtiesManager';
import DoctorSchedulePanel from '../Doctors/DoctorSchedulePanel';
import DisplaysManager from './DisplaysManager';

const SECTION_MAP = {
  medicos: <DoctorsList />,
  especialidades: <SpecialtiesManager />,
  agenda: <DoctorSchedulePanel />,
  usuarios: <UsersList />,
  perfiles: <ProfilesList />,
  correo: <EmailSettingsForm />,
  salas: <UbicacionesManager />,
  laboratorio: <LabParametersManager />,
  tv_screens: <TvScreensManager />,
  displays: <DisplaysManager />,
};

const SECTION_LABELS = {
  medicos: 'Médicos',
  especialidades: 'Especialidades',
  agenda: 'Agenda',
  usuarios: 'Usuarios',
  perfiles: 'Perfiles',
  correo: 'Correo',
  salas: 'Salas',
  laboratorio: 'Laboratorio',
  tv_screens: 'TV Screens',
  displays: 'Displays',
};

const Configuraciones = () => {
  const permissions = usePermissions();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('tab') || '';

  const ALL_KEYS = [
    { key: 'medicos', perm: 'medicos.view' },
    { key: 'especialidades', perm: 'especialidades.view' },
    { key: 'agenda', perm: 'agenda.edit' },
    { key: 'usuarios', perm: 'usuarios.view' },
    { key: 'perfiles', perm: 'perfiles.view' },
    { key: 'salas', perm: 'rooms.view', adminOnly: true },
    { key: 'laboratorio', perm: 'lab_params.view' },
    { key: 'tv_screens', perm: 'configuraciones.view', adminOnly: true },
    { key: 'displays', perm: 'citas.view', adminOnly: true },
  ];

  const validKeys = ALL_KEYS.filter((item) => {
    if (item.adminOnly && !user.is_admin) return false;
    return permissions.includes(item.perm);
  });
  if (user.is_admin) validKeys.push({ key: 'correo' });

  const currentKey = validKeys.find((k) => k.key === selected) ? selected : (validKeys[0]?.key || '');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
      <Box sx={{ px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider', bgcolor: 'white', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '1rem' }}>
          Configuraciones {currentKey && SECTION_LABELS[currentKey] && <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary' }}>&gt; {SECTION_LABELS[currentKey]}</Box>}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {SECTION_MAP[currentKey] || <Box sx={{ p: 2 }}>Selecciona una sección</Box>}
      </Box>
    </Box>
  );
};

export default Configuraciones;
