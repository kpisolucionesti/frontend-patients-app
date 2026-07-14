import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert, Typography } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const UserSelfPasswordModal = ({ open, onClose }) => {
  const [values, setValues] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.current_password || !values.password || !values.password_confirmation) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (values.password !== values.password_confirmation) {
      setError('Las contrasenas no coinciden');
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await BackendAPI.users.changePassword(user.id, values);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar contrasena');
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          CAMBIAR CONTRASENA
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Contrasena actualizada exitosamente</Alert>}
          {!success && (
            <>
              <TextField fullWidth label="Contrasena actual" name="current_password" type="password" value={values.current_password} onChange={handleChange} sx={{ mb: 2 }} required />
              <TextField fullWidth label="Nueva contrasena" name="password" type="password" value={values.password} onChange={handleChange} sx={{ mb: 2 }} required />
              <TextField fullWidth label="Confirmar contrasena" name="password_confirmation" type="password" value={values.password_confirmation} onChange={handleChange} sx={{ mb: 2 }} required />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={onClose} variant="contained" color="error">{success ? 'Cerrar' : 'Cancelar'}</Button>
          {!success && <Button type="submit" variant="contained" color="primary">Cambiar</Button>}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserSelfPasswordModal;
