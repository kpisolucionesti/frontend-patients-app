import { Autocomplete, Box, MenuItem, Stack, TextField, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { CLASSIFICATION_OPTIONS } from "../../constants";

const fieldSx = {
  '& .MuiInputBase-input': { fontSize: '0.75rem' },
  '& .MuiInputLabel-root': { fontSize: '0.75rem' },
  '& .MuiFormHelperText-root': { fontSize: '0.65rem' },
};

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
          label="Médico" required
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
    <Typography variant="caption" fontWeight={600} color="primary.dark" sx={{ mb: 1.5, display: 'block' }}>
      EMERGENCIA ACTUAL
    </Typography>

    <Stack spacing={1.5}>
      {/* Row 1: Fecha Ingreso + Médico */}
      <Stack direction="row" spacing={1}>
        <TextField
          variant="standard"
          size="small"
          label="F. Ingreso"
          value={values.ingress_date || ''}
          InputProps={{ readOnly: true }}
          disabled
          sx={{ width: 130, flexShrink: 0, ...fieldSx }}
        />
        <DoctorAutocomplete
          doctors={doctors}
          value={values.current_doctor}
          validation={validation}
          onChange={(id) => onFieldChange({ name: 'current_doctor', value: id })}
        />
      </Stack>

      {/* Row 2: Clasificación + Ubicación */}
      <Stack direction="row" spacing={1}>
        <TextField select variant="standard" size="small" required
          label="Clasificación" name="classification"
          value={values.classification || ''}
          onChange={({ target }) => onFieldChange(target)}
          error={validation && !values.classification}
          helperText={validation && !values.classification ? 'Requerido' : ''}
          sx={{ flex: 1, ...fieldSx }}
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
          size="small"
          options={availableRooms || []}
          getOptionLabel={(option) => option.name}
          value={roomSelected || null}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_e, newValue) => onRoomChange(newValue)}
          disabled={!patientReady}
          sx={{ flex: 1 }}
          renderInput={(params) => (
            <TextField
              variant="standard"
              {...params} size="small"
              label="Ubicación" required
              error={validation && !roomSelected?.id}
              helperText={validation && !roomSelected?.id ? 'Requerido' : ''}
            />
          )}
        />
      </Stack>

      {/* Row 3: Diagnóstico — full width */}
      <TextField
        variant="standard"
        size="small" multiline minRows={1} required
        label="Diagnóstico" name="diagnostic"
        value={values.diagnostic || ''}
        onChange={({ target }) => onFieldChange(target)}
        error={validation && !values.diagnostic}
        helperText={validation && !values.diagnostic ? 'Requerido' : ''}
        sx={fieldSx}
      />

      {/* Row 4: Plan — full width */}
      <TextField
        variant="standard"
        size="small" required
        label="Plan" name="treatment"
        value={values.treatment || ''}
        onChange={({ target }) => onFieldChange(target)}
        error={validation && !values.treatment}
        helperText={validation && !values.treatment ? 'Requerido' : ''}
        sx={fieldSx}
      />

      {/* Row 5: Observaciones — full width */}
      <TextField
        variant="standard"
        size="small" multiline rows={2}
        label="Observaciones" name="observations"
        value={values.observations || ''}
        onChange={({ target }) => onFieldChange(target)}
        sx={fieldSx}
      />
    </Stack>
  </Box>
);

export default EmergencySection;
