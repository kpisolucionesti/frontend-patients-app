import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';

const CATEGORY_OPTIONS = ['Médico', 'Quirúrgico', 'Obstétrico'];

const EMPTY = { condition_type: '', description: '', diagnosed_at: null, medication: '', notes: '', category: '' };

const AntecedentForm = ({ values, onChange }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <TextField select variant="standard" size="small" label="Tipo" value={values.category} onChange={(e) => onChange('category', e.target.value)} fullWidth>
      <MenuItem value="">Seleccionar</MenuItem>
      {CATEGORY_OPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
    </TextField>
    <TextField variant="standard" size="small" label="Condición" value={values.condition_type} onChange={(e) => onChange('condition_type', e.target.value)} required fullWidth />
    <TextField variant="standard" size="small" label="Descripción" value={values.description} onChange={(e) => onChange('description', e.target.value)} fullWidth />
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        format="DD/MM/YYYY" label="Fecha Diagnóstico"
        value={values.diagnosed_at ? moment(values.diagnosed_at, 'YYYY-MM-DD') : null}
        onChange={(v) => onChange('diagnosed_at', v ? moment(v).format('YYYY-MM-DD') : null)}
        slotProps={{ textField: { variant: 'standard', size: 'small', fullWidth: true } }}
      />
    </LocalizationProvider>
    <TextField variant="standard" size="small" label="Medicación Actual" value={values.medication} onChange={(e) => onChange('medication', e.target.value)} fullWidth />
    <TextField variant="standard" size="small" label="Notas" value={values.notes} onChange={(e) => onChange('notes', e.target.value)} multiline rows={2} fullWidth />
  </Box>
);

const AntecedentsSection = ({ patientId, readOnly }) => {
  const [antecedents, setAntecedents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    if (!patientId) return;
    try { const data = await BackendAPI.antecedents.getAll(patientId); setAntecedents(data || []); } catch { setAntecedents([]); }
  }, [patientId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (a) => { setEditing(a); setForm({ condition_type: a.condition_type, description: a.description || '', diagnosed_at: a.diagnosed_at || null, medication: a.medication || '', notes: a.notes || '', category: a.category || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.condition_type) return;
    setSaving(true);
    try {
      if (editing) await BackendAPI.antecedents.update(patientId, editing.id, form);
      else await BackendAPI.antecedents.create(patientId, form);
      setDialogOpen(false);
      fetch();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.antecedents.delete(patientId, id); fetch(); } catch { /* ignore */ }
  };

  if (!patientId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EventNoteIcon sx={{ fontSize: 18, color: '#1565c0' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0' }}>ANTECEDENTES</Typography>
        </Box>
        {!readOnly && <Tooltip title="Agregar antecedente" arrow><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      {antecedents.length > 0 ? (
        <Box>
          {antecedents.map((a) => (
            <Box key={a.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.25, mb: 0.5, p: 0.5, bgcolor: '#fafafa', borderRadius: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
                  {a.category ? `${a.category} — ` : ''}{a.condition_type}
                </Typography>
                {a.description && <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{a.description}</Typography>}
              </Box>
              {!readOnly && (
                <>
                  <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEdit(a)} sx={{ p: 0.15 }}><EditIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                  <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => handleDelete(a.id)} sx={{ p: 0.15 }}><DeleteIcon sx={{ fontSize: 12, color: '#e53935' }} /></IconButton></Tooltip>
                </>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">Sin antecedentes registrados</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.85rem', bgcolor: '#1565c0', color: 'white' }}>{editing ? 'Editar Antecedente' : 'Agregar Antecedente'}</DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}><AntecedentForm values={form} onChange={handleChange} /></DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.condition_type}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AntecedentsSection;
