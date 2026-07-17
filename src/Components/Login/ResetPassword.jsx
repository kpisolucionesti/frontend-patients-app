import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, TextField, Typography, Avatar, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { BackendAPI } from '../../services/BackendApi';

const PWD_RULES = [
  { key: 'minLen', label: '8+ caracteres', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'Mayúscula', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'Minúscula', test: (v) => /[a-z]/.test(v) },
  { key: 'num', label: 'Número', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'Especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [values, setValues] = useState({
    reset_password_token: searchParams.get('reset_token') || '',
    password: '',
    password_confirmation: '',
  });
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
    if (!values.password || !values.password_confirmation) {
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
    if (!values.reset_password_token) {
      setError('Token de recuperacion invalido');
      return;
    }
    try {
      const response = await BackendAPI.auth.resetPassword(values);
      if (response.status === 'success') {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('user_permissions', JSON.stringify(response.user.permissions));
        setSuccess(true);
        setTimeout(() => navigate('/patients', { replace: true }), 1500);
      } else {
        setError(response.message || 'Error al restablecer contrasena');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer contrasena');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ m: 1, bgcolor: 'darkblue', width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">NUEVA CONTRASENA</Typography>
          </Box>
          {success ? (
            <Alert severity="success">Contrasena restablecida exitosamente. Redirigiendo...</Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
              <TextField variant="standard" fullWidth label="Confirmar contrasena" name="password_confirmation" type="password" value={values.password_confirmation} onChange={handleChange} error={!!values.password_confirmation && !passwordsMatch} helperText={values.password_confirmation && !passwordsMatch ? 'No coincide' : ''} sx={{ mb: 3 }} required />
              <Button fullWidth variant="outlined" type="submit" sx={{ bgcolor: 'darkblue', '&:hover': { bgcolor: 'navy' } }}>
                Restablecer
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
