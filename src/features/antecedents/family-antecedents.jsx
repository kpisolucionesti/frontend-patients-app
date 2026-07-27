import { useState, useCallback } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../../services/BackendApi';
import { useFetch } from '../../../hooks/useFetch';

const EMPTY = { patologia: '', parentesco: '', valor: '' };

const FamilyAntecedentsSection = ({ patientId, readOnly }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data, refetch } = useFetch(
    () => patientId ? BackendAPI.familyAntecedents.getAll(patientId) : Promise.resolve([]),
    [patientId],
  );
  const records = data || [];

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (r) => { setEditing(r); setForm({ patologia: r.patologia, parentesco: r.parentesco || '', valor: r.valor || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.patologia) return;
    setSaving(true);
    try {
      if (editing) await BackendAPI.familyAntecedents.update(patientId, editing.id, form);
      else await BackendAPI.familyAntecedents.create(patientId, form);
      setDialogOpen(false);
      refetch();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.familyAntecedents.delete(patientId, id); refetch(); } catch { /* ignore */ }
  };

  if (!patientId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: records.length > 0 ? 1 : 0 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.75rem', letterSpacing: '0.03em' }}>
          ANTECEDENTES FAMILIARES
        </Typography>
        {!readOnly && (
          <Tooltip title="Agregar" arrow>
            <IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton>
          </Tooltip>
        )}
      </Box>
      {records.length > 0 ? (
        <TableContainer sx={{ borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Patología</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Parentesco</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Valor</TableCell>
                {!readOnly && <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }} width={60} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>{r.patologia}</TableCell>
                  <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>{r.parentesco || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>{r.valor || '—'}</TableCell>
                  {!readOnly && (
                    <TableCell sx={{ py: 0.5 }}>
                      <IconButton size="small" onClick={() => handleOpenEdit(r)} sx={{ p: 0.15 }} aria-label="Editar"><EditIcon sx={{ fontSize: 14 }} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(r.id)} sx={{ p: 0.15, color: 'error.main' }} aria-label="Eliminar"><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Sin antecedentes familiares registrados</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
          {editing ? 'Editar Antecedente Familiar' : 'Agregar Antecedente Familiar'}
        </DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField variant="standard" size="small" label="Patología" value={form.patologia} onChange={(e) => handleChange('patologia', e.target.value)} required fullWidth />
            <TextField variant="standard" size="small" label="Parentesco" value={form.parentesco} onChange={(e) => handleChange('parentesco', e.target.value)} fullWidth />
            <TextField select variant="standard" size="small" label="Valor" value={form.valor} onChange={(e) => handleChange('valor', e.target.value)} fullWidth>
              <MenuItem value="">Seleccionar</MenuItem>
              <MenuItem value="Si">Sí</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.patologia}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FamilyAntecedentsSection;
