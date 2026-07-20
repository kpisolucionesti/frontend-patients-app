import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Chip } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';

const INDICATION_TYPES = [
  { key: 'lab', label: 'Laboratorio', color: '#1565c0' },
  { key: 'image', label: 'Imagenologia', color: '#6a1b9a' },
  { key: 'medication', label: 'Tratamiento', color: '#2e7d32' },
  { key: 'procedure', label: 'Procedimiento', color: '#e65100' },
  { key: 'general', label: 'Estudios Extras', color: '#546e7a' },
];

const getTypeLabel = (key) => INDICATION_TYPES.find((t) => t.key === key)?.label || key;
const getTypeColor = (key) => INDICATION_TYPES.find((t) => t.key === key)?.color || '#999';

const EMPTY = { indication_type: 'general', description: '' };

const MedicalPlansDetail = ({ emergencyId, readOnly }) => {
  const [plans, setPlans] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    if (!emergencyId) return;
    try {
      const data = await BackendAPI.medicalPlans.getAll(emergencyId);
      setPlans(data || []);
    } catch { setPlans([]); }
  }, [emergencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (p) => { setEditing(p); setForm({ indication_type: p.indication_type, description: p.description }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.description || !form.indication_type) return;
    setSaving(true);
    try {
      if (editing) {
        await BackendAPI.medicalPlans.update({ ...editing, ...form });
      } else {
        await BackendAPI.medicalPlans.create(emergencyId, form);
      }
      setDialogOpen(false);
      fetch();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.medicalPlans.delete(emergencyId, id); fetch(); } catch { /* ignore */ }
  };

  if (!emergencyId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AssignmentIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#2e7d32' }}>INDICACIONES MÉDICAS</Typography>
        </Box>
        {!readOnly && <Tooltip title="Agregar indicación" arrow><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      {plans.length > 0 ? (
        <Box>
          {plans.map((p) => (
            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, p: 0.5, bgcolor: '#fafafa', borderRadius: 1 }}>
              <Chip label={getTypeLabel(p.indication_type)} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: getTypeColor(p.indication_type), color: 'white' }} />
              <Typography variant="caption" sx={{ flex: 1, fontSize: '0.7rem' }}>{p.description}</Typography>
              {!readOnly && (
                <>
                  <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEdit(p)} sx={{ p: 0.15 }}><EditIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                  <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => handleDelete(p.id)} sx={{ p: 0.15 }}><DeleteIcon sx={{ fontSize: 12, color: '#e53935' }} /></IconButton></Tooltip>
                </>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">Sin indicaciones registradas</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.85rem', bgcolor: 'success.main' }}>{editing ? 'Editar Indicación' : 'Agregar Indicación'}</DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField select variant="standard" size="small" label="Tipo" value={form.indication_type} onChange={(e) => handleChange('indication_type', e.target.value)} fullWidth>
              {INDICATION_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
            </TextField>
            <TextField variant="standard" size="small" label="Descripción" value={form.description} onChange={(e) => handleChange('description', e.target.value)} required multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.description || !form.indication_type}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MedicalPlansDetail;
