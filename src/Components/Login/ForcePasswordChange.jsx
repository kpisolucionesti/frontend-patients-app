import { useState } from 'react';
import {
  Box, Button, Card, CardContent, TextField, Typography, Alert, CircularProgress
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const PWD_RULES = [
  { key: 'minLen', label: '8+ caracteres', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'Mayúscula', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'Minúscula', test: (v) => /[a-z]/.test(v) },
  { key: 'num', label: 'Número', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'Especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const ForcePasswordChange = ({ onComplete }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [values, setValues] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const pwdChecks = PWD_RULES.map((r) => ({ ...r, met: r.test(values.password || '') }));
  const allPwdMet = pwdChecks.every((c) => c.met);
  const passwordsMatch = values.password === values.password_confirmation;

  const handleChange = (name) => (e) => {
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!values.current_password || !values.password || !values.password_confirmation) {
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

    setSaving(true);
    try {
      const res = await BackendAPI.users.changePassword(user.id, {
        current_password: values.current_password,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      if (res.must_change_password === false) {
        const updatedUser = { ...user, must_change_password: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      onComplete();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0] ||
        err.response?.data?.error ||
        'Error al cambiar la contraseña';
      setError(msg);
      setValues((prev) => ({ ...prev, password: '', password_confirmation: '' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" textAlign="center" sx={{ mb: 1 }}>
            Cambio de Contraseña Obligatorio
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              fullWidth required label="Contraseña actual" name="current_password" type="password"
              value={values.current_password}
              onChange={handleChange('current_password')}
              sx={{ mb: 2 }}
            />
            <TextField
              variant="standard"
              fullWidth required label="Nueva contraseña" name="password" type="password"
              value={values.password}
              onChange={handleChange('password')}
              error={!!values.password && !allPwdMet}
              sx={{ mb: 1 }}
            />
            {values.password && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {pwdChecks.map((rule) => (
                  <Typography
                    key={rule.key}
                    variant="caption"
                    sx={{ color: rule.met ? '#2e7d32' : '#9e9e9e', fontWeight: rule.met ? 600 : 400 }}
                  >
                    {rule.met ? '✓' : '✗'} {rule.label}
                  </Typography>
                ))}
              </Box>
            )}
            <TextField
              variant="standard"
              fullWidth required label="Confirmar nueva contraseña" name="password_confirmation" type="password"
              value={values.password_confirmation}
              onChange={handleChange('password_confirmation')}
              error={!!values.password_confirmation && !passwordsMatch}
              helperText={values.password_confirmation && !passwordsMatch ? 'No coincide' : ''}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth variant="outlined" type="submit" disabled={saving}
              sx={{ bgcolor: '#1565c0', color: 'white', '&:hover': { bgcolor: '#0d47a1' } }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Cambiar Contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForcePasswordChange;
