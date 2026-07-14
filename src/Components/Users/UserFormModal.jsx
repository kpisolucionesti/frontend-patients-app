import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const UserFormModal = ({ open, onClose, user, onSaved }) => {
  const isEdit = !!user;
  const [values, setValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
  });
  const [validation, setValidation] = useState(false);

  const handleChange = useCallback((target) => {
    setValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!values.name || !values.email) {
      alert("FALTAN DATOS POR LLENAR");
      setValidation(true);
      return;
    }
    if (!isEdit && (!values.password || !values.password_confirmation)) {
      alert("DEBE INGRESAR CONTRASENA");
      setValidation(true);
      return;
    }
    if (values.password && values.password !== values.password_confirmation) {
      alert("LAS CONTRASENAS NO COINCIDEN");
      return;
    }
    try {
      if (isEdit) {
        await BackendAPI.users.update({ id: user.id, name: values.name, email: values.email });
      } else {
        await BackendAPI.users.create(values);
      }
      if (onSaved) onSaved();
      onClose();
    } catch {
      alert("Error al guardar el usuario");
    }
  }, [values, user, isEdit, onSaved, onClose]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'success.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isEdit ? 'EDITAR USUARIO' : 'AGREGAR USUARIO'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          fullWidth required label="Nombre" name="name" value={values.name}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.name}
          helperText={validation && !values.name ? 'Requerido' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth required label="Correo" name="email" type="email" value={values.email}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.email}
          helperText={validation && !values.email ? 'Requerido' : ''}
          sx={{ mb: 2 }}
        />
        {!isEdit && (
          <>
            <TextField
              fullWidth required label="Contrasena" name="password" type="password" value={values.password}
              onChange={({ target }) => handleChange(target)}
              error={validation && !values.password}
              helperText={validation && !values.password ? 'Requerido' : ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth required label="Confirmar Contrasena" name="password_confirmation" type="password" value={values.password_confirmation}
              onChange={({ target }) => handleChange(target)}
              error={validation && !values.password_confirmation}
              helperText={validation && !values.password_confirmation ? 'Requerido' : ''}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
