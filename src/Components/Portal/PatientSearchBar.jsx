import { useState, useCallback, useRef } from 'react';
import { Box, TextField, Autocomplete, Chip } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const PatientSearchBar = ({ onSelectPatient, selectedPatient, onClearSelection }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async (value) => {
    if (!value || value.length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await BackendAPI.patients.getAll({ q: value, per_page: 20 });
      setOptions(res.data || []);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((_, value) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(value), 300);
  }, [handleSearch]);

  const handleSelect = useCallback((_, patient) => {
    if (patient) {
      onSelectPatient(patient);
      setInputValue(`${patient.name} ${patient.lastname} - ${patient.ci || ''}`);
    }
  }, [onSelectPatient]);

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 2, pb: 0 }}>
      <Autocomplete
        options={options}
        loading={loading}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleSelect}
        getOptionLabel={(opt) => `${opt.name} ${opt.lastname} - CI: ${opt.ci || 'N/A'} (${opt.age || '?'} años)`}
        renderOption={(props, opt) => (
          <li {...props} key={opt.id}>
            <Box>
              <strong>{opt.name} {opt.lastname}</strong>
              <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: 12 }}>
                CI: {opt.ci || 'N/A'} | {opt.age || '?'} años
              </Box>
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Buscar paciente por nombre o cédula..."
            size="small"
            sx={{ flex: 1 }}
          />
        )}
        sx={{ flex: 1, maxWidth: 500 }}
        noOptionsText="Sin resultados"
      />
      {selectedPatient && (
        <Chip
          label={`${selectedPatient.name} ${selectedPatient.lastname}`}
          onDelete={onClearSelection}
          color="primary"
          size="small"
        />
      )}
    </Box>
  );
};

export default PatientSearchBar;
