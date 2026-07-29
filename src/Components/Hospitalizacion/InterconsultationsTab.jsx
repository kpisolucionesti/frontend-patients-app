import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Autocomplete, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../../shared/ui/mrt-config';

const STATUS_OPTIONS = [
  { key: 'pending', label: 'Pendiente', color: '#e65100' },
  { key: 'completed', label: 'Completada', color: '#2e7d32' },
  { key: 'cancelled', label: 'Cancelada', color: '#999' },
];

const EMPTY = { doctor_requested_id: null, reason: '', observations: '', status: 'pending', consultant_notes: '' };

const InterconsultationsTab = ({ emergencyId }) => {
  const permissions = usePermissions();
  const canEdit = permissions.includes('hospitalizacion.edit');
  const [items, setItems] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => { BackendAPI.doctors.getAll({ emergency_id: emergencyId }).then((d) => setDoctors(d || [])).catch(() => {}); }, [emergencyId]);
  const fetch = useCallback(async () => { if (!emergencyId) return; setLoading(true); try { setItems(await BackendAPI.interconsultations.getAll(emergencyId) || []); } catch { setError('Error al cargar'); } setLoading(false); }, [emergencyId]);
  useEffect(() => { fetch(); }, [fetch]);

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (ic) => { setEditing(ic); setForm({ doctor_requested_id: ic.doctor_requested?.id || null, reason: ic.reason || '', observations: ic.observations || '', status: ic.status || 'pending', consultant_notes: ic.consultant_notes || '' }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.doctor_requested_id) return; setSaving(true); try { editing ? await BackendAPI.interconsultations.update(emergencyId, editing.id, form) : await BackendAPI.interconsultations.create(emergencyId, form); setDialogOpen(false); fetch(); } catch { setError('Error al guardar'); } setSaving(false); };
  const handleDelete = async (id) => { try { await BackendAPI.interconsultations.destroy(emergencyId, id); fetch(); } catch { setError('Error al eliminar'); } };
  const pendingCount = items.filter((i) => i.status === 'pending').length;

  const columns = useMemo(() => [
    { accessorKey: 'doctor_requested.name', header: 'Medico', size: 150, Cell: ({ row }) => <Typography fontWeight={600} sx={{ fontSize: '0.75rem' }}>{row.original.doctor_requested?.name || '?'}</Typography> },
    { accessorKey: 'reason', header: 'Motivo', size: 180, Cell: ({ row }) => <Typography sx={{ fontSize: '0.75rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.original.reason || '-'}</Typography> },
    { accessorKey: 'status', header: 'Estado', size: 100, Cell: ({ row }) => <Chip label={STATUS_OPTIONS.find((s) => s.key === row.original.status)?.label || row.original.status} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: STATUS_OPTIONS.find((s) => s.key === row.original.status)?.color || '#999', color: 'white' }} /> },
    { accessorKey: 'consultant_notes', header: 'Resumen', size: 180, Cell: ({ row }) => <Typography sx={{ fontSize: '0.75rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.original.consultant_notes || '-'}</Typography> },
    { accessorKey: 'observations', header: 'Observaciones', size: 150, Cell: ({ row }) => <Typography sx={{ fontSize: '0.75rem', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.original.observations || '-'}</Typography> },
  ], []);

  const table = useMaterialReactTable({
    ...MRT_DEFAULTS, columns, data: items, state: { isLoading: loading }, enableRowActions: canEdit, positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (<Box sx={{ display: 'flex', gap: 0.25 }}><IconButton size="small" onClick={() => handleOpenEdit(row.original)}><EditIcon fontSize="small" /></IconButton><IconButton size="small" onClick={() => handleDelete(row.original.id)} color="error"><DeleteIcon fontSize="small" /></IconButton></Box>),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {pendingCount > 0 && <Chip label={`${pendingCount} pendiente(s)`} size="small" color="warning" sx={{ height: 20, fontSize: '0.6rem' }} />}
        {canEdit && <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpenAdd} sx={{ fontSize: '0.7rem' }}>Nueva Interconsulta</Button>}
      </Box>
    ),
  });

  if (!emergencyId) return null;

  return (
    <Paper sx={{ p: 1.5, borderTop: 2, borderColor: 'primary.main' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <GroupIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="caption" fontWeight={600} sx={{ color: 'primary.main', fontSize: '0.8rem' }}>INTERCONSULTAS</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>{error}</Alert>}
      <MaterialReactTable table={table} />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.95rem' }}>{editing ? 'Editar Interconsulta' : 'Nueva Interconsulta'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <Autocomplete size="small" fullWidth options={doctors}
              getOptionLabel={(o) => `${o.name}${o.specialty?.name ? ` (${o.specialty.name})` : ''}`}
              value={doctors.find((d) => d.id === form.doctor_requested_id) || null}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              onChange={(_, v) => setForm({ ...form, doctor_requested_id: v ? v.id : null })}
              renderInput={(params) => <TextField variant="standard" {...params} label="Medico Solicitado" required />} />
            <TextField variant="standard" size="small" label="Motivo" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} multiline rows={2} fullWidth />
            <TextField variant="standard" size="small" label="Resumen del Consultor" value={form.consultant_notes} onChange={(e) => setForm({ ...form, consultant_notes: e.target.value })} multiline rows={3} fullWidth />
            <TextField variant="standard" size="small" label="Observaciones" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} multiline rows={2} fullWidth />
            <TextField select variant="standard" size="small" label="Estado" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions><Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.doctor_requested_id}>{saving ? 'Guardando...' : 'Guardar'}</Button></DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InterconsultationsTab;
