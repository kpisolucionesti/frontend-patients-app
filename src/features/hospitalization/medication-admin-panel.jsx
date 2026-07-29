import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TextField, Button, Select, MenuItem, FormControl,
  InputLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Alert, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BackendAPI } from '../../services/BackendApi';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';
import usePermissions from '../../hooks/usePermissions';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Programado', color: 'default' },
  { value: 'administered', label: 'Administrado', color: 'success' },
  { value: 'missed', label: 'No Administrado', color: 'error' },
  { value: 'refused', label: 'Rechazado', color: 'warning' },
  { value: 'held', label: 'Suspendido', color: 'default' },
];

const ROUTE_OPTIONS = [
  { value: 'oral', label: 'Oral' },
  { value: 'intravenous', label: 'Intravenoso' },
  { value: 'intramuscular', label: 'Intramuscular' },
  { value: 'subcutaneous', label: 'Subcutáneo' },
  { value: 'topical', label: 'Tópico' },
  { value: 'inhalation', label: 'Inhalación' },
  { value: 'rectal', label: 'Rectal' },
];

const initialForm = {
  medication_name: '',
  dosage: '',
  route: 'oral',
  frequency: '',
  scheduled_at: new Date().toISOString().slice(0, 16),
  administered_at: '',
  status: 'scheduled',
  notes: '',
  medical_plan_id: null,
};

const MedicationAdminPanel = ({ hospitalizationId, emergencyId, readOnly }) => {
  const permissions = usePermissions();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
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
    } catch {
      setError('Error al cargar administración de medicamentos');
    } finally {
      setLoading(false);
    }
  }, [parentId, parentType]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setForm({ ...initialForm, scheduled_at: new Date().toISOString().slice(0, 16) });
    setDialogOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setForm({
      medication_name: record.medication_name,
      dosage: record.dosage || '',
      route: record.route || 'oral',
      frequency: record.frequency || '',
      scheduled_at: record.scheduled_at ? record.scheduled_at.slice(0, 16) : '',
      administered_at: record.administered_at ? record.administered_at.slice(0, 16) : '',
      status: record.status,
      notes: record.notes || '',
      medical_plan_id: record.medical_plan_id || null,
    });
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
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await BackendAPI.medicationAdministrations.destroy(parentId, deleteTarget, parentType);
      setRecords(records.filter((r) => r.id !== deleteTarget));
    } catch {
      setError('Error al eliminar');
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleAdminister = async (record) => {
    const now = new Date().toISOString();
    try {
      const updated = await BackendAPI.medicationAdministrations.update(parentId, record.id, {
        status: 'administered',
        administered_at: now,
      }, parentType);
      setRecords(records.map((r) => (r.id === record.id ? updated : r)));
    } catch {
      setError('Error al administrar medicación');
    }
  };

  const statusColor = (status) => {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found?.color || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!parentId) return <Typography variant="caption" color="text.secondary">Sin datos disponibles</Typography>;

  const needsAdmin = records.filter((r) => r.status === 'scheduled').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {needsAdmin > 0 && (
            <Chip label={`${needsAdmin} pendiente(s)`} size="small" color="warning" sx={{ fontSize: '0.7rem' }} />
          )}
        </Box>
        {!readOnly && canCreateOrEdit && (
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpenCreate} sx={{ fontSize: '0.7rem' }}>
            Nueva Medicación
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError(null)}>{error}</Alert>}

      <TableContainer sx={{ borderRadius: 1, border: 1, borderColor: 'divider' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Medicamento</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Programado</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Administrado</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Estado</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary', fontSize: '0.7rem' }}>
                  Sin medicamentos registrados
                </TableCell>
              </TableRow>
            ) : records.map((r) => (
              <TableRow key={r.id} sx={{ bgcolor: r.status === 'scheduled' ? 'warning.light' : undefined }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>{r.medication_name}</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.scheduled_at ? new Date(r.scheduled_at).toLocaleDateString() : '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>
                  {r.administered_at ? new Date(r.administered_at).toLocaleString() : '-'}
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Chip label={r.status_label || r.status} size="small" color={statusColor(r.status)} sx={{ fontSize: '0.7rem' }} />
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button size="small" variant="outlined" sx={{ fontSize: '0.7rem', py: 0.1, px: 1 }} onClick={() => setDetailRecord(r)}>Ver</Button>
                    {!readOnly && r.status === 'scheduled' && canNurse && (
                      <IconButton size="small" color="success" onClick={() => handleAdminister(r)} title="Administrar">
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}
                    {!readOnly && canCreateOrEdit && (
                      <>
                        <IconButton size="small" onClick={() => handleOpenEdit(r)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => setDeleteTarget(r.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
          {editingRecord ? 'Editar Medicación' : 'Nueva Medicación'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField size="small" label="Medicamento" value={form.medication_name} fullWidth
              onChange={(e) => setForm({ ...form, medication_name: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Vía</InputLabel>
                <Select value={form.route} label="Vía" onChange={(e) => setForm({ ...form, route: e.target.value })}>
                  {ROUTE_OPTIONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField size="small" label="Dosis" value={form.dosage} fullWidth sx={{ flex: 1 }}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="Frecuencia" value={form.frequency} fullWidth sx={{ flex: 1 }}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="ej: c/8h" />
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Estado</InputLabel>
                <Select value={form.status} label="Estado" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="Programado para" type="datetime-local" value={form.scheduled_at} fullWidth
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField size="small" label="Administrado a las" type="datetime-local" value={form.administered_at} fullWidth
                onChange={(e) => setForm({ ...form, administered_at: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Box>
            <TextField fullWidth size="small" label="Notas" multiline rows={2} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ fontSize: '0.7rem' }}>Cancelar</Button>
          <Button variant="outlined" color="success" onClick={handleSave} disabled={saving || !form.medication_name} sx={{ fontSize: '0.7rem' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!detailRecord} onClose={() => setDetailRecord(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
          Detalle de Medicación
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {detailRecord && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}><strong>Medicamento:</strong> {detailRecord.medication_name}</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" sx={{ flex: 1, fontSize: '0.75rem' }}><strong>Dosis:</strong> {detailRecord.dosage || '—'}</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontSize: '0.75rem' }}><strong>Vía:</strong> {detailRecord.route_label || detailRecord.route || '—'}</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontSize: '0.75rem' }}><strong>Frecuencia:</strong> {detailRecord.frequency || '—'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body2" sx={{ flex: 1, fontSize: '0.75rem' }}><strong>Programado:</strong> {detailRecord.scheduled_at ? new Date(detailRecord.scheduled_at).toLocaleString() : '—'}</Typography>
                <Typography variant="body2" sx={{ flex: 1, fontSize: '0.75rem' }}><strong>Administrado:</strong> {detailRecord.administered_at ? new Date(detailRecord.administered_at).toLocaleString() : '—'}</Typography>
              </Box>
              <Box>
                <Chip label={detailRecord.status_label || detailRecord.status} size="small" color={statusColor(detailRecord.status)} sx={{ fontSize: '0.7rem' }} />
              </Box>
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}><strong>Notas:</strong> {detailRecord.notes || '—'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailRecord(null)} variant="outlined" sx={{ fontSize: '0.7rem' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="¿Eliminar este medicamento de forma permanente?"
      />
    </Box>
  );
};

export default MedicationAdminPanel;
