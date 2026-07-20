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
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="caption" fontWeight={600} color="primary.dark">
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
      <Stack spacing={1.5}>
        <TextField
          variant="standard"
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
        <TextField
          variant="standard"
          size="small"
          disabled={locked}
          error={validation && !values.medical_history_number}
          fullWidth
          helperText={validation && !values.medical_history_number ? 'Requerido' : ''}
          required
          label="Nro. Historia Médica"
          name="medical_history_number"
          value={values.medical_history_number || ''}
          onChange={({ target }) => onFieldChange(target)}
        />
        <Stack direction="row" spacing={1}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
              format="DD/MM/YYYY"
              label="Fecha de Nacimiento"
              value={values.birthday ? moment(values.birthday, 'YYYY-MM-DD') : null}
              onChange={onBirthdayChange}
              slotProps={{
                textField: {
                  variant: 'standard',
                  size: 'small', fullWidth: true, required: true,
                  disabled: locked,
                  error: validation && !values.birthday,
                  helperText: validation && !values.birthday ? 'Requerido' : '',
                  sx: { flex: 1 },
                },
              }}
              sx={{ flex: 1 }}
            />
          </LocalizationProvider>
          <TextField
            variant="standard"
            size="small"
            disabled
            label="Edad"
            value={age !== null ? `${age} años` : ''}
            InputProps={{ readOnly: true }}
            sx={{ width: 120 }}
          />
        </Stack>
        <TextField
          variant="standard"
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
          variant="standard"
          size="small"
          disabled={locked}
          fullWidth
          label="Apellido"
          name="lastname"
          value={values.lastname || ''}
          onChange={({ target }) => onFieldChange(target)}
        />
        <GenderSelect
          variant="standard"
          value={values.gender}
          onChange={({ target }) => onFieldChange(target)}
          error={validation && !values.gender}
          disabled={locked}
        />
        {isMinor && (
          <Stack direction="row" spacing={1}>
            <TextField
              variant="standard"
              size="small"
              disabled={locked}
              fullWidth
              label="Representante"
              name="representante"
              value={values.representante || ''}
              onChange={({ target }) => onFieldChange(target)}
            />
            <TextField
              variant="standard"
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
