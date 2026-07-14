import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';

const GENDERS = ['Masculino', 'Femenino', 'Otros'];

const GenderSelect = ({ value, onChange, disabled = false, error = false }) => (
  <FormControl fullWidth>
    <InputLabel>Genero</InputLabel>
    <Select
      variant="outlined"
      disabled={disabled}
      error={error}
      required
      label="Genero"
      name="gender"
      value={value || ''}
      onChange={onChange}
    >
      {GENDERS.map((g) => (
        <MenuItem key={g} value={g}>{g}</MenuItem>
      ))}
    </Select>
    {error && <FormHelperText>Requerido</FormHelperText>}
  </FormControl>
);

export default GenderSelect;
