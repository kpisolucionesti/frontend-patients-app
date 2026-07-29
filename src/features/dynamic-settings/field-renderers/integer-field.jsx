import { TextField } from '@mui/material';

const IntegerField = ({ field, value, onChange }) => (
  <TextField variant="standard" size="small" fullWidth type="number"
    label={field.ui?.label || field.key}
    value={value ?? ''}
    onChange={(e) => {
      const v = e.target.value;
      onChange(v === '' ? '' : Number(v));
    }}
    helperText={field.ui?.hint}
    inputProps={{ min: field.minimum, max: field.maximum, style: { fontSize: '0.75rem' } }}
  />
);

export default IntegerField;
