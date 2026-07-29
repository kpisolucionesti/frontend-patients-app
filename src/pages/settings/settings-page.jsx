import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Typography, Paper, List, ListItemButton, ListItemText, Collapse, TextField, InputAdornment } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
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
import CompanySettingsForm from '../../Components/Settings/CompanySettingsForm';
import AuditLogsViewer from '../../Components/Settings/AuditLogsViewer';
import EmailTemplateEditor from '../../Components/Configuraciones/EmailTemplateEditor';
import ApiKeyManager from '../../Components/Configuraciones/ApiKeyManager';
import WebhookManager from '../../Components/Configuraciones/WebhookManager';
import {
  ViasManager, PresentacionesManager, ConcentracionesManager,
  MedicamentosManager, DiagnosticosManager,
  CategoriasAlergiasManager, AlergenosManager,
  CategoriasCirugiaManager, ProcedimientosQuirurgicosManager,
  AnestesiaManager, TiposAltaManager, RangosSignosVitalesManager,
} from '../../Components/Configuraciones/CatalogManagers';

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
  identidad: <CompanySettingsForm />,
  seguridad: <DynamicSettingsPanel category="seguridad" />,
  regional: <DynamicSettingsPanel category="regional" />,
  ui: <DynamicSettingsPanel category="ui" />,
  notificaciones: <DynamicSettingsPanel category="notificaciones" />,
  auditoria: <AuditLogsViewer />,
  email_templates: <EmailTemplateEditor />,
  api_keys: <ApiKeyManager />,
  webhooks: <WebhookManager />,
  vias_medicacion: <ViasManager />,
  medicamentos: <MedicamentosManager />,
  diagnosticos: <DiagnosticosManager />,
  alergenos: <AlergenosManager />,
  procedimientos_qx: <ProcedimientosQuirurgicosManager />,
  anestesia: <AnestesiaManager />,
  tipos_alta: <TiposAltaManager />,
  signos_vitales_rangos: <RangosSignosVitalesManager />,
  presentaciones: <PresentacionesManager />,
  concentraciones: <ConcentracionesManager />,
  categorias_alergias: <CategoriasAlergiasManager />,
  categorias_cirugia: <CategoriasCirugiaManager />,
};

const SECTION_LABELS = {
  medicos: 'Médicos',
  especialidades: 'Especialidades',
  agenda: 'Agenda Médica',
  usuarios: 'Usuarios',
  perfiles: 'Perfiles',
  correo: 'Correo',
  salas: 'Ubicaciones',
  estudios: 'Estudios Clínicos',
  tv_screens: 'TV Screens',
  displays: 'Displays',
  identidad: 'Identidad Visual',
  seguridad: 'Seguridad',
  regional: 'Regional',
  ui: 'Interfaz',
  notificaciones: 'Notificaciones',
  auditoria: 'Registro Actividad',
  vias_medicacion: 'Vías Medicación',
  medicamentos: 'Medicamentos',
  diagnosticos: 'Diagnósticos',
  alergenos: 'Catálogo Alergias',
  procedimientos_qx: 'Procedimientos Qx.',
  anestesia: 'Tipos Anestesia',
  tipos_alta: 'Tipos de Alta',
  signos_vitales_rangos: 'Rangos Signos Vitales',
  presentaciones: 'Presentaciones',
  concentraciones: 'Concentraciones',
  categorias_alergias: 'Categorias Alergias',
  categorias_cirugia: 'Categorias Cirugia',
  email_templates: 'Plantillas Correo',
  api_keys: 'API Keys / Tokens',
  webhooks: 'Webhooks',
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
      { key: 'medicos', label: 'Médicos', perm: 'medicos.view', subgroup: 'Personal Clinico' },
      { key: 'especialidades', label: 'Especialidades', perm: 'especialidades.view', subgroup: 'Personal Clinico' },
      { key: 'agenda', label: 'Agenda Médica', perm: 'agenda.edit', subgroup: 'Personal Clinico' },
      { key: 'salas', label: 'Ubicaciones', perm: 'rooms.view', adminOnly: true, subgroup: 'Infraestructura' },
      { key: 'estudios', label: 'Estudios Clínicos', perm: 'lab_params.view', subgroup: 'Infraestructura' },
      { key: 'vias_medicacion', label: 'Vías Medicación', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'presentaciones', label: 'Presentaciones', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'concentraciones', label: 'Concentraciones', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'medicamentos', label: 'Medicamentos', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'diagnosticos', label: 'Diagnósticos CIE-10', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'categorias_alergias', label: 'Categorías Alergias', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'alergenos', label: 'Catálogo Alergias', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'categorias_cirugia', label: 'Categorías Cirugía', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'procedimientos_qx', label: 'Procedimientos Qx.', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'anestesia', label: 'Tipos Anestesia', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'tipos_alta', label: 'Tipos de Alta', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
      { key: 'signos_vitales_rangos', label: 'Rangos Signos Vitales', perm: null, adminOnly: true, subgroup: 'Catálogos Clínicos' },
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
      { key: 'identidad', label: 'Identidad Visual', perm: null, adminOnly: true, subgroup: 'General' },
      { key: 'seguridad', label: 'Seguridad', perm: null, adminOnly: true, subgroup: 'General' },
      { key: 'regional', label: 'Regional', perm: null, adminOnly: true, subgroup: 'General' },
      { key: 'ui', label: 'Interfaz', perm: null, adminOnly: true, subgroup: 'General' },
      { key: 'notificaciones', label: 'Notificaciones', perm: null, adminOnly: true, subgroup: 'General' },
      { key: 'correo', label: 'Correo', perm: null, adminOnly: true, subgroup: 'Comunicacion' },
      { key: 'email_templates', label: 'Plantillas Correo', perm: null, adminOnly: true, subgroup: 'Comunicacion' },
      { key: 'api_keys', label: 'API Keys / Tokens', perm: null, adminOnly: true, subgroup: 'Interoperabilidad' },
      { key: 'webhooks', label: 'Webhooks', perm: null, adminOnly: true, subgroup: 'Interoperabilidad' },
      { key: 'tv_screens', label: 'Pantallas TV', perm: 'configuraciones.view', adminOnly: true, subgroup: 'Dispositivos' },
      { key: 'displays', label: 'Pantallas Citas', perm: 'citas.view', adminOnly: true, subgroup: 'Dispositivos' },
      { key: 'auditoria', label: 'Registro Actividad', perm: null, adminOnly: true, subgroup: 'Monitoreo' },
    ],
  },
];

