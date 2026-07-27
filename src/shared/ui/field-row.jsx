import { memo } from 'react';
import { Box, Typography } from '@mui/material';

const FieldRow = memo(function FieldRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, py: 0.3 }}>
      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, minWidth: 115, fontSize: '0.7rem' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: value ? 'text.primary' : 'text.disabled' }}>
        {value || '—'}
      </Typography>
    </Box>
  );
});

export default FieldRow;
