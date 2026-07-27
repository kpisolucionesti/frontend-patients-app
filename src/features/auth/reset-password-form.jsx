import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Box, Button, Card, CardContent, TextField, Typography, Avatar, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { BackendAPI } from '../../services/BackendApi';
import { useAuth } from '../../hooks/useAuth';

const PWD_RULES = [
  { key: 'minLen', label: '8+ caracteres', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'Mayúscula', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'Minúscula', test: (v) => /[a-z]/.test(v) },
  { key: 'num', label: 'Número', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'Especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signIn } = useAuth();
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
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!values.reset_password_token) {
      setError('Token de recuperación inválido');
      return;
    }
    try {
      const response = await BackendAPI.auth.resetPassword(values);
      if (response.status === 'success') {
        signIn(response);
        setSuccess(true);
        setTimeout(() => navigate('/patients', { replace: true }), 1500);
      } else {
        setError(response.message || 'Error al restablecer contraseña');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer contraseña');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight={700}>NUEVA CONTRASEÑA</Typography>
          </Box>
          {success ? (
            <Alert severity="success">Contraseña restablecida exitosamente. Redirigiendo...</Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <TextField variant="standard" fullWidth label="Nueva contraseña" name="password" type="password" value={values.password} onChange={handleChange} error={!!values.password && !allPwdMet} sx={{ mb: 1 }} required />
              {values.password && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                  {pwdChecks.map((rule) => (
                    <Typography key={rule.key} variant="caption" sx={{ color: rule.met ? theme.palette.success.main : theme.palette.grey[500], fontWeight: rule.met ? 600 : 400 }}>
                      {rule.met ? '✓' : '✗'} {rule.label}
                    </Typography>
                  ))}
                </Box>
              )}
              <TextField variant="standard" fullWidth label="Confirmar contraseña" name="password_confirmation" type="password" value={values.password_confirmation} onChange={handleChange} error={!!values.password_confirmation && !passwordsMatch} helperText={values.password_confirmation && !passwordsMatch ? 'No coincide' : ''} sx={{ mb: 3 }} required />
              <Button fullWidth variant="contained" type="submit">
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