import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useSnackbar } from "../../hooks/useSnackbar";

const TvScreenFormModal = ({ open, onClose, screen, onSaved }) => {
  const isEdit = !!screen;
  const { show } = useSnackbar();
  const [values, setValues] = useState({
    name: screen?.name || '',
    location: screen?.location || '',
    route: screen?.route || '',
    pin: '',
    pinConfirm: '',
  });
  const [validation, setValidation] = useState(false);

  const handleChange = useCallback((target) => {
    setValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const errors = {};
    if (!values.name) errors.name = true;
    if (!values.location) errors.location = true;
    if (!values.route) errors.route = true;
    if (!isEdit && !values.pin) errors.pin = true;
    if (values.pin && values.pin !== values.pinConfirm) errors.pinConfirm = true;
    if (values.pin && values.pin.length < 4) errors.pin = true;

    if (Object.keys(errors).length > 0) {
      setValidation(errors);
      return;
    }

    try {
      if (isEdit) {
        const payload = { name: values.name, location: values.location, route: values.route };
        if (values.pin) payload.pin = values.pin;
        await BackendAPI.tvScreens.update(screen.id, payload);
        show('Pantalla actualizada exitosamente', 'success');
      } else {
        await BackendAPI.tvScreens.create({ name: values.name, location: values.location, route: values.route, pin: values.pin });
        show('Pantalla creada exitosamente', 'success');
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      show(err.response?.data?.error || 'Error al guardar', 'error');
    }
  }, [values, screen, isEdit, onSaved, onClose, show]);

  const getError = (field) => validation[field];

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isEdit ? 'EDITAR PANTALLA TV' : 'AGREGAR PANTALLA TV'}
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
        <TextField
          variant="standard"
          fullWidth required label="Ubicación" name="location" value={values.location}
          onChange={({ target }) => handleChange(target)}
          error={!!getError('location')}
          helperText={getError('location') ? 'Requerido' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="standard"
          fullWidth required label="Ruta URL" name="route" value={values.route}
          onChange={({ target }) => handleChange(target)}
          error={!!getError('route')}
          helperText={getError('route') ? 'Requerido' : values.route ? `/${values.route}` : 'ej. adulto, pediatria'}
          inputProps={{ maxLength: 30, style: { textTransform: 'lowercase' } }}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="standard"
          fullWidth type="password" label={isEdit ? 'Nuevo PIN (dejar vacío para mantener)' : 'PIN'}
          name="pin" value={values.pin}
          onChange={({ target }) => handleChange(target)}
          error={!!getError('pin')}
          helperText={getError('pin') ? (values.pin && values.pin.length < 4 ? 'Mínimo 4 dígitos' : 'Requerido') : ''}
          inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
          sx={{ mb: 2 }}
        />
        {values.pin && (
          <TextField
            variant="standard"
            fullWidth type="password" label="Confirmar PIN" name="pinConfirm"
            value={values.pinConfirm}
            onChange={({ target }) => handleChange(target)}
            error={!!getError('pinConfirm')}
            helperText={getError('pinConfirm') ? 'Los PIN no coinciden' : ''}
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TvScreenFormModal;
