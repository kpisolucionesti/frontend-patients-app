import { useState, useCallback } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../../services/BackendApi';
import { useFetch } from '../../../hooks/useFetch';

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

const SEVERITY_BG = { grave: 'error.light', moderado: 'warning.light', leve: 'grey.100', '': 'grey.50' };

const AllergiesSection = ({ patientId, readOnly }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, refetch } = useFetch(
    () => patientId ? BackendAPI.allergies.getAll(patientId) : Promise.resolve([]),
    [patientId],
  );
  const allergies = data || [];

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (a) => { setEditing(a); setForm({ allergy: a.allergy, severity: a.severity || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.allergy) return;
    setSaving(true);
    try {
      if (editing) await BackendAPI.allergies.update(patientId, editing.id, form);
      else await BackendAPI.allergies.create(patientId, form);
      setDialogOpen(false); refetch();
    } catch { } setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.allergies.delete(patientId, id); refetch(); } catch { }
  };

  if (!patientId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <WarningIcon sx={{ fontSize: 16, color: 'warning.dark' }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: 'warning.dark', fontSize: '0.75rem', letterSpacing: '0.03em' }}>ALERGIAS</Typography>
        </Box>
        {!readOnly && <Tooltip title="Agregar alergia"><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      {allergies.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {allergies.map((a) => (
            <Box key={a.id} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', bgcolor: SEVERITY_BG[a.severity] || 'grey.50', px: 1, py: 0.25, borderRadius: 0.5, fontWeight: a.severity === 'grave' ? 700 : 400 }}>
                {a.allergy}{a.severity ? ` (${a.severity})` : ''}
              </Typography>
              {!readOnly && (
                <>
                  <IconButton size="small" onClick={() => handleOpenEdit(a)} sx={{ p: 0.15 }} aria-label="Editar"><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(a.id)} sx={{ p: 0.15, color: 'error.main' }} aria-label="Eliminar"><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                </>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Sin alergias registradas</Typography>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{editing ? 'Editar Alergia' : 'Agregar Alergia'}</DialogTitle>
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
