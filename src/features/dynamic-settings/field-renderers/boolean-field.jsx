import { FormControlLabel, Switch } from '@mui/material';

const BooleanField = ({ field, value, onChange }) => (
  <FormControlLabel
    control={
      <Switch size="small" checked={!!value}
        onChange={(_, checked) => onChange(checked)} />
    }
    label={field.ui?.label || field.key}
    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
  />
);

export default BooleanField;
