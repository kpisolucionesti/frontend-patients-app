import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';

const EMPTY = { habito: '', concurrencia: '', observaciones: '' };

const LifestyleHabitsSection = ({ patientId, readOnly }) => {
  const [records, setRecords] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    if (!patientId) return;
    try { const data = await BackendAPI.lifestyleHabits.getAll(patientId); setRecords(data || []); } catch { setRecords([]); }
  }, [patientId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (r) => { setEditing(r); setForm({ habito: r.habito, concurrencia: r.concurrencia || '', observaciones: r.observaciones || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.habito) return;
    setSaving(true);
    try {
      if (editing) await BackendAPI.lifestyleHabits.update(patientId, editing.id, form);
      else await BackendAPI.lifestyleHabits.create(patientId, form);
      setDialogOpen(false);
      fetch();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.lifestyleHabits.delete(patientId, id); fetch(); } catch { /* ignore */ }
  };

  if (!patientId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: '#2e7d32' }}>ESTILO DE VIDA</Typography>
        {!readOnly && <Tooltip title="Agregar" arrow><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      {records.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#2e7d32' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Hábito</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Concurrencia</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Observaciones</TableCell>
                {!readOnly && <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem', py: 0.5 }} width={60} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.habito}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.concurrencia || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.observaciones || '—'}</TableCell>
                  {!readOnly && (
                    <TableCell sx={{ py: 0.5 }}>
                      <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEdit(r)} sx={{ p: 0.15 }}><EditIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                      <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => handleDelete(r.id)} sx={{ p: 0.15 }}><DeleteIcon sx={{ fontSize: 12, color: '#e53935' }} /></IconButton></Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="caption" color="text.secondary">Sin hábitos registrados</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.85rem' }}>{editing ? 'Editar Hábito' : 'Agregar Hábito'}</DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField variant="standard" size="small" label="Hábito" value={form.habito} onChange={(e) => handleChange('habito', e.target.value)} required fullWidth />
            <TextField variant="standard" size="small" label="Concurrencia" value={form.concurrencia} onChange={(e) => handleChange('concurrencia', e.target.value)} fullWidth />
            <TextField variant="standard" size="small" label="Observaciones" value={form.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)} multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.habito}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LifestyleHabitsSection;
