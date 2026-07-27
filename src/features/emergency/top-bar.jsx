import React from 'react';
import { Box, Typography, Chip, Button, Tooltip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const TopBar = React.memo(function TopBar({ emergencyCount, selectedPatient, onNewIngreso }) {
  return (
    <Box sx={{ px: 2, py: 1, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h1" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem', m: 0 }}>
          Módulo de Emergencia
        </Typography>
        {!selectedPatient && (
          <Chip label={`${emergencyCount} activas`} size="small" color="primary" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
        )}
      </Box>
      <Tooltip title="Nueva Emergencia (Ctrl+N)" arrow>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={onNewIngreso} sx={{ fontSize: '0.8rem' }}>
          Nuevo Ingreso
        </Button>
      </Tooltip>
    </Box>
  );
});

export default TopBar;
