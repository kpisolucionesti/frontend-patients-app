import { useState, useEffect, useCallback, useMemo } from 'react';
import { Autocomplete, Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Chip } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';
import { useDoctors } from '../../hooks/useApiData';
import { useFetch } from '../../hooks/useFetch';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';

const STATUS_OPTIONS = [
  { key: 'pending', label: 'Pendiente', color: '#e65100' },
  { key: 'completed', label: 'Completada', color: '#2e7d32' },
  { key: 'cancelled', label: 'Cancelada', color: '#999' },
];

const EMPTY = { doctor_requested_id: null, reason: '', observations: '', status: 'pending' };

const InterconsultationsDetail = ({ emergencyId, readOnly }) => {
  const [items, setItems] = useState([]);
  const { data: doctors } = useDoctors();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: emergency } = useFetch(
    () => emergencyId ? BackendAPI.emergencies.getById(emergencyId) : Promise.resolve(null),
    [emergencyId],
  );

  const effectiveReadOnly = useMemo(() => {
    if (readOnly) return true;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.is_admin === true) return false;
    if (!emergency) return false;
    const loggedDoctorId = Number(user?.doctor_id) || null;
    if (!loggedDoctorId) return false;
    const isPrimary = Number(emergency.primary_doctor?.id) === loggedDoctorId;
    if (isPrimary) return false;
    const allDoctors = emergency.doctors || emergency.consulting_doctors || [];
    return allDoctors.some((d) => Number(d.id) === loggedDoctorId);
  }, [readOnly, emergency]);

  const fetch = useCallback(async () => {
    if (!emergencyId) return;
    try { const data = await BackendAPI.interconsultations.getAll(emergencyId); setItems(data || []); } catch { setItems([]); }
  }, [emergencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (ic) => { setEditing(ic); setForm({ doctor_requested_id: ic.doctor_requested?.id || null, reason: ic.reason || '', observations: ic.observations || '', status: ic.status || 'pending' }); setDialogOpen(true); };

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
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await BackendAPI.interconsultations.destroy(emergencyId, deleteTarget); fetch(); } catch { /* ignore */ }
    setDeleting(false);
    setDeleteTarget(null);
  };

  if (!emergencyId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <GroupIcon sx={{ fontSize: 18, color: '#1565c0' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0' }}>INTERCONSULTAS</Typography>
        </Box>
        <Tooltip title={effectiveReadOnly ? 'Sin permiso' : 'Agregar interconsulta'} arrow>
          <span><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }} disabled={effectiveReadOnly}><AddCircleOutlineIcon fontSize="small" /></IconButton></span>
        </Tooltip>
      </Box>
      {items.length > 0 ? (
        <Box>
          {items.map((ic) => (
            <Box key={ic.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 0.5, p: 0.5, bgcolor: '#fafafa', borderRadius: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>{ic.doctor_requested?.name || '?'}</Typography>
                {ic.reason && <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{ic.reason}</Typography>}
                <Chip
                  label={STATUS_OPTIONS.find((s) => s.key === ic.status)?.label || ic.status}
                  size="small"
                  sx={{ height: 16, fontSize: '0.55rem', mt: 0.25, bgcolor: STATUS_OPTIONS.find((s) => s.key === ic.status)?.color || '#999', color: 'white' }}
                />
              </Box>
              <Tooltip title={effectiveReadOnly ? 'Sin permiso' : 'Editar'} arrow>
                <span><IconButton size="small" onClick={() => handleOpenEdit(ic)} sx={{ p: 0.15 }} disabled={effectiveReadOnly}><EditIcon sx={{ fontSize: 12 }} /></IconButton></span>
              </Tooltip>
              <Tooltip title={effectiveReadOnly ? 'Sin permiso' : 'Eliminar'} arrow>
                <span><IconButton size="small" onClick={() => setDeleteTarget(ic.id)} sx={{ p: 0.15 }} disabled={effectiveReadOnly}><DeleteIcon sx={{ fontSize: 12, color: effectiveReadOnly ? undefined : '#e53935' }} /></IconButton></span>
              </Tooltip>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">Sin interconsultas registradas</Typography>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.95rem' }}>{editing ? 'Editar Interconsulta' : 'Agregar Interconsulta'}</DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Autocomplete
              size="small" fullWidth
              options={doctors || []}
              getOptionLabel={(option) => `${option.name}${option.specialty?.name ? ` (${option.specialty.name})` : ''}`}
              value={(doctors || []).find((d) => d.id === form.doctor_requested_id) || null}
              isOptionEqualToValue={(option, val) => option.id === val.id}
              onChange={(_e, v) => handleChange('doctor_requested_id', v ? v.id : null)}
              renderInput={(params) => <TextField variant="standard" {...params} size="small" label="Médico Solicitado" required />}
            />
            <TextField variant="standard" size="small" label="Motivo" value={form.reason} onChange={(e) => handleChange('reason', e.target.value)} fullWidth />
            <TextField variant="standard" size="small" label="Observaciones" value={form.observations} onChange={(e) => handleChange('observations', e.target.value)} multiline rows={2} fullWidth />
            <Autocomplete
              size="small"
              options={STATUS_OPTIONS}
              getOptionLabel={(opt) => opt.label}
              value={STATUS_OPTIONS.find((s) => s.key === form.status) || null}
              onChange={(_e, v) => handleChange('status', v ? v.key : '')}
              renderInput={(params) => <TextField variant="standard" {...params} size="small" label="Estado" fullWidth />}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.doctor_requested_id}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        message="¿Eliminar esta interconsulta?"
      />
    </Paper>
  );
};

export default InterconsultationsDetail;