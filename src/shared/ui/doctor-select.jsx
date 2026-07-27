import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useDoctors } from '../../hooks/useApiData';

const DoctorSelect = ({ value, onChange, disabled = false, error = false }) => {
  const { data: doctors } = useDoctors();

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
            {doctor.name} -- {doctor.specialty?.name || ''}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DoctorSelect;
