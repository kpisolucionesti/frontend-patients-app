import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';

const EmergencySection = ({
  values, validation, doctors, availableRooms, roomSelected,
  onFieldChange, onIngressDateChange, onRoomChange,
}) => (
  <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2 }}>
    <Typography variant="subtitle2" fontWeight="bold" color="warning.dark" sx={{ mb: 1 }}>
      DATOS DE LA EMERGENCIA
    </Typography>
    <Stack spacing={1}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DatePicker
          format="DD/MM/YYYY"
          label="Fecha de Ingreso"
          value={moment(values.ingress_date, 'DD/M/YYYY')}
          onChange={onIngressDateChange}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </LocalizationProvider>

      <TextField
        size="small"
        multiline minRows={1}
        fullWidth required
        label="Diagnostico" name="diagnostic"
        value={values.diagnostic || ''}
        onChange={({ target }) => onFieldChange(target)}
        error={validation && !values.diagnostic}
        helperText={validation && !values.diagnostic ? 'Requerido' : ''}
      />

      <TextField
        size="small" fullWidth required
        label="Plan" name="treatment"
        value={values.treatment || ''}
        onChange={({ target }) => onFieldChange(target)}
        error={validation && !values.treatment}
        helperText={validation && !values.treatment ? 'Requerido' : ''}
      />

      <FormControl size="small" fullWidth required error={validation && !values.current_doctor}>
        <InputLabel>Medico Principal</InputLabel>
        <Select label="Medico Principal" name="current_doctor" value={values.current_doctor || ''} onChange={({ target }) => onFieldChange(target)}>
          {(doctors || []).map((d) => (
            <MenuItem key={d.id} value={d.name}>{d.name} -- {d.speciality}</MenuItem>
          ))}
        </Select>
        <FormHelperText>{validation && !values.current_doctor ? 'Requerido' : ''}</FormHelperText>
      </FormControl>

      <FormControl size="small" fullWidth required error={validation && !roomSelected?.id}>
        <InputLabel>Ubicacion</InputLabel>
        <Select label="Ubicacion" value={roomSelected?.id || ''} onChange={({ target }) => onRoomChange(availableRooms.find((r) => r.id === target.value) || null)}>
          {availableRooms.map((r) => (
            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
          ))}
        </Select>
        <FormHelperText>{validation && !roomSelected?.id ? 'Requerido' : ''}</FormHelperText>
      </FormControl>
    </Stack>
  </Box>
);

export default EmergencySection;
