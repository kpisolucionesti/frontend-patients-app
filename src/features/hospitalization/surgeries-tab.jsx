import { useState, useEffect, useCallback, useMemo } from 'react';
import { Autocomplete, Box, Typography, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../../shared/ui/mrt-config';

export const SURGERY_TYPES = [
  { key: 'general', label: 'Cirugía General' }, { key: 'traumatologia', label: 'Traumatología' },
  { key: 'neurocirugia', label: 'Neurocirugía' }, { key: 'cardiovascular', label: 'Cardiovascular' },
  { key: 'toracica', label: 'Torácica' }, { key: 'abdominal', label: 'Abdominal' },
  { key: 'urologica', label: 'Urológica' }, { key: 'ginecologica', label: 'Ginecológica' },
  { key: 'oftalmologica', label: 'Oftalmológica' }, { key: 'otorrino', label: 'Otorrinolaringología' },
  { key: 'maxilofacial', label: 'Maxilofacial' }, { key: 'pediatrica', label: 'Pediátrica' },
  { key: 'otros', label: 'Otra' },
];

export const STATUS_OPTIONS = [
  { key: 'scheduled', label: 'Programada', color: 'info' },
  { key: 'completed', label: 'Realizada', color: 'success' },
  { key: 'cancelled', label: 'Cancelada', color: 'default' },
];

const EMPTY = { surgery_type: '', description: '', surgeon_name: '', surgery_date: '', scheduled_start_time: '', scheduled_end_time: '', status: 'scheduled', preanesthetic_evaluation: '', preop_notes: '', postop_notes: '', result: '' };

const SurgeriesTab = ({ hospitalizationId }) => {
  const permissions = usePermissions();
  const canEdit = permissions.includes('hospitalizacion.edit');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    if (!hospitalizationId) return;
    setLoading(true);
    try { setItems(await BackendAPI.surgeries.getAll(hospitalizationId) || []); } catch { setError('Error al cargar cirugías'); }
    setLoading(false);
  }, [hospitalizationId]);
  useEffect(() => { fetch(); }, [fetch]);

  const handleOpenAdd = () => { setEditing(null); setForm({ ...EMPTY, surgery_date: new Date().toISOString().slice(0, 16) }); setDialogOpen(true); };
  const handleOpenEdit = (s) => { setEditing(s); setForm({ ...EMPTY, ...s, surgery_date: s.surgery_date?.slice(0, 16) || '', scheduled_start_time: s.scheduled_start_time?.slice(0, 16) || '', scheduled_end_time: s.scheduled_end_time?.slice(0, 16) || '' }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.surgery_type) return; setSaving(true); try { editing ? await BackendAPI.surgeries.update(hospitalizationId, editing.id, form) : await BackendAPI.surgeries.create(hospitalizationId, form); setDialogOpen(false); fetch(); } catch { setError('Error al guardar'); } setSaving(false); };
  const handleDelete = async (id) => { try { await BackendAPI.surgeries.destroy(hospitalizationId, id); fetch(); } catch { setError('Error al eliminar'); } };
  const scheduledCount = items.filter((s) => s.status === 'scheduled').length;

  const columns = useMemo(() => [
    { accessorKey: 'surgery_type', header: 'Tipo', size: 130, Cell: ({ row }) => <Chip label={SURGERY_TYPES.find((t) => t.key === row.original.surgery_type)?.label || row.original.surgery_type} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'primary.main', color: 'white' }} /> },
    { accessorKey: 'description', header: 'Descripción', size: 180, Cell: ({ row }) => <Typography sx={{ fontSize: '0.75rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.original.description || '-'}</Typography> },
    { accessorKey: 'surgeon_name', header: 'Cirujano', size: 130 },
    { accessorKey: 'surgery_date', header: 'Fecha', size: 100, Cell: ({ row }) => row.original.surgery_date ? new Date(row.original.surgery_date).toLocaleDateString() : '-' },
    { accessorKey: 'scheduled_start_time', header: 'Hora Inicio', size: 90, Cell: ({ row }) => row.original.scheduled_start_time ? new Date(row.original.scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    { accessorKey: 'scheduled_end_time', header: 'Hora Fin', size: 90, Cell: ({ row }) => row.original.scheduled_end_time ? new Date(row.original.scheduled_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-' },
    { accessorKey: 'status', header: 'Estado', size: 100, Cell: ({ row }) => <Chip label={STATUS_OPTIONS.find((o) => o.key === row.original.status)?.label || row.original.status} size="small" color={STATUS_OPTIONS.find((o) => o.key === row.original.status)?.color || 'default'} sx={{ height: 20, fontSize: '0.7rem' }} /> },
    { accessorKey: 'postop_notes', header: 'Notas Post-Op', size: 180, Cell: ({ row }) => <Typography sx={{ fontSize: '0.75rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.original.postop_notes || '-'}</Typography> },
  ], []);

  const table = useMaterialReactTable({
    ...MRT_DEFAULTS, columns, data: items, state: { isLoading: loading }, enableRowActions: canEdit, positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (<Box sx={{ display: 'flex', gap: 0.25 }}><IconButton size="small" onClick={() => handleOpenEdit(row.original)}><EditIcon fontSize="small" /></IconButton><IconButton size="small" onClick={() => handleDelete(row.original.id)} color="error"><DeleteIcon fontSize="small" /></IconButton></Box>),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {scheduledCount > 0 && <Chip label={`${scheduledCount} programada(s)`} size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />}
        {canEdit && <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpenAdd} sx={{ fontSize: '0.7rem' }}>Nueva Cirugía</Button>}
      </Box>
    ),
  });

  if (!hospitalizationId) return null;

  return (
    <Paper sx={{ p: 1.5, borderLeft: 3, borderColor: 'primary.main' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <LocalHospitalIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="caption" fontWeight={600} sx={{ color: 'primary.main', fontSize: '0.8rem' }}>CIRUGÍAS</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>{error}</Alert>}
      <MaterialReactTable table={table} />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>{editing ? 'Editar Cirugía' : 'Nueva Cirugía'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <Autocomplete
              size="small"
              options={SURGERY_TYPES}
              getOptionLabel={(opt) => opt.label}
              value={SURGERY_TYPES.find((t) => t.key === form.surgery_type) || null}
              onChange={(_e, v) => setForm({ ...form, surgery_type: v ? v.key : '' })}
              renderInput={(params) => <TextField variant="standard" {...params} size="small" label="Tipo de Cirugía" required fullWidth />}
            />
            <TextField variant="standard" size="small" label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} fullWidth />
            <TextField variant="standard" size="small" label="Cirujano" value={form.surgeon_name} onChange={(e) => setForm({ ...form, surgeon_name: e.target.value })} fullWidth />
            <TextField variant="standard" size="small" label="Fecha Cirugía" type="date" value={form.surgery_date} onChange={(e) => setForm({ ...form, surgery_date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField variant="standard" size="small" label="Hora Inicio" type="time" value={form.scheduled_start_time} onChange={(e) => setForm({ ...form, scheduled_start_time: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField variant="standard" size="small" label="Hora Fin" type="time" value={form.scheduled_end_time} onChange={(e) => setForm({ ...form, scheduled_end_time: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <Autocomplete
              size="small"
              options={STATUS_OPTIONS}
              getOptionLabel={(opt) => opt.label}
              value={STATUS_OPTIONS.find((o) => o.key === form.status) || null}
              onChange={(_e, v) => setForm({ ...form, status: v ? v.key : '' })}
              renderInput={(params) => <TextField variant="standard" {...params} size="small" label="Estado" fullWidth />}
            />
            <TextField variant="standard" size="small" label="Post-Op" value={form.postop_notes} onChange={(e) => setForm({ ...form, postop_notes: e.target.value })} multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions><Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.surgery_type}>{saving ? 'Guardando...' : 'Guardar'}</Button></DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SurgeriesTab;
