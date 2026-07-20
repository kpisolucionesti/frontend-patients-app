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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [showList, setShowList] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const { show: showSnackbar } = useSnackbar();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchError(null);
    setSearchResults(null);
    try {
      const res = await BackendAPI.patients.getAll({ q: searchQuery.trim(), page: 1, per_page: 50 });
      const patients = res.data || [];
      if (patients.length === 0) {
        setSearchError('No se encontraron pacientes con ese criterio de búsqueda');
      } else if (patients.length === 1) {
        setSelectedPatient(patients[0]);
        setView('profile');
      } else {
        setSearchResults(patients);
        setShowList(true);
        showSnackbar(`Se encontraron ${res.total} pacientes`, 'info');
      }
    } catch {
      setSearchError('Error al buscar pacientes');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setView('profile');
  };

  const handleBack = () => {
    setSelectedPatient(null);
    setView('search');
    setSearchError(null);
    setSearchResults(null);
  };

  if (view === 'profile' && selectedPatient) {
    return (
      <Box sx={{ height: '100%', overflow: 'hidden', bgcolor: '#f0f4ff' }}>
        <PatientProfile patient={selectedPatient} onBack={handleBack} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'hidden', bgcolor: '#f0f4ff', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
          Buscar Paciente
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            label="Cédula, Nombre o Apellido"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchError(null); }}
            onKeyDown={handleKeyDown}
            sx={{ flex: 1, maxWidth: 350 }}
          />
          <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
            Buscar
          </Button>
        </Box>
        {searchResults && (
          <Typography variant="caption" color="text.secondary">
            {searchResults.length} resultados
          </Typography>
        )}
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
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          <PatientsList onSelectPatient={handleSelectPatient} embedded initialSearch={searchQuery} />
        </Box>
      )}
    </Box>
  );
};

export default PatientsModule;
