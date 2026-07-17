import { useState, useCallback } from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import PortalSidebar from './PortalSidebar';
import PatientInfoPanel from './PatientInfoPanel';
import PatientDashboard from './PatientDashboard';
import CurrentPatients from '../Emergency/CurrentPatients';
import PatientsList from '../Patients/PatientsList';
import TablePatients from '../History/TablePatients';
import AddEmergencyModal from '../Emergency/AddEmergencyModal';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const GENDER_MAP = { M: 'Masculino', F: 'Femenino' };

const SECTIONS = [
  { key: 'activos', label: 'Emergencias Activas', icon: 'local_hospital' },
  { key: 'pacientes', label: 'Pacientes', icon: 'people' },
  { key: 'historial', label: 'Historial Clínico', icon: 'history' },
];

const EmergencyPortal = () => {
  const [activeSection, setActiveSection] = useState('activos');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [patientStats, setPatientStats] = useState(null);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [newIngresoOpen, setNewIngresoOpen] = useState(false);
  const [preloadPatient, setPreloadPatient] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
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
    await loadPatientData(emergency.patient);
    await loadVitalSigns(emergency.id);
  }, [loadPatientData, loadVitalSigns]);

  const handleSelectPatient = useCallback(async (patient) => {
    setSelectedPatient(patient);
    setSelectedEmergency(null);
    await loadPatientData(patient);
    setVitalSigns([]);
  }, [loadPatientData]);

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
  }, []);

  const handleEmergencyCreated = useCallback(() => {
    setNewIngresoOpen(false);
    setPreloadPatient(null);
    setRefreshKey(k => k + 1);
    handleClearSelection();
  }, [handleClearSelection]);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <PortalSidebar
        sections={SECTIONS}
        activeSection={activeSection}
        onSectionChange={(section) => {
          if (section === activeSection && selectedPatient) {
            handleClearSelection();
          } else {
            handleClearSelection();
            setActiveSection(section);
          }
        }}
        onNewIngreso={() => setNewIngresoOpen(true)}
      />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f0f4ff' }}>
        {selectedPatient ? (
          <Box sx={{
            display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 0, overflow: 'auto', px: 2, pt: 1,
            '& .MuiInputLabel-root': { color: '#212121 !important', fontWeight: 600, transform: 'translate(0, -1.5px) scale(0.75) !important' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#212121 !important' },
            '& .MuiInputLabel-root.Mui-disabled': { color: '#757575 !important' },
            '& .MuiInputLabel-shrink': { transform: 'translate(0, -1.5px) scale(0.75) !important' },
          }}>
            {selectedPatient?.disabled && (
              <Paper sx={{ p: 1, bgcolor: '#212121', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" fontWeight={700}>PACIENTE FALLECIDO — Solo lectura</Typography>
              </Paper>
            )}
            <Paper sx={{ p: 1.5, bgcolor: '#e3f2fd', borderLeft: '4px solid #1565c0' }}>
              <Typography variant="caption" fontWeight={700} sx={{ mb: 0.75, display: 'block', color: '#1565c0', fontSize: '0.8rem' }}>
                DATOS DEL PACIENTE
              </Typography>
              <Grid container spacing={1} sx={{ maxWidth: 700 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Nombre</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.name} {selectedPatient.lastname}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>CI</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.ci || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Edad</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.age || '?'} años</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Sexo</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{GENDER_MAP[selectedPatient.gender] || selectedPatient.gender || 'N/A'}</Typography>
                </Grid>
                {selectedPatient.representante && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Representante</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.representante}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>CI Representante</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedPatient.representante_ci || 'N/A'}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
            <Box sx={{ display: 'flex', gap: 1.5, flex: 1, minHeight: 0 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <PatientInfoPanel
                  patient={selectedPatient}
                  emergency={selectedEmergency}
                  vitalSigns={vitalSigns}
                  onVitalSignsCreated={handleVitalSignsCreated}
                  onStartEmergency={handleStartEmergency}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <PatientDashboard
                  patient={selectedPatient}
                  stats={patientStats}
                  emergencyId={selectedEmergency?.id}
                />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {activeSection === 'activos' && (
              <CurrentPatients refreshKey={refreshKey} onSelectEmergency={handleSelectEmergency} embedded />
            )}
            {activeSection === 'pacientes' && (
              <PatientsList onSelectPatient={handleSelectPatient} embedded />
            )}
            {activeSection === 'historial' && (
              <TablePatients onSelectEmergency={handleSelectEmergency} embedded />
            )}
          </Box>
        )}
      </Box>
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
