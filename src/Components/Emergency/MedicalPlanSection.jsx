import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import usePermissions from '../../hooks/usePermissions';

const INDICATION_TYPES = [
  { key: 'lab', label: 'Laboratorio', color: '#1565c0' },
  { key: 'image', label: 'Imagenologia', color: '#6a1b9a' },
  { key: 'medication', label: 'Tratamiento', color: '#2e7d32' },
  { key: 'procedure', label: 'Procedimiento', color: '#e65100' },
  { key: 'general', label: 'Estudios Extras', color: '#546e7a' },
];

const getTypeLabel = (key) => INDICATION_TYPES.find((t) => t.key === key)?.label || key;
const getTypeColor = (key) => INDICATION_TYPES.find((t) => t.key === key)?.color || '#999';

const MedicalPlanSection = ({ emergencyId, readOnly, doctorId }) => {
  const permissions = usePermissions();
  const canEdit = permissions.includes('emergencia.edit') || permissions.includes('planes.edit');
  const { data: plans, loading, refetch } = useFetch(
    () => BackendAPI.medicalPlans.getAll(emergencyId),
    [emergencyId],
  );

  const allPlans = plans || [];
  const activePlans = allPlans.filter((p) => p.status !== 'completed');
  const completedPlans = allPlans.filter((p) => p.status === 'completed');

  const isOwnPlan = (p) => doctorId && Number(p.doctor_id) === Number(doctorId);

  const { show: showSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ indication_type: 'general', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({ indication_type: 'general', description: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditing(p);
    setForm({ indication_type: p.indication_type, description: p.description });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.description || !form.indication_type) return;
    setSaving(true);
    try {
      if (editing) {
        await BackendAPI.medicalPlans.update({ ...editing, ...form, doctor_id: doctorId });
      } else {
        await BackendAPI.medicalPlans.create(emergencyId, { ...form, doctor_id: doctorId });
      }
      setDialogOpen(false);
      refetch();
    } catch {
      showSnackbar('Error al guardar indicación', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await BackendAPI.medicalPlans.delete(emergencyId, deleteTarget.id);
      refetch();
    } catch {
      showSnackbar('Error al eliminar indicación', 'error');
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleToggleStatus = async (plan) => {
    try {
      await BackendAPI.medicalPlans.update({
        ...plan,
        status: plan.status === 'completed' ? 'active' : 'completed',
      });
      refetch();
    } catch {
      showSnackbar('Error al actualizar indicación', 'error');
    }
  };

  if (!emergencyId) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
          INDICACIONES MÉDICAS
        </Typography>
        {!readOnly && canEdit && (
          <Button size="small" variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAdd}
            sx={{ textTransform: 'none', fontSize: '0.7rem', minWidth: 0 }}>
            Agregar Indicación
          </Button>
        )}
      </Box>

      {loading ? (
        <Typography variant="caption" color="text.secondary">Cargando...</Typography>
      ) : activePlans.length === 0 && completedPlans.length === 0 ? (
        <Typography variant="caption" color="text.secondary">Sin indicaciones registradas</Typography>
      ) : (
        <>
          {activePlans.map((p) => (
            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, p: 0.5, bgcolor: '#fafafa', borderRadius: 1 }}>
              <Chip label={getTypeLabel(p.indication_type)} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: getTypeColor(p.indication_type), color: 'white' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block' }}>{p.description}</Typography>
                {p.created_by?.name && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                    Solicitado por: {p.created_by.name}
                  </Typography>
                )}
              </Box>
              {!readOnly && canEdit && isOwnPlan(p) && (
                <>
                  <Tooltip title="Completar" arrow>
                    <IconButton size="small" onClick={() => handleToggleStatus(p)} sx={{ p: 0.15 }}>
                      <EditIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar" arrow>
                    <IconButton size="small" onClick={() => handleOpenEdit(p)} sx={{ p: 0.15 }}>
                      <EditIcon sx={{ fontSize: 12, color: '#1565c0' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar" arrow>
                    <IconButton size="small" onClick={() => setDeleteTarget(p)} sx={{ p: 0.15 }}>
                      <DeleteIcon sx={{ fontSize: 12, color: '#e53935' }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          ))}

          {completedPlans.length > 0 && (
            <>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mt: 1, mb: 0.5, display: 'block' }}>
                Completadas ({completedPlans.length})
              </Typography>
              {completedPlans.map((p) => (
                <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, p: 0.5, bgcolor: '#f5f5f5', borderRadius: 1, opacity: 0.7 }}>
                  <Chip label={getTypeLabel(p.indication_type)} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: getTypeColor(p.indication_type), color: 'white' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', textDecoration: 'line-through', display: 'block' }}>{p.description}</Typography>
                    {p.created_by?.name && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                        Solicitado por: {p.created_by.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.85rem', bgcolor: 'primary.main', color: 'white' }}>
          {editing ? 'Editar Indicación' : 'Agregar Indicación'}
        </DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField select variant="standard" size="small" label="Tipo" value={form.indication_type}
              onChange={(e) => setForm((prev) => ({ ...prev, indication_type: e.target.value }))} fullWidth>
              {INDICATION_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
            </TextField>
            <TextField variant="standard" size="small" label="Descripción" value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave}
            disabled={saving || !form.description || !form.indication_type}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="¿Eliminar esta indicación médica?"
      />
    </Box>
  );
};

export default MedicalPlanSection;
