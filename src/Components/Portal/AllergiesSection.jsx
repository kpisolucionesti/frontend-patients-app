import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';

const EMPTY = { allergy: '', severity: '' };

const AllergyForm = ({ values, onChange }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <TextField variant="standard" size="small" label="Alergia" value={values.allergy} onChange={(e) => onChange('allergy', e.target.value)} required fullWidth />
    <TextField select variant="standard" size="small" label="Severidad" value={values.severity} onChange={(e) => onChange('severity', e.target.value)} fullWidth>
      <MenuItem value="">Sin especificar</MenuItem>
      <MenuItem value="leve">Leve</MenuItem>
      <MenuItem value="moderado">Moderado</MenuItem>
      <MenuItem value="grave">Grave</MenuItem>
    </TextField>
  </Box>
);

const AllergiesSection = ({ patientId, readOnly }) => {
  const [allergies, setAllergies] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    if (!patientId) return;
    try { const data = await BackendAPI.allergies.getAll(patientId); setAllergies(data || []); } catch { setAllergies([]); }
  }, [patientId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (a) => { setEditing(a); setForm({ allergy: a.allergy, severity: a.severity || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.allergy) return;
    setSaving(true);
    try {
      if (editing) await BackendAPI.allergies.update(patientId, editing.id, form);
      else await BackendAPI.allergies.create(patientId, form);
      setDialogOpen(false);
      fetch();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.allergies.delete(patientId, id); fetch(); } catch { /* ignore */ }
  };

  if (!patientId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WarningIcon sx={{ fontSize: 18, color: '#e65100' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#e65100' }}>ALERGIAS</Typography>
        </Box>
        {!readOnly && <Tooltip title="Agregar alergia" arrow><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      {allergies.length > 0 ? (
        <Box>
          {allergies.map((a) => (
            <Box key={a.id} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, m: 0.25 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', bgcolor: a.severity === 'grave' ? '#ffebee' : a.severity === 'moderado' ? '#fff3e0' : '#f5f5f5', px: 0.5, py: 0.25, borderRadius: 0.5 }}>
                {a.allergy}{a.severity ? ` (${a.severity})` : ''}
              </Typography>
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
        <Typography variant="caption" color="text.secondary">Sin alergias registradas</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '0.85rem', bgcolor: '#e65100', color: 'white' }}>{editing ? 'Editar Alergia' : 'Agregar Alergia'}</DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}><AllergyForm values={form} onChange={handleChange} /></DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.allergy}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AllergiesSection;