const SIDEBAR_WIDTH = 180;

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
  const [expandedSubgroups, setExpandedSubgroups] = useState(() => {
    const init = new Set();
    GROUPS.forEach((g) => {
      const firstSub = g.sections.filter(hasAccess).find((s) => s.subgroup);
      if (firstSub) init.add(`${g.key}::${firstSub.subgroup}`);
    });
    return init;
  });
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    const g = findGroup(currentKey);
    if (g) setExpandedGroup(g.key);
  }, [currentKey]);

  const handleSectionClick = (key) => {
    setSearchParams({ tab: key }, { replace: true });
  };

  const toggleSubgroup = useCallback((groupId, subgroup) => {
    const token = `${groupId}::${subgroup}`;
    setExpandedSubgroups((prev) => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token); else next.add(token);
      return next;
    });
  }, []);

  const visibleGroups = GROUPS.filter((g) => g.sections.some(hasAccess));

  const filteredGroups = useMemo(() => {
    if (!searchFilter.trim()) return visibleGroups;
    const q = searchFilter.toLowerCase();
    return visibleGroups.map((g) => ({
      ...g,
      sections: g.sections.filter((s) =>
        hasAccess(s) && (s.label.toLowerCase().includes(q) || (s.subgroup || '').toLowerCase().includes(q))
      ),
    })).filter((g) => g.sections.length > 0);
  }, [visibleGroups, searchFilter, hasAccess]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
      <Box sx={{ px: 1.5, py: 0.75, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.85rem' }}>
          Configuraciones {currentKey && SECTION_LABELS[currentKey] && <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', fontSize: '0.8rem' }}>&gt; {SECTION_LABELS[currentKey]}</Box>}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Paper sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, borderRadius: 0, overflow: 'auto', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 0.75, flexShrink: 0 }}>
            <TextField variant="standard" size="small" fullWidth placeholder="Buscar..."
              value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment>,
                style: { fontSize: '0.68rem' },
              }}
              sx={{ '& .MuiInput-underline:before': { borderColor: 'divider' } }}
            />
          </Box>
          <List dense disablePadding sx={{ flex: 1, overflow: 'auto' }}>
            {filteredGroups.map((group) => {
              const activeSectionKeys = new Set(group.sections.filter(hasAccess).map((s) => s.key));
              const isSearching = !!searchFilter.trim();
              return (
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
                    {(() => {
                      const visible = group.sections.filter((s) => isSearching ? activeSectionKeys.has(s.key) : hasAccess(s));
                      let lastSubgroup = null;
                      const hasSubgroups = visible.some((s) => s.subgroup);
                      return visible.map((section) => {
                        const subgroup = section.subgroup;
                        const showHeader = subgroup && subgroup !== lastSubgroup;
                        const isExpanded = isSearching || !hasSubgroups || expandedSubgroups.has(`${group.key}::${subgroup}`);
                        lastSubgroup = subgroup;
                        if (!subgroup || isSearching) {
                          return (
                            <ListItemButton key={section.key}
                              selected={currentKey === section.key}
                              onClick={() => handleSectionClick(section.key)}
                              sx={{ pl: 2.5, py: 0.2, minHeight: 24 }}>
                              <ListItemText
                                primary={section.label}
                                primaryTypographyProps={{
                                  fontSize: '0.65rem',
                                  fontWeight: currentKey === section.key ? 600 : 400,
                                  color: currentKey === section.key ? 'primary.main' : 'text.secondary',
                                }}
                              />
                            </ListItemButton>
                          );
                        }
                        const subgroupVisible = visible.filter((s) => s.subgroup === subgroup);
                        return showHeader ? (
                          <Box key={subgroup}>
                            <ListItemButton
                              onClick={() => toggleSubgroup(group.key, subgroup)}
                              sx={{ px: 1.5, py: 0.2, minHeight: 24 }}>
                              <Typography variant="caption"
                                sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1 }}>
                                {subgroup}
                              </Typography>
                              {isExpanded ? <ExpandLess sx={{ fontSize: 12, color: 'text.disabled' }} /> : <ExpandMore sx={{ fontSize: 12, color: 'text.disabled' }} />}
                            </ListItemButton>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              {subgroupVisible.map((s) => (
                                <ListItemButton key={s.key}
                                  selected={currentKey === s.key}
                                  onClick={() => handleSectionClick(s.key)}
                                  sx={{ pl: 3.5, py: 0.2, minHeight: 24 }}>
                                  <ListItemText
                                    primary={s.label}
                                    primaryTypographyProps={{
                                      fontSize: '0.65rem',
                                      fontWeight: currentKey === s.key ? 600 : 400,
                                      color: currentKey === s.key ? 'primary.main' : 'text.secondary',
                                    }}
                                  />
                                </ListItemButton>
                              ))}
                            </Collapse>
                          </Box>
                        ) : null;
                      });
                    })()}
                  </List>
                </Collapse>
              </Box>
            )})}
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
