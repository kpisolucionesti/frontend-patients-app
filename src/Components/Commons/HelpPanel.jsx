import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Chip, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { CLASSIFICATION_OPTIONS, STATUS_CONFIG } from '../../constants';

const KEYBOARD_SHORTCUTS = [
  { keys: 'Ctrl+Shift+N', desc: 'Nuevo ingreso de emergencia' },
  { keys: 'Ctrl+Shift+K', desc: 'Buscar paciente' },
  { keys: 'Ctrl+Shift+D', desc: 'Ir al Dashboard' },
  { keys: 'Ctrl+Shift+E', desc: 'Ir a Emergencia' },
];

const HelpPanel = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        aria-label="Ayuda y referencia"
        sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'rgba(255,255,255,0.9)' } }}
      >
        <HelpOutlineIcon fontSize="small" />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Ayuda y Referencia
          <IconButton onClick={() => setOpen(false)} size="small" aria-label="Cerrar ayuda">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Clasificación de Triage
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {CLASSIFICATION_OPTIONS.map((c) => (
                <Chip
                  key={c.key}
                  label={c.label}
                  size="small"
                  sx={{ bgcolor: c.color, color: ['yellow', 'green'].includes(c.key) ? '#212121' : 'white', fontWeight: 600 }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Orden de prioridad: Rojo → Naranja → Amarillo → Verde → Azul
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Estados de Emergencia
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <Chip key={k} label={v.label} size="small" color={v.chipColor} />
              ))}
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Atajos de Teclado
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {KEYBOARD_SHORTCUTS.map((s) => (
                <Box key={s.keys} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={s.keys} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 600, minWidth: 80 }} />
                  <Typography variant="body2">{s.desc}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelpPanel;
