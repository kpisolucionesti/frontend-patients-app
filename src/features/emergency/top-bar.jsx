import React from 'react';
import { Box, Typography, Chip, Button, Tooltip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const TopBar = React.memo(function TopBar({ emergencyCount, selectedPatient, onNewIngreso, lastUpdated }) {
  return (
    <Box sx={{ px: 2, py: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Typography component="h2" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem', m: 0 }}>
          Módulo de Emergencia
        </Typography>
        {!selectedPatient && (
          <Chip label={`${emergencyCount} activas`} size="small" color="primary" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
        )}
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary" role="status" aria-live="polite" sx={{ fontSize: '0.7rem' }}>
            {new Date(lastUpdated).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        )}
      </Box>
      <Tooltip title="Nueva Emergencia (Ctrl+Shift+N)" arrow>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={onNewIngreso} sx={{ fontSize: '0.8rem' }}>
          Nuevo Ingreso
        </Button>
      </Tooltip>
    </Box>
  );
});

export default TopBar;
