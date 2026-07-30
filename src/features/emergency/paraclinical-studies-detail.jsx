import { useState, useEffect, useCallback } from 'react';
import { Autocomplete, Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip } from '@mui/material';
import BiotechIcon from '@mui/icons-material/Biotech';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';

const STUDY_TYPES = [
  { key: 'ekg', label: 'EKG' },
  { key: 'ecografia', label: 'Ecografía' },
  { key: 'tomografia', label: 'Tomografía' },
  { key: 'resonancia', label: 'Resonancia' },
];

const getTypeLabel = (key) => STUDY_TYPES.find((t) => t.key === key)?.label || key;

const EMPTY = { study_type: '', description: '' };

const ParaclinicalStudiesDetail = ({ emergencyId, readOnly }) => {
  const [studies, setStudies] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    if (!emergencyId) return;
    try {
      const data = await BackendAPI.paraclinicalStudies.getAll(emergencyId);
      setStudies(data || []);
    } catch { setStudies([]); }
  }, [emergencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (s) => { setEditing(s); setForm({ study_type: s.study_type, description: s.description || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.study_type || !form.description) return;
    setSaving(true);
    try {
      if (editing) {
        await BackendAPI.paraclinicalStudies.update(emergencyId, editing.id, form);
      } else {
        await BackendAPI.paraclinicalStudies.create(emergencyId, form);
      }
      setDialogOpen(false);
      fetch();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.paraclinicalStudies.delete(emergencyId, id); fetch(); } catch { /* ignore */ }
  };

  if (!emergencyId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BiotechIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: 'secondary.main' }}>PARACLÍNICOS / ESTUDIOS DE IMAGEN</Typography>
        </Box>
        {!readOnly && <Tooltip title="Agregar estudio" arrow><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      {studies.length > 0 ? (
        <Box>
          {studies.map((s) => (
            <Box key={s.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5, p: 0.5, bgcolor: '#fafafa', borderRadius: 1 }}>
              <Chip label={getTypeLabel(s.study_type)} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'secondary.main', color: 'white', mt: 0.15 }} />
              <Typography variant="caption" sx={{ flex: 1, fontSize: '0.7rem' }}>{s.description}</Typography>
              {!readOnly && (
                <>
                  <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEdit(s)} sx={{ p: 0.15 }}><EditIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                  <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => handleDelete(s.id)} sx={{ p: 0.15 }}><DeleteIcon sx={{ fontSize: 12, color: 'error.main' }} /></IconButton></Tooltip>
                </>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">Sin estudios registrados</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.95rem', bgcolor: 'secondary.main', color: 'white' }}>{editing ? 'Editar Estudio' : 'Agregar Estudio'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Autocomplete
              size="small"
              options={STUDY_TYPES}
              getOptionLabel={(opt) => opt.label}
              value={STUDY_TYPES.find((t) => t.key === form.study_type) || null}
              onChange={(_e, v) => handleChange('study_type', v ? v.key : '')}
              renderInput={(params) => <TextField variant="standard" {...params} size="small" label="Tipo" required fullWidth />}
            />
            <TextField variant="standard" size="small" label="Descripción" value={form.description} onChange={(e) => handleChange('description', e.target.value)} required multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.study_type || !form.description}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ParaclinicalStudiesDetail;
