import React, { useCallback, useState } from 'react';
import {
  Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, FormControlLabel, InputLabel, MenuItem, Select, TextField,
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';

const DisplayFormModal = ({ open, onClose, display, onSaved }) => {
  const isEdit = !!display;
  const { data: specialties } = useFetch(() => BackendAPI.specialties.getAll(), []);
  const [values, setValues] = useState({
    name: display?.name || '',
    location: display?.location || '',
    specialty_id: display?.specialty_id || '',
    is_active: display?.is_active !== undefined ? display.is_active : true,
  });

  const handleChange = useCallback((target) => {
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setValues((prev) => ({ ...prev, [target.name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!values.name) { alert('El nombre es requerido'); return; }
    try {
      if (isEdit) {
        await BackendAPI.appointmentDisplays.update(display.id, values);
      } else {
        await BackendAPI.appointmentDisplays.create(values);
      }
      if (onSaved) onSaved();
      onClose();
    } catch { alert('Error al guardar'); }
  }, [values, display, isEdit, onSaved, onClose]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isEdit ? 'EDITAR PANTALLA' : 'AGREGAR PANTALLA'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField variant="standard" fullWidth required label="Nombre" name="name"
          value={values.name} onChange={({ target }) => handleChange(target)} sx={{ mb: 2 }} />
        <TextField variant="standard" fullWidth label="Ubicación" name="location"
          value={values.location} onChange={({ target }) => handleChange(target)} sx={{ mb: 2 }} />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Especialidad (opcional)</InputLabel>
          <Select variant="standard" name="specialty_id" value={values.specialty_id || ''}
            label="Especialidad (opcional)" onChange={(e) => handleChange(e.target)}>
            <MenuItem value="">Todas las especialidades</MenuItem>
            {(specialties || []).map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel control={
          <Checkbox name="is_active" checked={values.is_active} onChange={({ target }) => handleChange(target)} />
        } label="Activo" />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisplayFormModal;
