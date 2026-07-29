import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItemButton, ListItemText, Collapse } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import usePermissions from '../../hooks/usePermissions';
import DoctorsList from '../../Components/Doctors/DoctorsList';
import UsersList from '../../Components/Users/UsersList';
import ProfilesList from '../../Components/Profiles/ProfilesList';
import EmailSettingsForm from '../../Components/Settings/EmailSettingsForm';
import TvScreensManager from '../../Components/Configuraciones/TvScreensManager';
import UbicacionesManager from '../../Components/Configuraciones/UbicacionesManager';
import ClinicalStudiesManager from '../../Components/Configuraciones/ClinicalStudiesManager';
import SpecialtiesManager from '../../Components/Configuraciones/SpecialtiesManager';
import DoctorSchedulePanel from '../../Components/Doctors/DoctorSchedulePanel';
import DisplaysManager from '../../Components/Configuraciones/DisplaysManager';
import DynamicSettingsPanel from '../../features/dynamic-settings/dynamic-settings-panel';

const SECTION_MAP = {
  medicos: <DoctorsList />,
  especialidades: <SpecialtiesManager />,
  agenda: <DoctorSchedulePanel />,
  usuarios: <UsersList />,
  perfiles: <ProfilesList />,
  correo: <EmailSettingsForm />,
  salas: <UbicacionesManager />,
  estudios: <ClinicalStudiesManager />,
  tv_screens: <TvScreensManager />,
  displays: <DisplaysManager />,
  dynamic_settings: <DynamicSettingsPanel />,
};

const SECTION_LABELS = {
  medicos: 'Médicos',
  especialidades: 'Especialidades',
  agenda: 'Agenda',
  usuarios: 'Usuarios',
  perfiles: 'Perfiles',
  correo: 'Correo',
  salas: 'Ubicaciones',
  estudios: 'Estudios Clínicos',
  tv_screens: 'TV Screens',
  displays: 'Displays',
  dynamic_settings: 'Config. Dinamica',
};

const GROUP_ICONS = {
  datos: <StorageIcon sx={{ fontSize: 16 }} />,
  usuarios: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />,
  sistema: <SettingsIcon sx={{ fontSize: 16 }} />,
};

const GROUPS = [
  {
    key: 'datos',
    label: 'Datos Maestros',
    sections: [
      { key: 'medicos', label: 'Médicos', perm: 'medicos.view' },
      { key: 'especialidades', label: 'Especialidades', perm: 'especialidades.view' },
      { key: 'agenda', label: 'Agenda Médica', perm: 'agenda.edit' },
      { key: 'salas', label: 'Ubicaciones', perm: 'rooms.view', adminOnly: true },
      { key: 'estudios', label: 'Estudios Clínicos', perm: 'lab_params.view' },
    ],
  },
  {
    key: 'usuarios',
    label: 'Usuarios y Perfiles',
    sections: [
      { key: 'usuarios', label: 'Usuarios', perm: 'usuarios.view' },
      { key: 'perfiles', label: 'Perfiles', perm: 'perfiles.view' },
    ],
  },
  {
    key: 'sistema',
    label: 'Sistema',
    sections: [
      { key: 'tv_screens', label: 'Pantallas TV', perm: 'configuraciones.view', adminOnly: true },
      { key: 'displays', label: 'Pantallas Citas', perm: 'citas.view', adminOnly: true },
      { key: 'correo', label: 'Correo', perm: null, adminOnly: true },
      { key: 'dynamic_settings', label: 'Config. Dinamica', perm: null, adminOnly: true },
    ],
  },
];

const SIDEBAR_WIDTH = 160;

const Configuraciones = () => {
  useDocumentTitle('Configuración');
  const permissions = usePermissions();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get('tab') || '';

  const allSections = GROUPS.flatMap((g) => g.sections);

  const hasAccess = (item) => {
    if (item.adminOnly && !user.is_admin) return false;
    if (item.perm === null && user.is_admin) return true;
    if (item.perm) return permissions.includes(item.perm);
    return false;
  };

  const validSections = allSections.filter(hasAccess);
  const currentKey = validSections.find((s) => s.key === selected) ? selected : (validSections[0]?.key || '');

  const findGroup = (sectionKey) => GROUPS.find((g) => g.sections.some((s) => s.key === sectionKey));
  const initialGroup = findGroup(currentKey)?.key || GROUPS[0]?.key || '';
  const [expandedGroup, setExpandedGroup] = useState(initialGroup);

  useEffect(() => {
    const g = findGroup(currentKey);
    if (g) setExpandedGroup(g.key);
  }, [currentKey]);

  const handleSectionClick = (key) => {
    setSearchParams({ tab: key }, { replace: true });
  };

  const visibleGroups = GROUPS.filter((g) => g.sections.some(hasAccess));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
      <Box sx={{ px: 1.5, py: 0.75, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.85rem' }}>
          Configuraciones {currentKey && SECTION_LABELS[currentKey] && <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', fontSize: '0.8rem' }}>&gt; {SECTION_LABELS[currentKey]}</Box>}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Paper sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, borderRadius: 0, overflow: 'auto', borderRight: 1, borderColor: 'divider' }}>
          <List dense disablePadding>
            {visibleGroups.map((group) => (
              <Box key={group.key}>
                <ListItemButton
                  onClick={() => setExpandedGroup(expandedGroup === group.key ? null : group.key)}
                  sx={{ px: 1, py: 0.5, minHeight: 32 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', mr: 0.5 }}>
                    {GROUP_ICONS[group.key]}
                  </Box>
                  <ListItemText
                    primary={group.label}
                    primaryTypographyProps={{ fontSize: '0.7rem', fontWeight: 600 }}
                  />
                  {expandedGroup === group.key ? <ExpandLess sx={{ fontSize: 14 }} /> : <ExpandMore sx={{ fontSize: 14 }} />}
                </ListItemButton>
                <Collapse in={expandedGroup === group.key} timeout="auto" unmountOnExit>
                  <List dense disablePadding>
                    {group.sections.filter(hasAccess).map((section) => (
                      <ListItemButton
                        key={section.key}
                        selected={currentKey === section.key}
                        onClick={() => handleSectionClick(section.key)}
                        sx={{ pl: 2.5, py: 0.3, minHeight: 26 }}
                      >
                        <ListItemText
                          primary={section.label}
                          primaryTypographyProps={{
                            fontSize: '0.68rem',
                            fontWeight: currentKey === section.key ? 600 : 400,
                            color: currentKey === section.key ? 'primary.main' : 'text.secondary',
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))}
          </List>
        </Paper>
        <Box key={currentKey} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', bgcolor: 'background.default' }}>
          {SECTION_MAP[currentKey] || <Box sx={{ p: 2 }}>Selecciona una sección</Box>}
        </Box>
      </Box>
    </Box>
  );
};

export default Configuraciones;
