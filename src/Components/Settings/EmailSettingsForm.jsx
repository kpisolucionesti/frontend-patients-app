import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select, Switch, TextField, Typography, Alert } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const EmailSettingsForm = () => {
  const [values, setValues] = useState({
    smtp_address: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    sender_email: '',
    authentication: 'login',
    enable_starttls_auto: true,
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await BackendAPI.emailSettings.show();
        setValues((prev) => ({
          ...prev,
          ...data,
          smtp_password: data.smtp_password ? '' : '',
        }));
      } catch { /* first time - no settings yet */ }
      setLoaded(true);
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setMessage(null);
    setError(null);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const data = { ...values };
      if (!data.smtp_password) delete data.smtp_password;
      await BackendAPI.emailSettings.update(data);
      setMessage('Configuracion guardada exitosamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }, [values]);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setMessage(null);
    setError(null);
    try {
      const data = { ...values };
      if (!data.smtp_password) delete data.smtp_password;
      const result = await BackendAPI.emailSettings.test(data);
      setMessage(result.message || 'Conexion SMTP exitosa');
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexion');
    } finally {
      setTesting(false);
    }
  }, [values]);

  if (!loaded) return null;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: 'primary.dark' }}>
          CONFIGURACION DE CORREO SMTP
        </Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField variant="standard" fullWidth size="small" label="Direccion SMTP" name="smtp_address" value={values.smtp_address} onChange={handleChange} placeholder="smtp.ejemplo.com" />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField variant="standard" size="small" label="Puerto" name="smtp_port" type="number" value={values.smtp_port} onChange={handleChange} sx={{ width: 120 }} />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Autenticacion</InputLabel>
              <Select variant="standard" name="authentication" value={values.authentication} label="Autenticacion" onChange={handleChange}>
                <MenuItem value="login">login</MenuItem>
                <MenuItem value="plain">plain</MenuItem>
                <MenuItem value="cram_md5">cram_md5</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TextField variant="standard" fullWidth size="small" label="Usuario" name="smtp_username" value={values.smtp_username} onChange={handleChange} />
          <TextField variant="standard" fullWidth size="small" label="Contrasena" name="smtp_password" type="password" value={values.smtp_password} onChange={handleChange} placeholder={values.smtp_password === '' ? 'Sin cambios' : ''} />
          <TextField variant="standard" fullWidth size="small" label="Correo Remitente" name="sender_email" value={values.sender_email} onChange={handleChange} placeholder="noreply@ejemplo.com" />
          <FormControlLabel control={<Switch name="enable_starttls_auto" checked={values.enable_starttls_auto} onChange={handleChange} />} label="Habilitar STARTTLS" />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
            <Button variant="outlined" color="info" onClick={handleTest} disabled={testing || !values.smtp_address}>
              {testing ? <CircularProgress size={20} /> : 'Probar Conexion'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmailSettingsForm;
