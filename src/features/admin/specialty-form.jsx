import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const SpecialtyFormModal = ({ open, onClose, specialty, onSaved }) => {
  const isEdit = !!specialty;
  const [values, setValues] = useState({
    name: specialty?.name || '',
    description: specialty?.description || '',
    is_active: specialty?.is_active !== undefined ? specialty.is_active : true,
  });
  const [validation, setValidation] = useState(false);

  const handleChange = useCallback((target) => {
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setValues((prev) => ({ ...prev, [target.name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!values.name) {
      alert("EL NOMBRE ES REQUERIDO");
      setValidation(true);
      return;
    }
    try {
      if (isEdit) {
        await BackendAPI.specialties.update({ id: specialty.id, ...values });
      } else {
        await BackendAPI.specialties.create(values);
      }
      if (onSaved) onSaved();
      onClose();
    } catch {
      alert("Error al guardar la especialidad");
    }
  }, [values, specialty, isEdit, onSaved, onClose]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isEdit ? 'EDITAR ESPECIALIDAD' : 'AGREGAR ESPECIALIDAD'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          variant="standard"
          fullWidth required label="Nombre" name="name" value={values.name}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.name}
          helperText={validation && !values.name ? 'Requerido' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="standard"
          fullWidth label="Descripción" name="description" value={values.description}
          onChange={({ target }) => handleChange(target)}
          multiline rows={3}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="is_active"
              checked={values.is_active}
              onChange={({ target }) => handleChange(target)}
            />
          }
          label="Activo"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SpecialtyFormModal;
