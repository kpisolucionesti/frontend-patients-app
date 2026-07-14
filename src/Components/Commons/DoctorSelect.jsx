import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useFetch } from '../../hooks/useFetch';
import { BackendAPI } from '../../services/BackendApi';

const DoctorSelect = ({ value, onChange, disabled = false, error = false }) => {
  const { data: doctors } = useFetch(() => BackendAPI.doctors.getAll(), []);

  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>Medico Tratante</InputLabel>
      <Select
        variant="outlined"
        disabled={disabled}
        label="Medico Tratante"
        name="current_doctor"
        value={value || ''}
        onChange={onChange}
        error={error}
      >
        {(doctors || []).map((doctor) => (
          <MenuItem key={doctor.id} value={doctor.name}>
            {doctor.name} -- {doctor.speciality}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DoctorSelect;
