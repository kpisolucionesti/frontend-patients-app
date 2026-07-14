import { Box, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Edit } from '@mui/icons-material';
import GenderSelect from "../Commons/GenderSelect";
import moment from 'moment';

const PatientSection = ({ values, locked, validation, onCiChange, onFieldChange, onBirthdayChange, onEditClick }) => {
  const birthday = values.birthday ? moment(values.birthday, 'YYYY-MM-DD') : null;
  const age = birthday ? moment().diff(birthday, 'years') : null;
  const isMinor = age !== null && age < 18;

  return (
    <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
          DATOS DEL PACIENTE
        </Typography>
        {locked && (
          <Tooltip title="Editar datos del paciente" arrow>
            <IconButton size="small" color="primary" onClick={onEditClick}>
              <Edit />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            error={validation && !values.ci}
            fullWidth
            helperText={
              validation && !values.ci
                ? 'Requerido'
                : isMinor
                  ? 'Ingrese cédula del representante + número (ej: 12345678-1)'
                  : 'Ingrese la cédula para buscar'
            }
            required
            label="Cédula"
            name="ci"
            value={values.ci || ''}
            onChange={onCiChange}
          />
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              format="DD/MM/YYYY"
              label="Fecha de Nacimiento"
              value={values.birthday ? moment(values.birthday, 'YYYY-MM-DD') : null}
              onChange={onBirthdayChange}
              slotProps={{
                textField: {
                  size: 'small', fullWidth: true, required: true,
                  disabled: locked,
                  error: validation && !values.birthday,
                  helperText: validation && !values.birthday ? 'Requerido' : '',
                },
              }}
            />
          </LocalizationProvider>
        </Stack>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            disabled={locked}
            error={validation && !values.name}
            fullWidth
            helperText={validation && !values.name ? 'Requerido' : ''}
            required
            label="Nombre"
            name="name"
            value={values.name || ''}
            onChange={({ target }) => onFieldChange(target)}
          />
          <TextField
            size="small"
            disabled={locked}
            fullWidth
            label="Apellido"
            name="lastname"
            value={values.lastname || ''}
            onChange={({ target }) => onFieldChange(target)}
          />
          <GenderSelect
            value={values.gender}
            onChange={({ target }) => onFieldChange(target)}
            error={validation && !values.gender}
            disabled={locked}
          />
        </Stack>
        {isMinor && (
          <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
            <TextField
              size="small"
              disabled={locked}
              fullWidth
              label="Representante"
              name="representante"
              value={values.representante || ''}
              onChange={({ target }) => onFieldChange(target)}
            />
            <TextField
              size="small"
              disabled={locked}
              fullWidth
              label="Cédula del Representante"
              name="representante_ci"
              value={values.representante_ci || ''}
              onChange={({ target }) => onFieldChange(target)}
            />
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default PatientSection;
