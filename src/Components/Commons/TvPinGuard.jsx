import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BackendAPI } from '../../services/BackendApi';

const STORAGE_KEY = 'tv_auth_token';
const SCREEN_NAME_KEY = 'tv_screen_name';

const TvPinGuard = ({ screen, children }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem(STORAGE_KEY));

  if (authenticated) return children;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enteredPin) return;
    try {
      const res = await BackendAPI.tvScreens.auth(screen.name, enteredPin);
      localStorage.setItem(STORAGE_KEY, res.auth_token);
      localStorage.setItem(SCREEN_NAME_KEY, screen.name);
      setAuthenticated(true);
      setError(false);
    } catch {
      setError(true);
      setEnteredPin('');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0a1628' }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 360 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Acceso Sala de Emergencia
        </Typography>
        <Typography variant="body1" fontWeight="bold" textAlign="center" color="primary">
          {screen.name} — {screen.location}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Ingrese el PIN de acceso
        </Typography>
        <TextField
          variant="standard"
          type="password"
          size="small"
          label="PIN de acceso"
          value={enteredPin}
          onChange={(e) => setEnteredPin(e.target.value)}
          error={error}
          helperText={error ? 'PIN incorrecto' : ''}
          inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
          autoFocus
        />
        <Button type="submit" variant="outlined" fullWidth>
          Ingresar
        </Button>
      </Paper>
    </Box>
  );
};

export default TvPinGuard;
