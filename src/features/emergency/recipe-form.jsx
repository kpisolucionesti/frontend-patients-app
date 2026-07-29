import { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, Grid
} from '@mui/material';

const ROUTE_OPTIONS = [
  'Oral', 'Intravenoso', 'Intramuscular', 'Subcutáneo',
  'Tópico', 'Inhalación', 'Rectal', 'Sublingual',
];

const RecipeFormModal = ({ open, onClose, onSave, saving, initialValues }) => {
  const [form, setForm] = useState({
    medication: '', dosage: '', frequency: '', duration: '', route: '', indications: '',
  });

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setForm({
          medication: initialValues.medication || '',
          dosage: initialValues.dosage || '',
          frequency: initialValues.frequency || '',
          duration: initialValues.duration || '',
          route: initialValues.route || '',
          indications: initialValues.indications || '',
        });
      } else {
        setForm({ medication: '', dosage: '', frequency: '', duration: '', route: '', indications: '' });
      }
    }
  }, [open, initialValues]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    if (!form.medication.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
        {initialValues ? 'Editar Receta' : 'Nueva Receta'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField variant="standard" fullWidth required label="Medicamento" value={form.medication}
              onChange={handleChange('medication')} sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }} />
          </Grid>
          <Grid item xs={6}>
            <TextField variant="standard" fullWidth label="Dosis" value={form.dosage}
              onChange={handleChange('dosage')} placeholder="Ej: 1 comprimido"
              sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }} />
          </Grid>
          <Grid item xs={6}>
            <TextField variant="standard" fullWidth label="Frecuencia" value={form.frequency}
              onChange={handleChange('frequency')} placeholder="Ej: c/8 horas"
              sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }} />
          </Grid>
          <Grid item xs={6}>
            <TextField variant="standard" fullWidth label="Duración" value={form.duration}
              onChange={handleChange('duration')} placeholder="Ej: 7 días"
              sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }} />
          </Grid>
          <Grid item xs={6}>
            <TextField variant="standard" fullWidth select label="Vía" value={form.route}
              onChange={handleChange('route')} sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}>
              {ROUTE_OPTIONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField variant="standard" fullWidth multiline rows={2} label="Indicaciones" value={form.indications}
              onChange={handleChange('indications')} sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error" sx={{ fontSize: '0.7rem' }}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontSize: '0.7rem' }}
          disabled={saving || !form.medication.trim()}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeFormModal;
