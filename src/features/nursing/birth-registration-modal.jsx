import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, Paper, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PersonIcon from '@mui/icons-material/Person';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const BIRTH_TYPES = [
  { value: 'vaginal', label: 'Vaginal' },
  { value: 'cesarea', label: 'Cesárea' },
  { value: 'instrumentado', label: 'Instrumentado' },
];

const GENDERS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
];

const EMPTY_BABY = {
  name: '',
  gender: 'M',
  birth_type: 'vaginal',
  weight_grams: '',
  apgar_1min: '',
  apgar_5min: '',
  complications: '',
};

const BirthRegistrationModal = ({ open, onClose, motherPatient, motherEmergencyId, onCreated }) => {
  const { show: showSnackbar } = useSnackbar();
  const [babies, setBabies] = useState([{ ...EMPTY_BABY, name: `RN de ${motherPatient?.lastname || ''}` }]);
  const [birthDate, setBirthDate] = useState(new Date().toISOString().slice(0, 16));
  const [gestationalAgeWeeks, setGestationalAgeWeeks] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      BackendAPI.doctors.getAll().then((res) => setDoctors(res.data || res || [])).catch(() => setDoctors([]));
    }
  }, [open]);

  const addBaby = () => {
    setBabies((prev) => [...prev, { ...EMPTY_BABY, name: `RN ${prev.length + 1} de ${motherPatient?.lastname || ''}` }]);
  };

  const removeBaby = (index) => {
    if (babies.length <= 1) return;
    setBabies((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBaby = (index, field, value) => {
    setBabies((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  };

  const handleSave = async () => {
    const invalid = babies.some((b) => !b.name.trim() || !b.gender || !b.birth_type);
    if (invalid) { showSnackbar('Complete todos los campos requeridos de cada bebé', 'warning'); return; }
    if (!motherPatient?.id || !motherEmergencyId) { showSnackbar('Faltan datos de la madre', 'error'); return; }

    setSaving(true);
    try {
      const payload = babies.map((b) => ({
        name: b.name,
        gender: b.gender,
        birth_type: b.birth_type,
        weight_grams: b.weight_grams ? Number(b.weight_grams) : null,
        apgar_1min: b.apgar_1min ? Number(b.apgar_1min) : null,
        apgar_5min: b.apgar_5min ? Number(b.apgar_5min) : null,
        complications: b.complications || null,
      }));

      await BackendAPI.birthRecords.create({
        motherPatientId: motherPatient.id,
        motherEmergencyId,
        birthDate,
        gestationalAgeWeeks: gestationalAgeWeeks ? Number(gestationalAgeWeeks) : null,
        doctorId: doctorId || null,
        babies: payload,
      });
      showSnackbar('Nacimiento(s) registrado(s) exitosamente', 'success');
      onCreated?.();
      onClose();
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Error al registrar nacimiento', 'error');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ChildCareIcon /> Registrar Nacimiento
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Mother info */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: 'action.hover' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary">Madre</Typography>
          </Box>
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.82rem' }}>
            {motherPatient?.name} {motherPatient?.lastname}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>CI: {motherPatient?.ci || '—'}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>HC: {motherPatient?.medical_history_number || '—'}</Typography>
          </Box>
        </Paper>

        {/* Doctor */}
        <TextField select label="Médico tratante" size="small" fullWidth
          value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
          sx={{ mb: 2 }}>
          <MenuItem value=""><em>Seleccionar médico...</em></MenuItem>
          {doctors.map((d) => (
            <MenuItem key={d.id} value={d.id}>{d.name} — {d.specialty?.name || 'Sin especialidad'}</MenuItem>
          ))}
        </TextField>

        {/* General fields */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <TextField label="Fecha de nacimiento" type="datetime-local" size="small" fullWidth
            value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
            InputLabelProps={{ shrink: true }} />
          <TextField label="Edad gestacional (semanas)" type="number" size="small" sx={{ width: 200 }}
            value={gestationalAgeWeeks} onChange={(e) => setGestationalAgeWeeks(e.target.value)}
            InputLabelProps={{ shrink: true }} />
        </Box>

        <Divider sx={{ mb: 1.5 }}>
          <Chip label={`Bebé(s): ${babies.length}`} size="small" color="primary" variant="outlined" />
        </Divider>

        {/* Baby cards */}
        {babies.map((baby, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1.5, position: 'relative' }}>
            {babies.length > 1 && (
              <Tooltip title="Eliminar bebé">
                <IconButton size="small" onClick={() => removeBaby(index)}
                  sx={{ position: 'absolute', top: 4, right: 4, color: 'error.main' }}>
                  <RemoveCircleIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {babies.length > 1 && (
              <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ display: 'block', mb: 1 }}>
                #{index + 1}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField label="Nombre del bebé" size="small" sx={{ flex: 1 }}
                value={baby.name} onChange={(e) => updateBaby(index, 'name', e.target.value)} required />
              <TextField select label="Sexo" size="small" sx={{ width: 140 }}
                value={baby.gender} onChange={(e) => updateBaby(index, 'gender', e.target.value)} required>
                {GENDERS.map((g) => (<MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>))}
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField select label="Tipo de parto" size="small" sx={{ flex: 1 }}
                value={baby.birth_type} onChange={(e) => updateBaby(index, 'birth_type', e.target.value)} required>
                {BIRTH_TYPES.map((t) => (<MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>))}
              </TextField>
              <TextField label="Peso (gramos)" type="number" size="small" sx={{ width: 140 }}
                value={baby.weight_grams} onChange={(e) => updateBaby(index, 'weight_grams', e.target.value)}
                InputLabelProps={{ shrink: true }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField label="Apgar 1 min" type="number" size="small" sx={{ flex: 1 }}
                value={baby.apgar_1min} onChange={(e) => updateBaby(index, 'apgar_1min', e.target.value)}
                InputLabelProps={{ shrink: true }} inputProps={{ min: 0, max: 10 }} />
              <TextField label="Apgar 5 min" type="number" size="small" sx={{ flex: 1 }}
                value={baby.apgar_5min} onChange={(e) => updateBaby(index, 'apgar_5min', e.target.value)}
                InputLabelProps={{ shrink: true }} inputProps={{ min: 0, max: 10 }} />
            </Box>

            <TextField label="Complicaciones / Observaciones" size="small" fullWidth multiline rows={2}
              value={baby.complications} onChange={(e) => updateBaby(index, 'complications', e.target.value)} />
          </Paper>
        ))}

        <Button variant="outlined" size="small" startIcon={<AddIcon />}
          onClick={addBaby} fullWidth sx={{ fontSize: '0.75rem', mt: 0.5 }}>
          Agregar otro bebé (gemelo / múltiple)
        </Button>
      </DialogContent>

      <DialogActions>
        <Button size="small" variant="outlined" onClick={onClose} sx={{ fontSize: '0.75rem' }}>Cancelar</Button>
        <Button size="small" variant="contained" onClick={handleSave} disabled={saving}
          startIcon={<ChildCareIcon />} sx={{ fontSize: '0.75rem', py: 0.25 }}>
          {saving ? 'Registrando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BirthRegistrationModal;
