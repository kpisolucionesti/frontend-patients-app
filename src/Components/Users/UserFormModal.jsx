import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const UserFormModal = ({ open, onClose, user, onSaved, existingUsers }) => {
  const isEdit = !!user;
  const [values, setValues] = useState({
    username: user?.username || '',
    name: user?.name || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
  });
  const [validation, setValidation] = useState(false);
  const [backendErrors, setBackendErrors] = useState([]);

  const generateUsername = useCallback((name, lastname) => {
    const initial = (name || '').trim().charAt(0);
    const rest = (lastname || '').trim();
    return (initial + rest)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]/g, '');
  }, []);

  useEffect(() => {
    if (isEdit) return;
    const name = values.name?.trim();
    const lastname = values.lastname?.trim();
    if (!name) return;
    const generated = generateUsername(name, lastname);
    setValues((prev) => ({ ...prev, username: generated }));
  }, [values.name, values.lastname]);

  const usernameConflict = useMemo(() => {
    const currentUsername = values.username?.trim().toLowerCase();
    if (!currentUsername) return false;
    return (existingUsers || []).some(
      (u) => u.username?.toLowerCase() === currentUsername && u.id !== user?.id,
    );
  }, [values.username, existingUsers, user?.id]);

  const emailConflict = useMemo(() => {
    const currentEmail = values.email?.trim().toLowerCase();
    if (!currentEmail) return false;
    return (existingUsers || []).some(
      (u) => u.email?.toLowerCase() === currentEmail && u.id !== user?.id,
    );
  }, [values.email, existingUsers, user?.id]);

  const handleChange = useCallback((target) => {
    setValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setBackendErrors([]);
    if (!values.username || !values.name || !values.email) {
      alert("FALTAN DATOS POR LLENAR");
      setValidation(true);
      return;
    }
    if (usernameConflict) {
      alert("El nombre de usuario ya está en uso. Ingrese otro.");
      return;
    }
    if (emailConflict) {
      alert("El correo electrónico ya está en uso.");
      return;
    }
    try {
      if (isEdit) {
        await BackendAPI.users.update({ id: user.id, name: values.name, lastname: values.lastname, email: values.email });
      } else {
        await BackendAPI.users.create(values);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      const msgs = err.response?.data?.errors;
      if (Array.isArray(msgs) && msgs.length > 0) {
        setBackendErrors(msgs);
      } else {
        setBackendErrors([err.response?.data?.error || 'Error al guardar el usuario']);
      }
    }
  }, [values, user, isEdit, onSaved, onClose, usernameConflict, emailConflict]);

  const usernameDisabled = isEdit || !usernameConflict;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'success.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isEdit ? 'EDITAR USUARIO' : 'AGREGAR USUARIO'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {backendErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setBackendErrors([])}>
            {backendErrors.map((msg, i) => <div key={i}>{msg}</div>)}
          </Alert>
        )}
        <TextField
          variant="standard"
          fullWidth required label="Usuario" name="username" value={values.username}
          onChange={({ target }) => handleChange(target)}
          disabled={usernameDisabled}
          error={usernameConflict}
          helperText={
            isEdit
              ? 'No se puede modificar después de creado'
              : usernameConflict
                ? 'Ya existe, ingrese otro nombre de usuario'
                : 'Generado automáticamente'
          }
          sx={{ mb: 2 }}
        />
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
          fullWidth label="Apellido" name="lastname" value={values.lastname}
          onChange={({ target }) => handleChange(target)}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="standard"
          fullWidth required label="Correo" name="email" type="email" value={values.email}
          onChange={({ target }) => handleChange(target)}
          error={emailConflict}
          helperText={emailConflict ? 'Este correo ya está registrado' : ''}
          sx={{ mb: 2 }}
        />
        {!isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            La contraseña temporal para este usuario será: <strong>Emerboard20-</strong>
            <br />El usuario deberá cambiarla al iniciar sesión por primera vez.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
