import { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const ClinicalStudyClassificationFormModal = ({ open, onClose, classification, onSaved }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [color, setColor] = useState('#1565c0');
  const [saving, setSaving] = useState(false);
  const { show } = useSnackbar();

  useEffect(() => {
    if (open) {
      if (classification) {
        setName(classification.name || '');
        setKey(classification.key || '');
        setColor(classification.color || '#1565c0');
      } else {
        setName('');
        setKey('');
        setColor('#1565c0');
      }
    }
  }, [open, classification]);

  const handleSave = async () => {
    if (!name || !key) return;
    setSaving(true);
    try {
      const data = { name, key, color, sort_order: classification?.sort_order ?? 0 };
      if (classification?.id) {
        await BackendAPI.clinicalStudyClassifications.update(classification.id, data);
      } else {
        await BackendAPI.clinicalStudyClassifications.create(data);
      }
      show(classification ? 'Clasificación actualizada' : 'Clasificación creada', 'success');
      onSaved();
      onClose();
    } catch {
      show('Error al guardar clasificación', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '0.95rem', bgcolor: 'primary.main', color: 'white', fontWeight: 700, textAlign: 'center' }}>
        {classification?.id ? 'Editar Clasificación' : 'Nueva Clasificación'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            variant="standard"
            size="small"
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            variant="standard"
            size="small"
            label="Clave (key)"
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s/g, '_'))}
            required
            fullWidth
            helperText="Identificador único, sin espacios"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: color,
                border: '2px solid',
                borderColor: 'grey.300',
                flexShrink: 0,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
            <TextField
              variant="standard"
              size="small"
              label="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <Box
                    component="input"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    sx={{
                      width: 28,
                      height: 28,
                      border: 'none',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      p: 0,
                      mr: 0.5,
                      '&::-webkit-color-swatch-wrapper': { p: 0 },
                      '&::-webkit-color-swatch': { borderRadius: '50%', border: '1px solid #ccc' },
                    }}
                  />
                ),
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Selecciona un color con el selector o escribe el código hexadecimal manualmente (#RRGGBB)
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button size="small" variant="outlined" onClick={onClose}>Cancelar</Button>
        <Button size="small" variant="contained" onClick={handleSave} disabled={saving || !name || !key}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClinicalStudyClassificationFormModal;
