import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useFetch } from '../../hooks/useFetch';
import { BackendAPI } from '../../services/BackendApi';
import { useCallback, useRef, useState } from 'react';

const CACHE_TTL = 60000;
const cache = { data: null, timestamp: 0 };

const DoctorSelect = ({ value, onChange, disabled = false, error = false }) => {
  const [doctors, setDoctors] = useState(cache.data);
  const fetching = useRef(false);

  const fetchIfNeeded = useCallback(async () => {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
      if (!doctors) setDoctors(cache.data);
      return;
    }
    if (fetching.current) return;
    fetching.current = true;
    try {
      const res = await BackendAPI.doctors.getAll();
      cache.data = res;
      cache.timestamp = now;
      setDoctors(res);
    } finally {
      fetching.current = false;
    }
  }, [doctors]);

  useFetch(fetchIfNeeded, []);

  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>Medico Tratante</InputLabel>
      <Select
        variant="standard"
        disabled={disabled}
        label="Medico Tratante"
        name="current_doctor"
        value={value || ''}
        onChange={onChange}
        error={error}
      >
        {(doctors || []).filter((d) => d.status === 'active').map((doctor) => (
          <MenuItem key={doctor.id} value={doctor.name}>
            {doctor.name} -- {doctor.speciality}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DoctorSelect;
