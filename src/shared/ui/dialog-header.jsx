import React from 'react';
import { DialogTitle } from '@mui/material';

export default function DialogHeader({ children, color = 'primary', sx = {} }) {
  return (
    <DialogTitle
      sx={{
        backgroundColor: `${color}.main`,
        color: 'white',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.95rem',
        padding: '12px 24px',
        ...sx,
      }}
    >
      {children}
    </DialogTitle>
  );
}
