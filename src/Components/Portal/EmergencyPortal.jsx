import { useState, useCallback } from 'react';
import { Box, Paper, Typography, Grid, Tabs, Tab, Button, TextField, InputAdornment, Chip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RepeatIcon from '@mui/icons-material/Repeat';
import SearchIcon from '@mui/icons-material/Search';
import PatientInfoPanel from './PatientInfoPanel';
import PatientDashboard from './PatientDashboard';
import CurrentPatients from '../Emergency/CurrentPatients';
import AddEmergencyModal from '../Emergency/AddEmergencyModal';
import LabResultsPanel from './LabResultsPanel';
import HistoricalCasePanel from './HistoricalCasePanel';
import BreadcrumbNav from '../Commons/BreadcrumbNav';
import ExportModal from '../Commons/ExportModal';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const GENDER_MAP = { M: 'Masculino', F: 'Femenino' };

const EMERGENCY_EXPORT_COLUMNS = [
  { header: 'Cédula', accessorKey: 'patient.ci' },
  { header: 'Paciente', accessorKey: 'patient.name' },
  { header: 'Apellido', accessorKey: 'patient.lastname' },
  { header: 'Edad', accessorKey: 'patient.age' },
  { header: 'Médico', accessorKey: 'primary_doctor.name' },
  { header: 'Diagnóstico', accessorKey: 'diagnostic' },
  { header: 'Estado', accessorKey: 'status' },
  { header: 'Clasificación', accessorKey: 'classification' },
];

const EmergencyPortal = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [patientStats, setPatientStats] = useState(null);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [newIngresoOpen, setNewIngresoOpen] = useState(false);
  const [preloadPatient, setPreloadPatient] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [emergenciesData, setEmergenciesData] = useState([]);
  const [activePanel, setActivePanel] = useState('resumen');
  const { show: showSnackbar } = useSnackbar();

  const loadPatientData = useCallback(async (patient) => {
    if (!patient) return;
    try {
      const stats = await BackendAPI.patients.getStats(patient.id);
      setPatientStats(stats);
    } catch {
      showSnackbar('Error al cargar datos del paciente', 'error');
    }
  }, [showSnackbar]);

  const loadVitalSigns = useCallback(async (emergencyId) => {
    if (!emergencyId) return;
    try {
      const signs = await BackendAPI.vitalSigns.getAll(emergencyId);
      setVitalSigns(signs);
    } catch {
      setVitalSigns([]);
    }
  }, []);

  const handleSelectEmergency = useCallback(async (emergency) => {
    setSelectedEmergency(emergency);
    setSelectedPatient(emergency.patient);
    setActivePanel('resumen');
    await loadPatientData(emergency.patient);
    await loadVitalSigns(emergency.id);
  }, [loadPatientData, loadVitalSigns]);

  const handleVitalSignsCreated = useCallback(async () => {
    if (selectedEmergency) {
      await loadVitalSigns(selectedEmergency.id);
    }
  }, [selectedEmergency, loadVitalSigns]);

  const handleStartEmergency = useCallback((patient) => {
    setPreloadPatient(patient);
    setNewIngresoOpen(true);
  }, []);

  const handleCloseNewIngreso = useCallback(() => {
    setNewIngresoOpen(false);
    setPreloadPatient(null);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPatient(null);
    setSelectedEmergency(null);
    setPatientStats(null);
    setVitalSigns([]);
    setActivePanel('resumen');
  }, []);

  const handleOpenLabPanel = useCallback(() => {
    setActivePanel('laboratorio');
  }, []);

  const handleEmergencyCreated = useCallback(() => {
    setNewIngresoOpen(false);
    setPreloadPatient(null);
    setRefreshKey(k => k + 1);
    handleClearSelection();
  }, [handleClearSelection]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
      <BreadcrumbNav
        crumbs={[
          ...(selectedPatient
            ? [
                { label: 'Emergencia', onClick: () => { handleClearSelection(); } },
                { label: `${selectedPatient.name} ${selectedPatient.lastname}` },
              ]
            : [{ label: 'Emergencia' }]
          ),
        ]}
      />
      {selectedPatient ? (
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedEmergency && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', px: 2 }}>
              <Tabs
                value={activePanel}
                onChange={(_, v) => setActivePanel(v)}
                sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', minHeight: 36 }, '& .Mui-selected': { color: 'primary.main', fontWeight: 700 } }}
                TabIndicatorProps={{ sx: { bgcolor: 'primary.main', height: 3 } }}
              >
                <Tab label="Resumen" value="resumen" />
                <Tab label="Historial de Casos" value="historial_casos" />
                <Tab label="Laboratorio" value="laboratorio" />
              </Tabs>
            </Box>
          )}
          {activePanel === 'historial_casos' ? (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: 'background.default' }}>
              <HistoricalCasePanel patient={selectedPatient} currentEmergencyId={selectedEmergency?.id} />
            </Box>
          ) : activePanel === 'laboratorio' ? (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: 'background.default' }}>
              <LabResultsPanel emergencyId={selectedEmergency?.id} patientGender={selectedPatient?.gender} />
            </Box>
          ) : (
          <Box sx={{
            display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 0, overflow: 'auto', px: 2, pt: 1,
          '& .MuiInputLabel-root': { color: 'text.primary', fontWeight: 600, transform: 'translate(0, -1.5px) scale(0.75) !important' },
                '& .MuiInputLabel-root.Mui-focused': { color: 'text.primary' },
                '& .MuiInputLabel-root.Mui-disabled': { color: 'text.disabled' },
            '& .MuiInputLabel-shrink': { transform: 'translate(0, -1.5px) scale(0.75) !important' },
          }}>
            {selectedPatient?.disabled && (
              <Paper sx={{ p: 1, bgcolor: 'text.primary', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" fontWeight={700}>PACIENTE FALLECIDO — Solo lectura</Typography>
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Paper sx={{ p: 1.5, bgcolor: 'primary.light', borderLeft: '4px solid', borderColor: 'primary.main' }}>
                  <Typography variant="caption" fontWeight={700} sx={{ mb: 0.75, display: 'block', color: 'primary.main', fontSize: '0.8rem' }}>
                    DATOS DEL PACIENTE
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Nombre</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.name} {selectedPatient.lastname}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>CI</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.ci || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Edad</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.age || '?'} años</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Sexo</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{GENDER_MAP[selectedPatient.gender] || selectedPatient.gender || 'N/A'}</Typography>
                    </Grid>
                    {selectedPatient.representante && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Representante</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.representante}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>CI Representante</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.representante_ci || 'N/A'}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Paper sx={{ bgcolor: 'primary.light', p: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <CalendarTodayIcon color="primary" sx={{ fontSize: 18 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Última Visita</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{patientStats?.last_visit_date || 'N/A'}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ bgcolor: 'secondary.light', p: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <RepeatIcon color="secondary" sx={{ fontSize: 18 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Total Visitas</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{patientStats?.total_visits ?? '0'}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <PatientInfoPanel
                patient={selectedPatient}
                emergency={selectedEmergency}
                onStartEmergency={handleStartEmergency}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <PatientDashboard
                patient={selectedPatient}
                stats={patientStats}
                emergencyId={selectedEmergency?.id}
                vitalSigns={vitalSigns}
                onVitalSignsCreated={handleVitalSignsCreated}
                onOpenLabPanel={handleOpenLabPanel}
              />
            </Box>
          </Box>
        </Box>
        )}
      </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, flexShrink: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                Emergencias Activas
              </Typography>
              <Chip label={emergencyCount} size="small" color="primary" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
            </Box>
            <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => setNewIngresoOpen(true)} sx={{ fontSize: '0.8rem' }}>
              Nuevo Ingreso
            </Button>
          </Box>
          <Box sx={{ px: 2, pb: 1, flexShrink: 0, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Buscar paciente por nombre o CI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 350 }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
            />
            <ExportModal data={emergenciesData} columns={EMERGENCY_EXPORT_COLUMNS} filename="Emergencias_Activas" buttonLabel="Descarga" />
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 2, pb: 2, display: 'flex', flexDirection: 'column' }}>
            <CurrentPatients refreshKey={refreshKey} searchQuery={searchQuery} onSelectEmergency={handleSelectEmergency} embedded onCountChange={setEmergencyCount} onEmergenciesChange={setEmergenciesData} />
          </Box>
        </Box>
      )}
      <AddEmergencyModal
        open={newIngresoOpen}
        onClose={handleCloseNewIngreso}
        onEmergencyCreated={handleEmergencyCreated}
        preloadPatient={preloadPatient}
      />
    </Box>
  );
};

export default EmergencyPortal;
