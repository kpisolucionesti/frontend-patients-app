import { Autocomplete, Box, Button, Chip, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Add, Check, Delete, Edit } from "@mui/icons-material";
import React, { useCallback, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useFetch } from "../../hooks/useFetch";
import usePermissions from "../../hooks/usePermissions";

const TYPE_COLORS = {
  medication: { bg: '#e3f2fd', chip: 'info' },
  procedure: { bg: '#e8f5e9', chip: 'success' },
  image: { bg: '#fff3e0', chip: 'warning' },
  lab: { bg: '#fce4ec', chip: 'error' },
  general: { bg: '#f3e5f5', chip: 'secondary' },
};

const TYPE_LABELS = {
  medication: 'Medicamento',
  procedure: 'Procedimiento',
  image: 'Imagen',
  lab: 'Laboratorio',
  general: 'General',
};

const MedicalPlanSection = ({ emergencyId, readOnly }) => {
  const { data: plans, refetch } = useFetch(
    () => BackendAPI.medicalPlans.getAll(emergencyId),
    [emergencyId],
  );
  const { data: doctors } = useFetch(() => BackendAPI.doctors.getAll(), []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ description: '', indication_type: '', doctor_id: null });

  const permissions = usePermissions();
  const hasPerm = useCallback((p) => permissions.includes(p), [permissions]);
  const canEdit = !readOnly && hasPerm('emergencia.edit');

  const activePlans = useMemo(() => (plans || []).filter((p) => p.status === 'active'), [plans]);
  const completedPlans = useMemo(() => (plans || []).filter((p) => p.status === 'completed'), [plans]);

  const resetForm = useCallback(() => {
    setForm({ description: '', indication_type: '', doctor_id: null });
    setEditingId(null);
    setShowForm(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.description.trim() || !form.indication_type) return;
    const payload = {
      description: form.description,
      indication_type: form.indication_type,
      doctor_id: form.doctor_id || undefined,
    };
    try {
      if (editingId) {
        await BackendAPI.medicalPlans.update({ id: editingId, emergency_id: emergencyId, ...payload });
      } else {
        await BackendAPI.medicalPlans.create(emergencyId, payload);
      }
      resetForm();
      refetch();
    } catch {
      alert('Error al guardar la indicación');
    }
  }, [form, editingId, emergencyId, resetForm, refetch]);

  const handleEdit = useCallback((plan) => {
    setForm({
      description: plan.description,
      indication_type: plan.indication_type,
      doctor_id: plan.doctor?.id || null,
    });
    setEditingId(plan.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (plan) => {
    if (!window.confirm('¿Eliminar esta indicación?')) return;
    try {
      await BackendAPI.medicalPlans.delete(emergencyId, plan.id);
      refetch();
    } catch {
      alert('Error al eliminar la indicación');
    }
  }, [emergencyId, refetch]);

  const handleComplete = useCallback(async (plan) => {
    try {
      await BackendAPI.medicalPlans.update({
        id: plan.id,
        emergency_id: emergencyId,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      refetch();
    } catch {
      alert('Error al completar la indicación');
    }
  }, [emergencyId, refetch]);

  const renderPlanItem = (plan) => {
    const colors = TYPE_COLORS[plan.indication_type] || TYPE_COLORS.general;
    return (
      <Box key={plan.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, p: 0.75, bgcolor: colors.bg, borderRadius: 1 }}>
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip label={TYPE_LABELS[plan.indication_type] || plan.indication_type} size="small" color={colors.chip} />
            {plan.status === 'completed' && <Chip label="Completado" size="small" color="default" sx={{ opacity: 0.7 }} />}
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.25, textDecoration: plan.status === 'completed' ? 'line-through' : 'none', opacity: plan.status === 'completed' ? 0.6 : 1 }}>
            {plan.description}
          </Typography>
          {plan.doctor && (
            <Typography variant="caption" color="text.secondary">
              Dr. {plan.doctor.name}
            </Typography>
          )}
        </Stack>
        {canEdit && plan.status === 'active' && (
          <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
            <Tooltip title="Marcar completada" arrow>
              <IconButton size="small" color="success" onClick={() => handleComplete(plan)}>
                <Check fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar" arrow>
              <IconButton size="small" color="primary" onClick={() => handleEdit(plan)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar" arrow>
              <IconButton size="small" color="error" onClick={() => handleDelete(plan)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {activePlans.length === 0 && completedPlans.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Sin indicaciones médicas</Typography>
      ) : (
        <>
          {activePlans.map(renderPlanItem)}
          {completedPlans.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 0.5 }}>
                Completadas ({completedPlans.length})
              </Typography>
              {completedPlans.map(renderPlanItem)}
            </>
          )}
        </>
      )}

      {canEdit && !showForm && (
        <Button size="small" startIcon={<Add />} onClick={() => setShowForm(true)} sx={{ mt: 0.5 }}>
          Agregar Indicación
        </Button>
      )}

      {canEdit && showForm && (
        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ width: 160 }}>
                <InputLabel>Tipo</InputLabel>
                <Select
                  label="Tipo"
                  value={form.indication_type}
                  onChange={({ target }) => setForm((f) => ({ ...f, indication_type: target.value }))}
                >
                  {Object.entries(TYPE_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                size="small"
                fullWidth
                options={doctors || []}
                getOptionLabel={(opt) => opt.name}
                value={(doctors || []).find((d) => d.id === form.doctor_id) || null}
                onChange={(_e, v) => setForm((f) => ({ ...f, doctor_id: v?.id || null }))}
                renderInput={(params) => <TextField {...params} label="Doctor (opcional)" />}
                sx={{ '& .MuiAutocomplete-option': { fontSize: '0.75rem' } }}
              />
            </Stack>
            <TextField
              size="small"
              fullWidth
              multiline
              rows={2}
              label="Descripción"
              value={form.description}
              onChange={({ target }) => setForm((f) => ({ ...f, description: target.value }))}
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button size="small" color="error" variant="outlined" onClick={resetForm}>Cancelar</Button>
              <Button size="small" variant="contained" color="success" onClick={handleSave} disabled={!form.description.trim() || !form.indication_type}>
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default MedicalPlanSection;
