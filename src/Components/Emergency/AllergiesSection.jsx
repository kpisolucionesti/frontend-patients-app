import { useState, useEffect } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';

const EMPTY = { allergy: '', severity: '' };

const SEVERITY_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'leve', label: 'Leve' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'grave', label: 'Grave' },
];

const AllergyForm = ({ values, onChange, allergens }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Autocomplete
      freeSolo
      size="small"
      options={allergens}
      getOptionLabel={(opt) => typeof opt === 'string' ? opt : (opt.name || '')}
      value={values.allergy}
      onInputChange={(_e, newValue) => onChange('allergy', newValue)}
      renderInput={(params) => (
        <TextField variant="standard" {...params} required label="Alergia" fullWidth />
      )}
    />
    <Autocomplete
      size="small"
      options={SEVERITY_OPTIONS}
      getOptionLabel={(opt) => opt.label}
      value={SEVERITY_OPTIONS.find((s) => s.value === values.severity) || SEVERITY_OPTIONS[0]}
      onChange={(_e, v) => onChange('severity', v ? v.value : '')}
      disableClearable
      renderInput={(params) => (
        <TextField variant="standard" {...params} label="Severidad" fullWidth />
      )}
    />
  </Box>
);

const SEVERITY_BG = { grave: 'error.light', moderado: 'warning.light', leve: 'grey.100', '': 'grey.50' };

const AllergiesSection = ({ patientId, readOnly }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [allergens, setAllergens] = useState([]);

  const { data, refetch } = useFetch(
    () => patientId ? BackendAPI.allergies.getAll(patientId) : Promise.resolve([]),
    [patientId],
  );
  const allergies = data || [];

  useEffect(() => {
    BackendAPI.allergens.getAll().then(setAllergens).catch(() => {});
  }, []);

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
        <DialogContent style={{ paddingTop: 24 }}><AllergyForm values={form} onChange={handleChange} allergens={allergens} /></DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.allergy}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AllergiesSection;
