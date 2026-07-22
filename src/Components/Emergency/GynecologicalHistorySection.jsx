import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';

const EMPTY = { evento: '', fecha_ultimo_evento: null, observaciones: '' };

const GynecologicalHistorySection = ({ patientId, readOnly, patientGender }) => {
  const [records, setRecords] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const isFemale = patientGender === 'F' || patientGender === 'Femenino';

  const fetch = useCallback(async () => {
    if (!patientId) return;
    try { const data = await BackendAPI.gynecologicalHistories.getAll(patientId); setRecords(data || []); } catch { setRecords([]); }
  }, [patientId]);

  useEffect(() => { if (isFemale) fetch(); }, [isFemale, fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (r) => { setEditing(r); setForm({ evento: r.evento, fecha_ultimo_evento: r.fecha_ultimo_evento || null, observaciones: r.observaciones || '' }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.evento) return;
    setSaving(true);
    try {
      if (editing) await BackendAPI.gynecologicalHistories.update(patientId, editing.id, form);
      else await BackendAPI.gynecologicalHistories.create(patientId, form);
      setDialogOpen(false);
      fetch();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.gynecologicalHistories.delete(patientId, id); fetch(); } catch { /* ignore */ }
  };

  if (!patientId || !isFemale) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" fontWeight={600} sx={{ color: '#bf360c' }}>HISTORIA GINECOBSTÉTRICA</Typography>
        {!readOnly && <Tooltip title="Agregar" arrow><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      {records.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#bf360c' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Evento</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Fecha Último Evento</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Observaciones</TableCell>
                {!readOnly && <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.65rem', py: 0.5 }} width={60} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.evento}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.fecha_ultimo_evento ? moment(r.fecha_ultimo_evento).format('DD/MM/YYYY') : '—'}</TableCell>
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
        <Typography variant="caption" color="text.secondary">Sin historia ginecobstétrica registrada</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.85rem' }}>{editing ? 'Editar' : 'Agregar'} Historia Ginecobstétrica</DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField variant="standard" size="small" label="Evento" value={form.evento} onChange={(e) => handleChange('evento', e.target.value)} required fullWidth />
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                format="DD/MM/YYYY" label="Fecha Último Evento"
                value={form.fecha_ultimo_evento ? moment(form.fecha_ultimo_evento, 'YYYY-MM-DD') : null}
                onChange={(v) => handleChange('fecha_ultimo_evento', v ? moment(v).format('YYYY-MM-DD') : null)}
                slotProps={{ textField: { variant: 'standard', size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
            <TextField variant="standard" size="small" label="Observaciones" value={form.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)} multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.evento}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default GynecologicalHistorySection;
