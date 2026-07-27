import { memo } from 'react';
import { Box, Typography } from '@mui/material';

const SectionHeader = memo(function SectionHeader({ icon, label, color }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
      {icon}
      <Typography variant="caption" fontWeight={700} sx={{ color, fontSize: '0.75rem', letterSpacing: '0.03em' }}>
        {label}
      </Typography>
    </Box>
  );
});

export default SectionHeader;
