import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const UserPasswordModal = ({ open, onClose, user }) => {
  const [values, setValues] = useState({
    password: '',
    password_confirmation: '',
  });
  const [validation, setValidation] = useState(false);

  const handleChange = useCallback((target) => {
    setValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!values.password || !values.password_confirmation) {
      alert("FALTAN DATOS POR LLENAR");
      setValidation(true);
      return;
    }
    if (values.password !== values.password_confirmation) {
      alert("LAS CONTRASENAS NO COINCIDEN");
      return;
    }
    try {
      await BackendAPI.users.changePassword(user.id, values);
      alert("Contrasena actualizada exitosamente");
      onClose();
    } catch {
      alert("Error al actualizar la contrasena");
    }
  }, [values, user, onClose]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        CAMBIAR CONTRASENA - {user.name}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          variant="standard"
          fullWidth required label="Nueva Contrasena" name="password" type="password" value={values.password}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.password}
          helperText={validation && !values.password ? 'Requerido' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="standard"
          fullWidth required label="Confirmar Contrasena" name="password_confirmation" type="password" value={values.password_confirmation}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.password_confirmation}
          helperText={validation && !values.password_confirmation ? 'Requerido' : ''}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="success">Actualizar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserPasswordModal;
