import { useState, useEffect, useCallback } from 'react';
import { Autocomplete, Box, IconButton, MenuItem, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';

const STATUS_OPTIONS = [
  { key: 'pending', label: 'Pendiente', color: '#e65100' },
  { key: 'completed', label: 'Completada', color: '#2e7d32' },
  { key: 'cancelled', label: 'Cancelada', color: '#999' },
];

const EMPTY = { doctor_requested_id: null, reason: '', observations: '', status: 'pending' };

const InterconsultationsDetail = ({ emergencyId, readOnly }) => {
  const [items, setItems] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    BackendAPI.doctors.getAll().then((d) => setDoctors(d || [])).catch(() => {});
  }, []);

  const fetch = useCallback(async () => {
    if (!emergencyId) return;
    try { const data = await BackendAPI.interconsultations.getAll(emergencyId); setItems(data || []); } catch { setItems([]); }
  }, [emergencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (ic) => { setEditing(ic); setForm({ doctor_requested_id: ic.doctor_requested?.id || null, reason: ic.reason || '', observations: ic.observations || '', status: ic.status || 'pending' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.doctor_requested_id) return;
    setSaving(true);
    try {
      if (editing) {
        await BackendAPI.interconsultations.update(emergencyId, editing.id, form);
      } else {
        await BackendAPI.interconsultations.create(emergencyId, form);
      }
      setDialogOpen(false);
      fetch();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.interconsultations.destroy(emergencyId, id); fetch(); } catch { /* ignore */ }
  };

  if (!emergencyId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0' }}>INTERCONSULTAS</Typography>
        {!readOnly && <Tooltip title="Agregar interconsulta" arrow><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      {items.length > 0 ? (
        <Box>
          {items.map((ic) => (
            <Box key={ic.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5, p: 0.5, bgcolor: '#fafafa', borderRadius: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>{ic.doctor_requested?.name || '?'}</Typography>
                {ic.reason && <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{ic.reason}</Typography>}
                <Chip
                  label={STATUS_OPTIONS.find((s) => s.key === ic.status)?.label || ic.status}
                  size="small"
                  sx={{ height: 16, fontSize: '0.55rem', mt: 0.25, bgcolor: STATUS_OPTIONS.find((s) => s.key === ic.status)?.color || '#999', color: 'white' }}
                />
              </Box>
              {!readOnly && (
                <>
                  <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEdit(ic)} sx={{ p: 0.15 }}><EditIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                  <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => handleDelete(ic.id)} sx={{ p: 0.15 }}><DeleteIcon sx={{ fontSize: 12, color: '#e53935' }} /></IconButton></Tooltip>
                </>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">Sin interconsultas registradas</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.85rem', bgcolor: '#1565c0', color: 'white' }}>{editing ? 'Editar Interconsulta' : 'Agregar Interconsulta'}</DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Autocomplete
              size="small" fullWidth
              options={doctors}
              getOptionLabel={(option) => `${option.name}${option.speciality ? ` (${option.speciality})` : ''}`}
              value={doctors.find((d) => d.id === form.doctor_requested_id) || null}
              isOptionEqualToValue={(option, val) => option.id === val.id}
              onChange={(_e, v) => handleChange('doctor_requested_id', v ? v.id : null)}
              renderInput={(params) => <TextField variant="standard" {...params} size="small" label="Médico Solicitado" required />}
            />
            <TextField variant="standard" size="small" label="Motivo" value={form.reason} onChange={(e) => handleChange('reason', e.target.value)} fullWidth />
            <TextField variant="standard" size="small" label="Observaciones" value={form.observations} onChange={(e) => handleChange('observations', e.target.value)} multiline rows={2} fullWidth />
            <TextField select variant="standard" size="small" label="Estado" value={form.status} onChange={(e) => handleChange('status', e.target.value)} fullWidth>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="contained" onClick={handleSave} disabled={saving || !form.doctor_requested_id}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InterconsultationsDetail;
