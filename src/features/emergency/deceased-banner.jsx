import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const DeceasedBanner = React.memo(function DeceasedBanner({ patient }) {
  if (!patient?.disabled) return null;

  return (
    <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
      <Paper sx={{ p: 1.25, bgcolor: 'text.primary', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <WarningIcon sx={{ fontSize: 20 }} />
        <Box>
          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem' }}>PACIENTE FALLECIDO</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
            {patient.name} {patient.lastname} · CI: {patient.ci} · Solo lectura
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
});

export default DeceasedBanner;
