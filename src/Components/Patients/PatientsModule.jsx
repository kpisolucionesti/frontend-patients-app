import React, { useState } from 'react';
import { Box, TextField, Button, Alert, Typography, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import PatientsList from './PatientsList';
import PatientProfile from './PatientProfile';

const PatientsModule = () => {
  const [view, setView] = useState('search');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchCi, setSearchCi] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [showList, setShowList] = useState(false);
  const { show: showSnackbar } = useSnackbar();

  const handleSearchCi = async () => {
    if (!searchCi.trim()) return;
    setSearchError(null);
    try {
      const found = await BackendAPI.patients.findByCi(searchCi.trim());
      if (found) {
        setSelectedPatient(found);
        setView('profile');
      } else {
        setSearchError('Paciente no encontrado con esa cédula');
      }
    } catch {
      setSearchError('Error al buscar paciente');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchCi();
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setView('profile');
  };

  const handleBack = () => {
    setSelectedPatient(null);
    setView('search');
    setSearchError(null);
  };

  if (view === 'profile' && selectedPatient) {
    return (
      <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden', bgcolor: '#f0f4ff' }}>
        <PatientProfile patient={selectedPatient} onBack={handleBack} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', overflow: 'hidden', bgcolor: '#f0f4ff', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
        <Typography variant="h6" fontWeight={600}>
          Buscar Paciente
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Cédula"
            value={searchCi}
            onChange={(e) => { setSearchCi(e.target.value); setSearchError(null); }}
            onKeyDown={handleKeyDown}
            sx={{ flex: 1, maxWidth: 300 }}
          />
          <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearchCi}>
            Buscar
          </Button>
        </Box>
        {searchError && <Alert severity="warning" onClose={() => setSearchError(null)}>{searchError}</Alert>}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, height: '1px', bgcolor: '#e0e0e0' }} />
          <Typography variant="caption" color="text.secondary">O</Typography>
          <Box sx={{ flex: 1, height: '1px', bgcolor: '#e0e0e0' }} />
        </Box>
        <Button
          variant="outlined"
          startIcon={<PeopleIcon />}
          onClick={() => setShowList(!showList)}
          sx={{ alignSelf: 'center' }}
        >
          {showList ? 'Ocultar lista de pacientes' : 'Ver todos los pacientes'}
        </Button>
      </Paper>

      {showList && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <PatientsList onSelectPatient={handleSelectPatient} embedded />
        </Box>
      )}
    </Box>
  );
};

export default PatientsModule;
