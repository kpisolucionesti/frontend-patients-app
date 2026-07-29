import { TextField } from '@mui/material';

const StringField = ({ field, value, onChange }) => (
  <TextField variant="standard" size="small" fullWidth
    label={field.ui?.label || field.key}
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    helperText={field.ui?.hint}
    inputProps={{ maxLength: field.maxLength, style: { fontSize: '0.75rem' } }}
  />
);

export default StringField;
