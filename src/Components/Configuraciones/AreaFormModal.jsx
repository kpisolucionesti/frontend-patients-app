import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Switch, TextField, FormControlLabel } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useSnackbar } from "../../hooks/useSnackbar";

const AreaFormModal = ({ open, onClose, area, onSaved }) => {
  const isEdit = !!area;
  const { show } = useSnackbar();
  const [values, setValues] = useState({
    name: area?.name || '',
    room_type: area?.room_type || '',
    description: area?.description || '',
    no_restriction: !area?.room_type,
  });
  const [validation, setValidation] = useState(false);

  const handleChange = useCallback((target) => {
    setValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleTypeChange = useCallback((value) => {
    setValues((prev) => ({ ...prev, room_type: value, no_restriction: false }));
  }, []);

  const handleNoRestrictionToggle = useCallback((checked) => {
    setValues((prev) => ({
      ...prev,
      no_restriction: checked,
      room_type: checked ? '' : prev.room_type,
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const errors = {};
    if (!values.name) errors.name = true;

    if (Object.keys(errors).length > 0) {
      setValidation(errors);
      return;
    }

    const payload = {
      name: values.name,
      room_type: values.no_restriction ? null : (values.room_type || null),
      description: values.description || null,
    };

    try {
      if (isEdit) {
        await BackendAPI.areas.update(area.id, payload);
        show('Área actualizada exitosamente', 'success');
      } else {
        await BackendAPI.areas.create(payload);
        show('Área creada exitosamente', 'success');
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      show(err.response?.data?.error || 'Error al guardar', 'error');
    }
  }, [values, area, isEdit, onSaved, onClose, show]);

  const getError = (field) => validation[field];

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isEdit ? 'EDITAR ÁREA' : 'AGREGAR ÁREA'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          variant="standard"
          fullWidth required label="Nombre" name="name" value={values.name}
          onChange={({ target }) => handleChange(target)}
          error={!!getError('name')}
          helperText={getError('name') ? 'Requerido' : ''}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth variant="standard" sx={{ mb: 1 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            variant="standard"
            name="room_type"
            value={values.no_restriction ? '' : values.room_type}
            onChange={({ target }) => handleTypeChange(target.value)}
            disabled={values.no_restriction}
          >
            <MenuItem value="adulto">Adultos</MenuItem>
            <MenuItem value="pediatria">Pediatría</MenuItem>
            <MenuItem value="quirofano">Quirófano</MenuItem>
            <MenuItem value="hospitalizacion">Hospitalización</MenuItem>
            <MenuItem value="uci">UCI</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={values.no_restriction}
              onChange={(_, checked) => handleNoRestrictionToggle(checked)}
            />
          }
          label="Sin restricción de edad"
          sx={{ mb: 2 }}
        />
        <TextField
          variant="standard"
          fullWidth label="Descripción" name="description" value={values.description}
          onChange={({ target }) => handleChange(target)}
          multiline rows={2}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AreaFormModal;
