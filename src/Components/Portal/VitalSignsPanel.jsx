import { useState } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button, IconButton, Collapse } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const VitalSignsPanel = ({ emergencyId, vitalSigns, onCreated, readOnly }) => {
  const [open, setOpen] = useState((vitalSigns || []).length === 0);
  const [form, setForm] = useState({
    systolic_bp: '', diastolic_bp: '', heart_rate: '',
    respiratory_rate: '', temperature: '', oxygen_saturation: '',
    glucose: '', gcs_eye: '', gcs_verbal: '', gcs_motor: '',
    pupil_left: '', pupil_right: '', pain_scale: '',
  });
  const [saving, setSaving] = useState(false);
  const { show: showSnackbar } = useSnackbar();

  const latest = vitalSigns?.[0];

  const handleSubmit = async () => {
    const allEmpty = Object.values(form).every(v => v === '');
    if (allEmpty) {
      showSnackbar('Debe ingresar al menos un signo vital', 'warning');
      return;
    }
    setSaving(true);
    try {
      const data = {};
      const stringFields = ['pupil_left', 'pupil_right'];
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') data[k] = stringFields.includes(k) ? v : Number(v);
      });
      await BackendAPI.vitalSigns.create(emergencyId, data);
      showSnackbar('Signos vitales registrados', 'success');
      setForm({ systolic_bp: '', diastolic_bp: '', heart_rate: '', respiratory_rate: '', temperature: '', oxygen_saturation: '', glucose: '', gcs_eye: '', gcs_verbal: '', gcs_motor: '', pupil_left: '', pupil_right: '', pain_scale: '' });
      if (onCreated) onCreated();
    } catch {
      showSnackbar('Error al guardar signos vitales', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MonitorHeartIcon color="error" sx={{ fontSize: 18 }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#c62828' }}>
            SIGNOS VITALES
          </Typography>
          {latest && (
            <Typography variant="caption" color="text.secondary">
              ({new Date(latest.recorded_at).toLocaleTimeString()})
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={() => setOpen(!open)}>
          <ExpandMoreIcon sx={{ fontSize: 18, transform: open ? 'rotate(180deg)' : 'none' }} />
        </IconButton>
      </Box>

      {latest && !open && (
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {latest.systolic_bp && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>PA</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.systolic_bp}/{latest.diastolic_bp}</Typography>
            </Grid>
          )}
          {latest.heart_rate && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>FC</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.heart_rate} lpm</Typography>
            </Grid>
          )}
          {latest.temperature && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>Temp</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.temperature} °C</Typography>
            </Grid>
          )}
          {latest.oxygen_saturation && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>SpO2</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.oxygen_saturation}%</Typography>
            </Grid>
          )}
          {latest.respiratory_rate && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>FR</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.respiratory_rate} rpm</Typography>
            </Grid>
          )}
          {latest.glucose && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>GLC</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.glucose} mg/dL</Typography>
            </Grid>
          )}
          {(latest.gcs_eye || latest.gcs_verbal || latest.gcs_motor) && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>GCS</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {[latest.gcs_eye, latest.gcs_verbal, latest.gcs_motor].filter(Boolean).reduce((a, b) => Number(a) + Number(b), 0)}
                /15 (O{latest.gcs_eye || 0} V{latest.gcs_verbal || 0} M{latest.gcs_motor || 0})
              </Typography>
            </Grid>
          )}
          {latest.pupil_left && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>Pupilas</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {latest.pupil_left === 'reactive' ? '◉' : latest.pupil_left === 'fixed' ? '●' : latest.pupil_left} / {latest.pupil_right === 'reactive' ? '◉' : latest.pupil_right === 'fixed' ? '●' : latest.pupil_right}
              </Typography>
            </Grid>
          )}
          {latest.pain_scale !== null && latest.pain_scale !== undefined && latest.pain_scale !== '' && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>Dolor</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.pain_scale}/10</Typography>
            </Grid>
          )}
        </Grid>
      )}

      {!readOnly && (
        <Collapse in={open}>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="PA Sist" value={form.systolic_bp} onChange={(e) => setForm({ ...form, systolic_bp: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="PA Diast" value={form.diastolic_bp} onChange={(e) => setForm({ ...form, diastolic_bp: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="FC (lpm)" value={form.heart_rate} onChange={(e) => setForm({ ...form, heart_rate: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="FR (rpm)" value={form.respiratory_rate} onChange={(e) => setForm({ ...form, respiratory_rate: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="Temp (°C)" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} type="number" fullWidth inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="SpO2 (%)" value={form.oxygen_saturation} onChange={(e) => setForm({ ...form, oxygen_saturation: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="GLC (mg/dL)" value={form.glucose} onChange={(e) => setForm({ ...form, glucose: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="GCS Ojos" value={form.gcs_eye} onChange={(e) => setForm({ ...form, gcs_eye: e.target.value })} type="number" fullWidth inputProps={{ min: 1, max: 4, style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="GCS Verbal" value={form.gcs_verbal} onChange={(e) => setForm({ ...form, gcs_verbal: e.target.value })} type="number" fullWidth inputProps={{ min: 1, max: 5, style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="GCS Motor" value={form.gcs_motor} onChange={(e) => setForm({ ...form, gcs_motor: e.target.value })} type="number" fullWidth inputProps={{ min: 1, max: 6, style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="Pupila Izq" value={form.pupil_left} onChange={(e) => setForm({ ...form, pupil_left: e.target.value })} fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} placeholder="reactiva/lenta/fija" />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="Pupila Der" value={form.pupil_right} onChange={(e) => setForm({ ...form, pupil_right: e.target.value })} fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} placeholder="reactiva/lenta/fija" />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="Dolor (0-10)" value={form.pain_scale} onChange={(e) => setForm({ ...form, pain_scale: e.target.value })} type="number" fullWidth inputProps={{ min: 0, max: 10, style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" size="small" startIcon={<AddCircleIcon />} onClick={handleSubmit} disabled={saving} sx={{ fontSize: '0.75rem' }}>
                {saving ? 'Guardando...' : 'Registrar'}
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      )}
    </Paper>
  );
};

export default VitalSignsPanel;
