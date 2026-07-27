import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';

const GENDERS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otros' },
];

const GenderSelect = ({ value, onChange, disabled = false, error = false, variant }) => (
  <FormControl fullWidth variant={variant}>
    <InputLabel>Genero</InputLabel>
    <Select
      variant={variant}
      size="small"
      disabled={disabled}
      error={error}
      required
      label="Genero"
      name="gender"
      value={value || ''}
      onChange={onChange}
    >
      {GENDERS.map((g) => (
        <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
      ))}
    </Select>
    {error && <FormHelperText>Requerido</FormHelperText>}
  </FormControl>
);

export default GenderSelect;
