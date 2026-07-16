import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, TextField, Typography, Avatar, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { BackendAPI } from '../../services/BackendApi';

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
    if (values.password !== values.password_confirmation) {
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
              <TextField variant="standard" fullWidth label="Nueva contrasena" name="password" type="password" value={values.password} onChange={handleChange} sx={{ mb: 2 }} required />
              <TextField variant="standard" fullWidth label="Confirmar contrasena" name="password_confirmation" type="password" value={values.password_confirmation} onChange={handleChange} sx={{ mb: 3 }} required />
              <Button fullWidth variant="contained" type="submit" sx={{ bgcolor: 'darkblue', '&:hover': { bgcolor: 'navy' } }}>
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
