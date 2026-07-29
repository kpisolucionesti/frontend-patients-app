import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  Box, Typography, TextField, Button, Select, MenuItem, FormControl,
  InputLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Alert, CircularProgress, Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { catalogsApi } from '../../services/catalogsApi';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../../shared/ui/mrt-config';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Programado', color: 'default' },
  { value: 'administered', label: 'Administrado', color: 'success' },
  { value: 'missed', label: 'No Administrado', color: 'error' },
  { value: 'refused', label: 'Rechazado', color: 'warning' },
  { value: 'held', label: 'Suspendido', color: 'default' },
];

const initialForm = {
  medication_name: '', dosage: '', route: 'oral', frequency: '',
  scheduled_at: new Date().toISOString().slice(0, 16), administered_at: '',
  status: 'scheduled', notes: '', medical_plan_id: null,
};

const MedicationAdminPanel = ({ hospitalizationId, emergencyId, readOnly }) => {
  const permissions = usePermissions();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeOptions, setRouteOptions] = useState([]);
  const [medOptions, setMedOptions] = useState([]);
  const medSearchTimer = useRef(null);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const parentId = hospitalizationId || emergencyId;
  const parentType = hospitalizationId ? 'hospitalization' : 'emergency';
  const canEdit = permissions.includes('hospitalizacion.edit') || permissions.includes('enfermeria.edit');
  const canNurse = permissions.includes('hospitalizacion.nursing') || permissions.includes('enfermeria.edit');
  const canCreateOrEdit = canEdit || canNurse;

  const loadRecords = useCallback(async () => {
    if (!parentId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await BackendAPI.medicationAdministrations.getAll(parentId, parentType);
      setRecords(data || []);
    } catch { setError('Error al cargar administración de medicamentos'); }
    finally { setLoading(false); }
  }, [parentId, parentType]);

  useEffect(() => { loadRecords(); }, [loadRecords]);
  useEffect(() => { catalogsApi.medicationRoutes.list().then(setRouteOptions).catch(() => {}); }, []);

  const handleOpenCreate = () => { setEditingRecord(null); setForm({ ...initialForm, scheduled_at: new Date().toISOString().slice(0, 16) }); setDialogOpen(true); };
  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setForm({ medication_name: record.medication_name, dosage: record.dosage || '', route: record.route || 'oral', frequency: record.frequency || '', scheduled_at: record.scheduled_at ? record.scheduled_at.slice(0, 16) : '', administered_at: record.administered_at ? record.administered_at.slice(0, 16) : '', status: record.status, notes: record.notes || '', medical_plan_id: record.medical_plan_id || null });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.medication_name) return;
    setSaving(true);
    try {
      if (editingRecord) {
        const updated = await BackendAPI.medicationAdministrations.update(parentId, editingRecord.id, form, parentType);
        setRecords(records.map((r) => (r.id === editingRecord.id ? updated : r)));
      } else {
        const created = await BackendAPI.medicationAdministrations.create(parentId, form, parentType);
        setRecords([created, ...records]);
      }
      setDialogOpen(false);
    } catch { setError('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await BackendAPI.medicationAdministrations.destroy(parentId, deleteTarget, parentType); setRecords(records.filter((r) => r.id !== deleteTarget)); }
    catch { setError('Error al eliminar'); }
    setDeleting(false); setDeleteTarget(null);
  };

  const handleMedSearch = (q) => {
    if (medSearchTimer.current) clearTimeout(medSearchTimer.current);
    if (!q || q.length < 2) { setMedOptions([]); return; }
    medSearchTimer.current = setTimeout(async () => {
      try { const data = await catalogsApi.medications.list({ q }); setMedOptions(Array.isArray(data) ? data : []); }
      catch { setMedOptions([]); }
    }, 300);
  };

  const handleAdminister = async (record) => {
    const now = new Date().toISOString();
    try {
      const updated = await BackendAPI.medicationAdministrations.update(parentId, record.id, { status: 'administered', administered_at: now }, parentType);
      setRecords(records.map((r) => (r.id === record.id ? updated : r)));
    } catch { setError('Error al administrar medicación'); }
  };

  const statusColor = (s) => STATUS_OPTIONS.find((o) => o.value === s)?.color || 'default';

  const needsAdmin = records.filter((r) => r.status === 'scheduled').length;

  const columns = useMemo(() => [
    { accessorKey: 'medication_name', header: 'Medicamento', size: 160, Cell: ({ row }) => <Typography fontWeight={600} sx={{ fontSize: '0.75rem' }}>{row.original.medication_name}</Typography> },
    { accessorKey: 'scheduled_at', header: 'Programado', size: 120, Cell: ({ row }) => row.original.scheduled_at ? new Date(row.original.scheduled_at).toLocaleDateString() : '-' },
    { accessorKey: 'administered_at', header: 'Administrado', size: 120, Cell: ({ row }) => row.original.administered_at ? new Date(row.original.administered_at).toLocaleString() : '-' },
    { accessorKey: 'status', header: 'Estado', size: 110, Cell: ({ row }) => <Chip label={row.original.status_label || row.original.status} size="small" color={statusColor(row.original.status)} sx={{ fontSize: '0.7rem' }} /> },
  ], []);

  const table = useMaterialReactTable({
    ...MRT_DEFAULTS,
    columns,
    data: records,
    state: { isLoading: loading },
    enableRowActions: true,
    enableSorting: true,
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.25 }}>
        {!readOnly && row.original.status === 'scheduled' && canNurse && (
          <IconButton size="small" color="success" onClick={() => handleAdminister(row.original)} title="Administrar"><CheckCircleIcon fontSize="small" /></IconButton>
        )}
        {!readOnly && canCreateOrEdit && (
          <>
            <IconButton size="small" onClick={() => handleOpenEdit(row.original)}><EditIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={() => setDeleteTarget(row.original.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
          </>
        )}
      </Box>
    ),
    muiTableBodyRowProps: ({ row }) => ({
      sx: { bgcolor: row.original.status === 'scheduled' ? 'warning.light' : undefined },
    }),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {needsAdmin > 0 && <Chip label={`${needsAdmin} pendiente(s)`} size="small" color="warning" sx={{ fontSize: '0.7rem' }} />}
        {!readOnly && canCreateOrEdit && (
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpenCreate} sx={{ fontSize: '0.7rem' }}>Nueva Medicación</Button>
        )}
      </Box>
    ),
  });

  if (!parentId) return <Typography variant="caption" color="text.secondary">Sin datos disponibles</Typography>;

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError(null)}>{error}</Alert>}
      <MaterialReactTable table={table} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
          {editingRecord ? 'Editar Medicación' : 'Nueva Medicación'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField size="small" label="Medicamento" fullWidth
              value={form.medication_name} onChange={(e) => setForm({ ...form, medication_name: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Via</InputLabel>
                <Select value={form.route} label="Via" onChange={(e) => setForm({ ...form, route: e.target.value })}>
                  {(routeOptions.length > 0 ? routeOptions : [{ id: 0, name: 'oral' }]).map((r) => (
                    <MenuItem key={r.id || 0} value={r.name?.toLowerCase() || r.value || r}>{r.name || r.label || r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField size="small" label="Dosis" value={form.dosage} fullWidth sx={{ flex: 1 }} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="Frecuencia" value={form.frequency} fullWidth sx={{ flex: 1 }} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="ej: c/8h" />
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Estado</InputLabel>
                <Select value={form.status} label="Estado" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="Programado para" type="datetime-local" value={form.scheduled_at} fullWidth onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField size="small" label="Administrado a las" type="datetime-local" value={form.administered_at} fullWidth onChange={(e) => setForm({ ...form, administered_at: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Box>
            <TextField fullWidth size="small" label="Notas" multiline rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ fontSize: '0.7rem' }}>Cancelar</Button>
          <Button variant="outlined" color="success" onClick={handleSave} disabled={saving || !form.medication_name} sx={{ fontSize: '0.7rem' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} message="¿Eliminar este medicamento de forma permanente?" />
    </Box>
  );
};

export default MedicationAdminPanel;
