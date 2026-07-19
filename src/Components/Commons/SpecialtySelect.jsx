import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useFetch } from '../../hooks/useFetch';
import { BackendAPI } from '../../services/BackendApi';

const SpecialtySelect = ({ value, onChange, name = 'specialty_id', disabled = false, error = false, required = false, label = 'Especialidad' }) => {
  const { data: specialties } = useFetch(
    () => BackendAPI.specialties.getAll(), [],
  );

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        variant="standard"
        disabled={disabled}
        label={label}
        name={name}
        value={value || ''}
        onChange={onChange}
        error={error}
        required={required}
      >
        {(specialties || []).filter((s) => s.is_active).map((specialty) => (
          <MenuItem key={specialty.id} value={specialty.id}>
            {specialty.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SpecialtySelect;
