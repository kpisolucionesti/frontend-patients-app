import { Autocomplete, Box, Stack, TextField, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";

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
      size="small"
      fullWidth
      options={doctors || []}
      getOptionLabel={(option) => option.name}
      value={localValue}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      onChange={(_e, newValue) => {
        setLocalValue(newValue);
        onChange(newValue ? newValue.id : null);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Medico Principal"
          required
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
  <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2 }}>
    <Typography variant="subtitle2" fontWeight="bold" color="warning.dark" sx={{ mb: 1 }}>
      DATOS DE LA EMERGENCIA
    </Typography>
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          fullWidth
          label="Fecha de Ingreso"
          value={values.ingress_date || ''}
          InputProps={{ readOnly: true }}
          disabled
        />

        <DoctorAutocomplete
          doctors={doctors}
          value={values.current_doctor}
          validation={validation}
          onChange={(id) => onFieldChange({ name: 'current_doctor', value: id })}
        />

        <Autocomplete
          size="small"
          fullWidth
          options={availableRooms || []}
          getOptionLabel={(option) => option.name}
          value={roomSelected || null}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_e, newValue) => onRoomChange(newValue)}
          disabled={!patientReady}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ubicacion"
              required
              error={validation && !roomSelected?.id}
              helperText={validation && !roomSelected?.id ? 'Requerido' : ''}
            />
          )}
        />
      </Stack>

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
    </Stack>
  </Box>
);

export default EmergencySection;
