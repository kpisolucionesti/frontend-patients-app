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
import MedicationIcon from '@mui/icons-material/Medication';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { BackendAPI } from '../../services/BackendApi';
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

const MedicationAdminPanel = ({ hospitalizationId }) => {
  const permissions = usePermissions();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({ ...initialForm });
  const [saving, setSaving] = useState(false);

  const canEdit = permissions.includes('hospitalizacion.edit');
  const canNurse = permissions.includes('hospitalizacion.nursing');
  const canCreateOrEdit = canEdit || canNurse;

  const loadRecords = useCallback(async () => {
    if (!hospitalizationId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.medicationAdministrations.getAll(hospitalizationId);
      setRecords(data || []);
    } catch {
      setError('Error al cargar administración de medicamentos');
    } finally {
      setLoading(false);
    }
  }, [hospitalizationId]);

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
        const updated = await BackendAPI.medicationAdministrations.update(hospitalizationId, editingRecord.id, form);
        setRecords(records.map((r) => (r.id === editingRecord.id ? updated : r)));
      } else {
        const created = await BackendAPI.medicationAdministrations.create(hospitalizationId, form);
        setRecords([created, ...records]);
      }
      setDialogOpen(false);
    } catch {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await BackendAPI.medicationAdministrations.destroy(hospitalizationId, id);
      setRecords(records.filter((r) => r.id !== id));
    } catch {
      setError('Error al eliminar');
    }
  };

  const handleAdminister = async (record) => {
    const now = new Date().toISOString();
    try {
      const updated = await BackendAPI.medicationAdministrations.update(hospitalizationId, record.id, {
        status: 'administered',
        administered_at: now,
      });
      setRecords(records.map((r) => (r.id === record.id ? updated : r)));
    } catch {
      setError('Error al administrar medicación');
    }
  };

  const statusColor = (status) => {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found?.color || 'default';
  };

  if (loading) return <CircularProgress />;

  const needsAdmin = records.filter((r) => r.status === 'scheduled').length;

  return (
    <Paper sx={{ p: 1.5, borderLeft: '4px solid', borderColor: 'primary.main', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MedicationIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: 'primary.main', fontSize: '0.8rem' }}>
            ADMINISTRACIÓN DE MEDICAMENTOS
          </Typography>
          {needsAdmin > 0 && (
            <Chip label={`${needsAdmin} pendiente(s)`} size="small" color="warning" sx={{ ml: 1 }} />
          )}
        </Box>
        {canCreateOrEdit && (
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpenCreate}>
            Nueva Medicación
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Medicamento</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Dosis</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Vía</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Frecuencia</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Programado</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Administrado</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  Sin medicamentos registrados
                </TableCell>
              </TableRow>
            ) : records.map((r) => (
              <TableRow key={r.id} sx={{ bgcolor: r.status === 'scheduled' ? '#fff8e1' : undefined }}>
                <TableCell sx={{ fontWeight: 600 }}>{r.medication_name}</TableCell>
                <TableCell>{r.dosage || '-'}</TableCell>
                <TableCell>{r.route_label || r.route || '-'}</TableCell>
                <TableCell>{r.frequency || '-'}</TableCell>
                <TableCell>{r.scheduled_at ? new Date(r.scheduled_at).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  {r.administered_at ? new Date(r.administered_at).toLocaleString() : '-'}
                </TableCell>
                <TableCell>
                  <Chip label={r.status_label || r.status} size="small" color={statusColor(r.status)} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {r.status === 'scheduled' && canNurse && (
                      <IconButton size="small" color="success" onClick={() => handleAdminister(r)} title="Administrar">
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )}
                    {canCreateOrEdit && (
                      <>
                        <IconButton size="small" onClick={() => handleOpenEdit(r)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(r.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
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
        <DialogTitle>{editingRecord ? 'Editar Medicación' : 'Nueva Medicación'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 2, flexWrap: 'wrap' }}>
            <TextField size="small" label="Medicamento" value={form.medication_name}
              onChange={(e) => setForm({ ...form, medication_name: e.target.value })} sx={{ minWidth: 200 }} />
            <TextField size="small" label="Dosis" value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })} sx={{ minWidth: 120 }} />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Vía</InputLabel>
              <Select value={form.route} label="Vía" onChange={(e) => setForm({ ...form, route: e.target.value })}>
                {ROUTE_OPTIONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField size="small" label="Frecuencia" value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="ej: c/8h" />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select value={form.status} label="Estado" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField size="small" label="Programado para" type="datetime-local" value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField size="small" label="Administrado a las" type="datetime-local" value={form.administered_at}
              onChange={(e) => setForm({ ...form, administered_at: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField fullWidth size="small" label="Notas" multiline rows={2} value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" color="error">Cancelar</Button>
          <Button variant="outlined" color="success" onClick={handleSave} disabled={saving || !form.medication_name}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MedicationAdminPanel;
