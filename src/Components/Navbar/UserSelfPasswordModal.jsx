import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert, Typography } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const PWD_RULES = [
  { key: 'minLen', label: '8+ caracteres', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'Mayúscula', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'Minúscula', test: (v) => /[a-z]/.test(v) },
  { key: 'num', label: 'Número', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'Especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const UserSelfPasswordModal = ({ open, onClose }) => {
  const [values, setValues] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pwdChecks = PWD_RULES.map((r) => ({ ...r, met: r.test(values.password || '') }));
  const allPwdMet = pwdChecks.every((c) => c.met);
  const passwordsMatch = values.password === values.password_confirmation;

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
    if (!allPwdMet) {
      setError('La nueva contraseña no cumple con los requisitos mínimos');
      return;
    }
    if (!passwordsMatch) {
      setError('Las contrasenas no coinciden');
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await BackendAPI.users.changePassword(user.id, values);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || err.response?.data?.error || 'Error al cambiar contrasena');
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
              <TextField variant="standard" fullWidth label="Contrasena actual" name="current_password" type="password" value={values.current_password} onChange={handleChange} sx={{ mb: 2 }} required />
              <TextField variant="standard" fullWidth label="Nueva contrasena" name="password" type="password" value={values.password} onChange={handleChange} error={!!values.password && !allPwdMet} sx={{ mb: 1 }} required />
              {values.password && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                  {pwdChecks.map((rule) => (
                    <Typography key={rule.key} variant="caption" sx={{ color: rule.met ? '#2e7d32' : '#9e9e9e', fontWeight: rule.met ? 600 : 400 }}>
                      {rule.met ? '✓' : '✗'} {rule.label}
                    </Typography>
                  ))}
                </Box>
              )}
              <TextField variant="standard" fullWidth label="Confirmar contrasena" name="password_confirmation" type="password" value={values.password_confirmation} onChange={handleChange} error={!!values.password_confirmation && !passwordsMatch} helperText={values.password_confirmation && !passwordsMatch ? 'No coincide' : ''} sx={{ mb: 2 }} required />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={onClose} variant="outlined" color="error">{success ? 'Cerrar' : 'Cancelar'}</Button>
          {!success && <Button type="submit" variant="outlined" color="primary">Cambiar</Button>}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserSelfPasswordModal;
