import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, Autocomplete, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';

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

  useEffect(() => {
    BackendAPI.doctors.getAll({ emergency_id: emergencyId }).then((d) => setDoctors(d || [])).catch(() => {});
  }, [emergencyId]);

  const fetch = useCallback(async () => {
    if (!emergencyId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.interconsultations.getAll(emergencyId);
      setItems(data || []);
    } catch {
      setError('Error al cargar interconsultas');
    } finally {
      setLoading(false);
    }
  }, [emergencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (ic) => {
    setEditing(ic);
    setForm({
      doctor_requested_id: ic.doctor_requested?.id || null,
      reason: ic.reason || '',
      observations: ic.observations || '',
      status: ic.status || 'pending',
      consultant_notes: ic.consultant_notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.doctor_requested_id) return;
    setSaving(true);
    try {
      if (editing) {
        await BackendAPI.interconsultations.update(emergencyId, editing.id, form);
      } else {
        await BackendAPI.interconsultations.create(emergencyId, form);
      }
      setDialogOpen(false);
      fetch();
    } catch {
      setError('Error al guardar interconsulta');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await BackendAPI.interconsultations.destroy(emergencyId, id);
      fetch();
    } catch {
      setError('Error al eliminar interconsulta');
    }
  };

  if (!emergencyId) return null;

  return (
    <Paper sx={{ p: 1.5, borderLeft: '4px solid #1565c0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <GroupIcon sx={{ fontSize: 18, color: '#1565c0' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0', fontSize: '0.8rem' }}>
            INTERCONSULTAS
          </Typography>
          {items.filter((i) => i.status === 'pending').length > 0 && (
            <Chip label={`${items.filter((i) => i.status === 'pending').length} pendiente(s)`} size="small" color="warning" sx={{ height: 20, fontSize: '0.6rem' }} />
          )}
        </Box>
        {canEdit && (
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpenAdd}>
            Nueva Interconsulta
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Médico Solicitado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Motivo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Resumen del Consultor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 6 : 5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Sin interconsultas registradas
                  </TableCell>
                </TableRow>
              ) : items.map((ic) => (
                <TableRow key={ic.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{ic.doctor_requested?.name || '?'}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ic.reason || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_OPTIONS.find((s) => s.key === ic.status)?.label || ic.status}
                      size="small"
                      sx={{ height: 20, fontSize: '0.6rem', bgcolor: STATUS_OPTIONS.find((s) => s.key === ic.status)?.color || '#999', color: 'white' }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, fontSize: '0.75rem' }}>{ic.consultant_notes || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 150, fontSize: '0.75rem' }}>{ic.observations || '-'}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenEdit(ic)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(ic.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.85rem', bgcolor: '#1565c0', color: 'white' }}>
          {editing ? 'Editar Interconsulta' : 'Nueva Interconsulta'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <Autocomplete
              size="small" fullWidth
              options={doctors}
              getOptionLabel={(option) => `${option.name}${option.speciality ? ` (${option.speciality})` : ''}`}
              value={doctors.find((d) => d.id === form.doctor_requested_id) || null}
              isOptionEqualToValue={(option, val) => option.id === val.id}
              onChange={(_e, v) => handleChange('doctor_requested_id', v ? v.id : null)}
              renderInput={(params) => <TextField variant="standard" {...params} label="Médico Solicitado" required />}
            />
            <TextField variant="standard" size="small" label="Motivo" value={form.reason}
              onChange={(e) => handleChange('reason', e.target.value)} fullWidth multiline rows={2} />
            <TextField variant="standard" size="small" label="Resumen del Consultor" value={form.consultant_notes}
              onChange={(e) => handleChange('consultant_notes', e.target.value)} fullWidth multiline rows={3}
              placeholder="Nota del médico consultado sobre el paciente" />
            <TextField variant="standard" size="small" label="Observaciones" value={form.observations}
              onChange={(e) => handleChange('observations', e.target.value)} fullWidth multiline rows={2} />
            <TextField select variant="standard" size="small" label="Estado" value={form.status}
              onChange={(e) => handleChange('status', e.target.value)} fullWidth>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.doctor_requested_id}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InterconsultationsTab;
