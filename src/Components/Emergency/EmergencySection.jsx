import { Autocomplete, Box, MenuItem, Stack, TextField, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { CLASSIFICATION_OPTIONS } from "../../constants";

const DoctorAutocomplete = ({ doctors, value, validation, onChange }) => {
  const [localValue, setLocalValue] = useState(null);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const found = (doctors || []).find((d) => d.id === value);
      if (found) setLocalValue(found);
    } else {
      setLocalValue(null);
    }
  }, [value, doctors]);

  return (
    <Autocomplete
      size="small" fullWidth
      options={(doctors || []).filter((d) => d.status === 'active')}
      getOptionLabel={(option) => option.name}
      value={localValue}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      onChange={(_e, newValue) => {
        setLocalValue(newValue);
        onChange(newValue ? newValue.id : null);
      }}
      renderInput={(params) => (
        <TextField
          variant="standard"
          {...params} size="small"
          label="Medico Principal" required
          error={validation && !value}
          helperText={validation && !value ? 'Requerido' : ''}
        />
      )}
    />
  );
};

const EmergencySection = ({
  values, validation, doctors, availableRooms, roomSelected, patientReady,
  onFieldChange, onRoomChange,
}) => (
  <Box>
    <Typography variant="caption" fontWeight={600} color="warning.dark" sx={{ mb: 1, display: 'block' }}>
      EMERGENCIA ACTUAL
    </Typography>
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1}>
        <TextField
          variant="standard"
          size="small" fullWidth
          label="Fecha de Ingreso"
          value={values.ingress_date || ''}
          InputProps={{ readOnly: true }}
          disabled
          sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' } }}
        />
        <DoctorAutocomplete
          doctors={doctors}
          value={values.current_doctor}
          validation={validation}
          onChange={(id) => onFieldChange({ name: 'current_doctor', value: id })}
        />
      </Stack>

      <TextField select variant="standard" size="small" fullWidth required
        label="Clasificación" name="classification"
        value={values.classification || ''}
        onChange={({ target }) => onFieldChange(target)}
        error={validation && !values.classification}
        helperText={validation && !values.classification ? 'Requerido' : ''}
      >
        {CLASSIFICATION_OPTIONS.map((opt) => (
          <MenuItem key={opt.key} value={opt.key}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: opt.color }} />
              {opt.label}
            </Box>
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        size="small" fullWidth
        options={availableRooms || []}
        getOptionLabel={(option) => option.name}
        value={roomSelected || null}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_e, newValue) => onRoomChange(newValue)}
        disabled={!patientReady}
        renderInput={(params) => (
          <TextField
            variant="standard"
            {...params} size="small"
            label="Ubicacion" required
            error={validation && !roomSelected?.id}
            helperText={validation && !roomSelected?.id ? 'Requerido' : ''}
          />
        )}
      />

      <TextField
        variant="standard"
        size="small" multiline minRows={1} fullWidth required
        label="Diagnostico" name="diagnostic"
        value={values.diagnostic || ''}
        onChange={({ target }) => onFieldChange(target)}
        error={validation && !values.diagnostic}
        helperText={validation && !values.diagnostic ? 'Requerido' : ''}
        sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' } }}
      />

      <TextField
        variant="standard"
        size="small" fullWidth required
        label="Plan" name="treatment"
        value={values.treatment || ''}
        onChange={({ target }) => onFieldChange(target)}
        error={validation && !values.treatment}
        helperText={validation && !values.treatment ? 'Requerido' : ''}
        sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' } }}
      />

      <TextField
        variant="standard"
        size="small" fullWidth multiline rows={2}
        label="Observaciones" name="observations"
        value={values.observations || ''}
        onChange={({ target }) => onFieldChange(target)}
        sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' } }}
      />
    </Stack>
  </Box>
);

export default EmergencySection;
