import { Paper, Typography, Box } from '@mui/material';
import BooleanField from './field-renderers/boolean-field';
import StringField from './field-renderers/string-field';
import IntegerField from './field-renderers/integer-field';
import SelectField from './field-renderers/select-field';

const RENDERERS = {
  boolean: BooleanField,
  string: StringField,
  integer: IntegerField,
  select: SelectField,
};

const resolveRenderer = (field) => {
  if (field.ui?.control) return RENDERERS[field.ui.control] || StringField;
  if (field.type === 'boolean') return BooleanField;
  if (field.type === 'integer') return IntegerField;
  if (field.enum) return SelectField;
  return StringField;
};

const DynamicFormGroup = ({ label, fields, values, onChange }) => (
  <Paper sx={{ p: 1.5 }}>
    <Typography variant="caption" fontWeight={600}
      sx={{ fontSize: '0.7rem', color: 'text.secondary', mb: 1, display: 'block' }}>
      {label.toUpperCase()}
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {fields.map((field) => {
        const Renderer = resolveRenderer(field);
        return (
          <Renderer
            key={field.key}
            field={field}
            value={values[field.key]}
            onChange={(v) => onChange(field.key, v)}
          />
        );
      })}
    </Box>
  </Paper>
);

export default DynamicFormGroup;
