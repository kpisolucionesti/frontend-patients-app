import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, TextField, Typography, Avatar, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BackendAPI } from '../../services/BackendApi';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Ingrese su correo electronico'); return; }
    try {
      await BackendAPI.auth.forgotPassword(email);
      setSent(true);
      setError('');
    } catch {
      setError('Error al enviar la solicitud');
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
            <Typography variant="h5" fontWeight="bold">RECUPERAR CONTRASENA</Typography>
          </Box>
          {sent ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Si el correo existe, recibira instrucciones para restablecer su contrasena.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TextField variant="standard" fullWidth label="Correo Electronico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 3 }} required />
              <Button fullWidth variant="contained" type="submit" sx={{ bgcolor: 'darkblue', '&:hover': { bgcolor: 'navy' }, mb: 1 }}>
                Enviar
              </Button>
            </form>
          )}
          <Button fullWidth variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 1 }}>
            Volver al inicio de sesion
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
