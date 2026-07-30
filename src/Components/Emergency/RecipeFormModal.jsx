import { useState, useEffect, useCallback } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Grid, Autocomplete
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const RecipeFormModal = ({ open, onClose, onSave, saving, initialValues }) => {
  const [form, setForm] = useState({
    medication: '', dosage: '', frequency: '', duration: '', route: '', indications: '',
  });
  const [medications, setMedications] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    if (open) {
      BackendAPI.medications.getAll().then(setMedications).catch(() => {});
      BackendAPI.medicationRoutes.getAll().then(setRoutes).catch(() => {});

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
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <Autocomplete
              freeSolo
              size="small"
              options={medications}
              getOptionLabel={(opt) => typeof opt === 'string' ? opt : (opt.name || '')}
              value={form.medication}
              onInputChange={(_e, newValue) => setForm((prev) => ({ ...prev, medication: newValue }))}
              renderInput={(params) => (
                <TextField variant="standard" {...params} required label="Medicamento"
                  sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }} />
              )}
            />
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
            <Autocomplete
              freeSolo
              size="small"
              options={routes}
              getOptionLabel={(opt) => typeof opt === 'string' ? opt : (opt.name || '')}
              value={form.route}
              onInputChange={(_e, newValue) => setForm((prev) => ({ ...prev, route: newValue }))}
              renderInput={(params) => (
                <TextField variant="standard" {...params} label="Vía"
                  sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }} />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField variant="standard" fullWidth multiline rows={2} label="Indicaciones" value={form.indications}
              onChange={handleChange('indications')} sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ fontSize: '0.7rem' }}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" color="primary" sx={{ fontSize: '0.7rem' }}
          disabled={saving || !form.medication.trim()}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeFormModal;
