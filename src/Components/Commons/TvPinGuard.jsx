import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';

const STORAGE_KEY = 'tv_auth_token';
const SCREEN_NAME_KEY = 'tv_screen_name';

const TvPinGuard = ({ children }) => {
  const { data: screens, loading } = useFetch(() => BackendAPI.tvScreens.listActive(), []);
  const [selectedName, setSelectedName] = useState(localStorage.getItem(SCREEN_NAME_KEY) || '');
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  if (authenticated) return children;

  const hasScreens = screens && screens.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedName || !enteredPin) return;
    try {
      const res = await BackendAPI.tvScreens.auth(selectedName, enteredPin);
      localStorage.setItem(STORAGE_KEY, res.auth_token);
      localStorage.setItem(SCREEN_NAME_KEY, selectedName);
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
        {loading ? (
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Cargando...
          </Typography>
        ) : !hasScreens ? (
          <>
            <Typography variant="body2" color="error" textAlign="center">
              No hay pantallas configuradas. Contacte al administrador.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Seleccione la pantalla e ingrese el PIN de acceso
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Pantalla</InputLabel>
              <Select
                value={selectedName}
                label="Pantalla"
                onChange={(e) => setSelectedName(e.target.value)}
              >
                {screens.map((s) => (
                  <MenuItem key={s.id} value={s.name}>{s.name} — {s.location}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
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
            <Button type="submit" variant="contained" fullWidth>
              Ingresar
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default TvPinGuard;
