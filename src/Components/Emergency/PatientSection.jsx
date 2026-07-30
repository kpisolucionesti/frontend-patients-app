import { Box, IconButton, Stack, TextField, Tooltip, Typography, Grid, Paper } from "@mui/material";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Edit } from '@mui/icons-material';
import GenderSelect from "../Commons/GenderSelect";
import moment from 'moment';

const fieldSx = {
  '& .MuiInputBase-input': { fontSize: '0.75rem' },
  '& .MuiInputLabel-root': { fontSize: '0.75rem' },
  '& .MuiFormHelperText-root': { fontSize: '0.65rem' },
};

const PatientSection = ({ values, locked, validation, onCiChange, onFieldChange, onBirthdayChange, onEditClick }) => {
  const birthday = values.birthday ? moment(values.birthday, 'YYYY-MM-DD') : null;
  const age = birthday ? moment().diff(birthday, 'years') : null;
  const isMinor = age !== null && age < 18;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
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

      {locked ? (
        <Stack spacing={2}>
          <TextField
            variant="standard"
            size="small"
            label="Cédula"
            name="ci"
            value={values.ci || ''}
            onChange={onCiChange}
            sx={{ ...fieldSx }}
          />
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Paciente encontrado</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Nombre</Typography>
                <Typography variant="body2" fontWeight={500}>{values.name} {values.lastname}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">CI</Typography>
                <Typography variant="body2" fontWeight={500}>{values.ci}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Género</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {values.gender === 'M' ? 'Masculino' : values.gender === 'F' ? 'Femenino' : '—'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Fecha de Nacimiento</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {values.birthday ? moment(values.birthday).format('DD/MM/YYYY') : '—'}
                  {age !== null ? ` (${age} años)` : ''}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Nro. Historia Médica</Typography>
                <Typography variant="body2" fontWeight={500}>{values.medical_history_number || '—'}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          {/* Row 1: Cédula + Nro. Historia */}
          <Stack direction="row" spacing={1}>
            <TextField
              variant="standard"
              size="small"
              error={validation && !values.ci}
              helperText={
                validation && !values.ci
                  ? 'Requerido'
                  : isMinor
                    ? 'CI representante + dígito'
                    : ''
              }
              required
              label="Cédula"
              name="ci"
              value={values.ci || ''}
              onChange={onCiChange}
              sx={{ flex: 1, ...fieldSx }}
            />
            <TextField
              variant="standard"
              size="small"
              error={validation && !values.medical_history_number}
              helperText={validation && !values.medical_history_number ? 'Requerido' : ''}
              required
              label="Nro. Historia"
              name="medical_history_number"
              value={values.medical_history_number || ''}
              onChange={({ target }) => onFieldChange(target)}
              sx={{ flex: 1, ...fieldSx }}
            />
          </Stack>

          {/* Row 2: Fecha Nacimiento + Edad + Género */}
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                format="DD/MM/YYYY"
                label="Fecha de Nac."
                value={values.birthday ? moment(values.birthday, 'YYYY-MM-DD') : null}
                onChange={onBirthdayChange}
                slotProps={{
                  textField: {
                    variant: 'standard',
                    size: 'small',
                    required: true,
                    error: validation && !values.birthday,
                    helperText: validation && !values.birthday ? 'Requerido' : '',
                    sx: fieldSx,
                  },
                }}
                sx={{ flex: 2 }}
              />
            </LocalizationProvider>
            <TextField
              variant="standard"
              size="small"
              disabled
              label="Edad"
              value={age !== null ? `${age} años` : ''}
              InputProps={{ readOnly: true }}
              sx={{ width: 90, flexShrink: 0, ...fieldSx }}
            />
            <GenderSelect
              variant="standard"
              value={values.gender}
              onChange={({ target }) => onFieldChange(target)}
              error={validation && !values.gender}
              sx={{ flex: 1, minWidth: 100 }}
            />
          </Stack>

          {/* Row 3: Nombre + Apellido */}
          <Stack direction="row" spacing={1}>
            <TextField
              variant="standard"
              size="small"
              error={validation && !values.name}
              helperText={validation && !values.name ? 'Requerido' : ''}
              required
              label="Nombre"
              name="name"
              value={values.name || ''}
              onChange={({ target }) => onFieldChange(target)}
              sx={{ flex: 1, ...fieldSx }}
            />
            <TextField
              variant="standard"
              size="small"
              label="Apellido"
              name="lastname"
              value={values.lastname || ''}
              onChange={({ target }) => onFieldChange(target)}
              sx={{ flex: 1, ...fieldSx }}
            />
          </Stack>

          {/* Row 5: Representante — solo si es menor */}
          {isMinor && (
            <Stack direction="row" spacing={1}>
              <TextField
                variant="standard"
                size="small"
                label="Representante"
                name="representante"
                value={values.representante || ''}
                onChange={({ target }) => onFieldChange(target)}
                sx={{ flex: 1, ...fieldSx }}
              />
              <TextField
                variant="standard"
                size="small"
                label="CI Representante"
                name="representante_ci"
                value={values.representante_ci || ''}
                onChange={({ target }) => onFieldChange(target)}
                sx={{ flex: 1, ...fieldSx }}
              />
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default PatientSection;