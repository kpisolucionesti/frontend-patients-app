import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';

export const SURGERY_TYPES = [
  { key: 'general', label: 'Cirugía General' },
  { key: 'traumatologia', label: 'Traumatología' },
  { key: 'neurocirugia', label: 'Neurocirugía' },
  { key: 'cardiovascular', label: 'Cardiovascular' },
  { key: 'toracica', label: 'Torácica' },
  { key: 'abdominal', label: 'Abdominal' },
  { key: 'urologica', label: 'Urológica' },
  { key: 'ginecologica', label: 'Ginecológica' },
  { key: 'oftalmologica', label: 'Oftalmológica' },
  { key: 'otorrino', label: 'Otorrinolaringología' },
  { key: 'maxilofacial', label: 'Maxilofacial' },
  { key: 'pediatrica', label: 'Pediátrica' },
  { key: 'otros', label: 'Otra' },
];

export const STATUS_OPTIONS = [
  { key: 'scheduled', label: 'Programada', color: 'info' },
  { key: 'completed', label: 'Realizada', color: 'success' },
  { key: 'cancelled', label: 'Cancelada', color: 'default' },
];

const EMPTY = {
  surgery_type: '',
  description: '',
  surgeon_name: '',
  surgery_date: '',
  scheduled_start_time: '',
  scheduled_end_time: '',
  status: 'scheduled',
  preanesthetic_evaluation: '',
  preop_notes: '',
  postop_notes: '',
  result: '',
};

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
    try {
      const data = await BackendAPI.surgeries.getAll(hospitalizationId);
      setItems(data || []);
    } catch {
      setError('Error al cargar cirugías');
    } finally {
      setLoading(false);
    }
  }, [hospitalizationId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm({ ...EMPTY, surgery_date: new Date().toISOString().slice(0, 16) }); setDialogOpen(true); };
  const handleOpenEdit = (s) => {
    setEditing(s);
    setForm({
      surgery_type: s.surgery_type || '',
      description: s.description || '',
      surgeon_name: s.surgeon_name || '',
      surgery_date: s.surgery_date ? s.surgery_date.slice(0, 16) : '',
      scheduled_start_time: s.scheduled_start_time ? s.scheduled_start_time.slice(0, 16) : '',
      scheduled_end_time: s.scheduled_end_time ? s.scheduled_end_time.slice(0, 16) : '',
      status: s.status || 'scheduled',
      preanesthetic_evaluation: s.preanesthetic_evaluation || '',
      preop_notes: s.preop_notes || '',
      postop_notes: s.postop_notes || '',
      result: s.result || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.surgery_type) return;
    setSaving(true);
    try {
      if (editing) {
        await BackendAPI.surgeries.update(hospitalizationId, editing.id, form);
      } else {
        await BackendAPI.surgeries.create(hospitalizationId, form);
      }
      setDialogOpen(false);
      fetch();
    } catch {
      setError('Error al guardar cirugía');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await BackendAPI.surgeries.destroy(hospitalizationId, id);
      fetch();
    } catch {
      setError('Error al eliminar cirugía');
    }
  };

  if (!hospitalizationId) return null;

  const scheduledCount = items.filter((s) => s.status === 'scheduled').length;

  return (
    <Paper sx={{ p: 1.5, borderLeft: 3, borderColor: 'primary.main', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocalHospitalIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: 'primary.main', fontSize: '0.8rem' }}>
            CIRUGÍAS
          </Typography>
          {scheduledCount > 0 && (
            <Chip label={`${scheduledCount} programada(s)`} size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Box>
        {canEdit && (
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpenAdd}>
            Nueva Cirugía
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ flex: 1, minHeight: 0, overflow: 'auto', borderRadius: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Tipo</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Descripción</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Cirujano</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Fecha</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Hora Inicio</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Hora Fin</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Notas Post-Op</TableCell>
                {canEdit && <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 9 : 8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Sin cirugías registradas
                  </TableCell>
                </TableRow>
              ) : items.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Chip label={SURGERY_TYPES.find((t) => t.key === s.surgery_type)?.label || s.surgery_type}
                      size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'primary.main', color: 'white' }} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, fontSize: '0.75rem' }}>{s.description || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{s.surgeon_name || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    {s.surgery_date ? new Date(s.surgery_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    {s.scheduled_start_time ? new Date(s.scheduled_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    {s.scheduled_end_time ? new Date(s.scheduled_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_OPTIONS.find((o) => o.key === s.status)?.label || s.status}
                      size="small"
                      color={STATUS_OPTIONS.find((o) => o.key === s.status)?.color || 'default'}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, fontSize: '0.75rem' }}>{s.postop_notes || '-'}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenEdit(s)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(s.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
          {editing ? 'Editar Cirugía' : 'Nueva Cirugía'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <TextField select variant="standard" size="small" label="Tipo de Cirugía" value={form.surgery_type}
              onChange={(e) => handleChange('surgery_type', e.target.value)} required fullWidth>
              {SURGERY_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
            </TextField>
            <TextField variant="standard" size="small" label="Descripción" value={form.description}
              onChange={(e) => handleChange('description', e.target.value)} multiline rows={2} fullWidth />
            <TextField variant="standard" size="small" label="Cirujano" value={form.surgeon_name}
              onChange={(e) => handleChange('surgeon_name', e.target.value)} fullWidth />
            <TextField variant="standard" size="small" label="Fecha de Cirugía" type="date"
              value={form.surgery_date} onChange={(e) => handleChange('surgery_date', e.target.value)}
              InputLabelProps={{ shrink: true }} fullWidth />
            <TextField variant="standard" size="small" label="Hora de Inicio" type="time"
              value={form.scheduled_start_time} onChange={(e) => handleChange('scheduled_start_time', e.target.value)}
              InputLabelProps={{ shrink: true }} fullWidth />
            <TextField variant="standard" size="small" label="Hora de Fin" type="time"
              value={form.scheduled_end_time} onChange={(e) => handleChange('scheduled_end_time', e.target.value)}
              InputLabelProps={{ shrink: true }} fullWidth />
            <TextField select variant="standard" size="small" label="Estado" value={form.status}
              onChange={(e) => handleChange('status', e.target.value)} fullWidth>
              {STATUS_OPTIONS.map((o) => <MenuItem key={o.key} value={o.key}>{o.label}</MenuItem>)}
            </TextField>
            <TextField variant="standard" size="small" label="Evaluación Pre-Anestésica" value={form.preanesthetic_evaluation}
              onChange={(e) => handleChange('preanesthetic_evaluation', e.target.value)} multiline rows={2} fullWidth />
            <TextField variant="standard" size="small" label="Notas Pre-Op" value={form.preop_notes}
              onChange={(e) => handleChange('preop_notes', e.target.value)} multiline rows={2} fullWidth />
            <TextField variant="standard" size="small" label="Notas Post-Op" value={form.postop_notes}
              onChange={(e) => handleChange('postop_notes', e.target.value)} multiline rows={2} fullWidth />
            <TextField variant="standard" size="small" label="Resultado" value={form.result}
              onChange={(e) => handleChange('result', e.target.value)} multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.surgery_type}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SurgeriesTab;
