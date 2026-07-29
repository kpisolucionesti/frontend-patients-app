import { TextField, MenuItem } from '@mui/material';

const SelectField = ({ field, value, onChange }) => (
  <TextField variant="standard" size="small" select fullWidth
    label={field.ui?.label || field.key}
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    helperText={field.ui?.hint}
    inputProps={{ style: { fontSize: '0.75rem' } }}>
    {(field.ui?.options || []).map((opt) => (
      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
    ))}
  </TextField>
);

export default SelectField;
