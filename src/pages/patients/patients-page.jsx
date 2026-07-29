import { useState } from 'react';
import { Box } from '@mui/material';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { BackendAPI } from '../../services/BackendApi';
import PatientsList from '../../Components/Patients/PatientsList';
import PatientProfile from '../../Components/Patients/PatientProfile';

const PatientsModule = () => {
  useDocumentTitle('Pacientes');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleViewPatient = async (child) => {
    try {
      const full = await BackendAPI.patients.getById(child.id);
      setSelectedPatient(full);
    } catch { /* ignore */ }
  };

  const handleBack = () => {
    setSelectedPatient(null);
  };

  if (selectedPatient) {
    return (
      <Box sx={{ height: '100%', overflow: 'hidden', bgcolor: 'background.default' }}>
        <PatientProfile patient={selectedPatient} onBack={handleBack} onViewPatient={handleViewPatient} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'hidden', bgcolor: 'background.default', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <PatientsList onSelectPatient={handleSelectPatient} embedded />
      </Box>
    </Box>
  );
};

export default PatientsModule;