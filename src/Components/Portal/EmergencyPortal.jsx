import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import PortalSidebar from './PortalSidebar';
import PatientInfoPanel from './PatientInfoPanel';
import PatientDashboard from './PatientDashboard';
import CurrentPatients from '../Emergency/CurrentPatients';
import PatientsList from '../Patients/PatientsList';
import TablePatients from '../History/TablePatients';
import AddEmergencyModal from '../Emergency/AddEmergencyModal';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

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

  const handleClearSelection = useCallback(() => {
    setSelectedPatient(null);
    setSelectedEmergency(null);
    setPatientStats(null);
    setVitalSigns([]);
  }, []);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f0f4ff' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {selectedPatient ? (
            <Box sx={{ display: 'flex', gap: 1.5, flex: 1, minHeight: 0 }}>
              <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
                <PatientInfoPanel
                  patient={selectedPatient}
                  emergency={selectedEmergency}
                  vitalSigns={vitalSigns}
                  onVitalSignsCreated={handleVitalSignsCreated}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
                <PatientDashboard
                  patient={selectedPatient}
                  stats={patientStats}
                  emergencyId={selectedEmergency?.id}
                />
              </Box>
            </Box>
          ) : (
            <>
              {activeSection === 'activos' && (
                <CurrentPatients onSelectEmergency={handleSelectEmergency} embedded />
              )}
              {activeSection === 'pacientes' && (
                <PatientsList onSelectPatient={handleSelectPatient} embedded />
              )}
              {activeSection === 'historial' && (
                <TablePatients onSelectEmergency={handleSelectEmergency} embedded />
              )}
            </>
          )}
        </Box>
      </Box>
      <AddEmergencyModal
        open={newIngresoOpen}
        onClose={() => setNewIngresoOpen(false)}
        onEmergencyCreated={() => {
          setNewIngresoOpen(false);
          handleClearSelection();
        }}
      />
    </Box>
  );
};

export default EmergencyPortal;
