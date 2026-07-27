import { useState, useEffect } from 'react';
import { Box, Typography, Grid, TextField, Button, IconButton, Collapse } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import { sanitizeNumber } from '../../utils/sanitize';

const EMPTY_FORM = {
  systolic_bp: '', diastolic_bp: '', heart_rate: '',
  respiratory_rate: '', temperature: '', oxygen_saturation: '',
  glucose: '', height: '', weight: '', bmi: '',
};

const VitalSignsPanel = ({ emergencyId, vitalSigns, onCreated, readOnly }) => {
  const [open, setOpen] = useState((vitalSigns || []).length === 0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { show: showSnackbar } = useSnackbar();

  const latest = vitalSigns?.[0];

  useEffect(() => {
    if (open && latest) {
      setForm({
        systolic_bp: latest.systolic_bp ?? '',
        diastolic_bp: latest.diastolic_bp ?? '',
        heart_rate: latest.heart_rate ?? '',
        respiratory_rate: latest.respiratory_rate ?? '',
        temperature: latest.temperature ?? '',
        oxygen_saturation: latest.oxygen_saturation ?? '',
        glucose: latest.glucose ?? '',
        height: latest.height ?? '',
        weight: latest.weight ?? '',
        bmi: latest.bmi ?? '',
      });
    }
  }, [open]);

  const hasValues = !!latest;

  const handleFieldChange = (field, value) => {
    const sanitized = sanitizeNumber(value);
    const updated = { ...form, [field]: sanitized };
    const h = parseFloat(updated.height);
    const w = parseFloat(updated.weight);
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      updated.bmi = (w / (heightInMeters ** 2)).toFixed(1);
    } else {
      updated.bmi = '';
    }
    setForm(updated);
  };

  const handleSubmit = async () => {
    const allEmpty = Object.values(form).every(v => v === '');
    if (allEmpty) {
      showSnackbar('Debe ingresar al menos un signo vital', 'warning');
      return;
    }
    setSaving(true);
    try {
      const data = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '') data[k] = Number(v);
      });
      await BackendAPI.vitalSigns.create(emergencyId, data);
      showSnackbar(hasValues ? 'Signos vitales actualizados' : 'Signos vitales registrados', 'success');
      setForm(EMPTY_FORM);
      setOpen(false);
      if (onCreated) onCreated();
    } catch {
      showSnackbar('Error al guardar signos vitales', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {latest && (
          <Typography variant="caption" color="text.secondary">
            ({new Date(latest.recorded_at).toLocaleTimeString()})
          </Typography>
        )}
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
          {latest.height && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>Talla</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.height} cm</Typography>
            </Grid>
          )}
          {latest.weight && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>Peso</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.weight} kg</Typography>
            </Grid>
          )}
          {latest.bmi && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>IMC</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.bmi}</Typography>
            </Grid>
          )}
        </Grid>
      )}

      {!readOnly && (
        <Collapse in={open}>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="PA Sist" value={form.systolic_bp} onChange={(e) => handleFieldChange('systolic_bp', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="PA Diast" value={form.diastolic_bp} onChange={(e) => handleFieldChange('diastolic_bp', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="FC (lpm)" value={form.heart_rate} onChange={(e) => handleFieldChange('heart_rate', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="FR (rpm)" value={form.respiratory_rate} onChange={(e) => handleFieldChange('respiratory_rate', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="Temp (°C)" value={form.temperature} onChange={(e) => handleFieldChange('temperature', e.target.value)} type="number" fullWidth inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="SpO2 (%)" value={form.oxygen_saturation} onChange={(e) => handleFieldChange('oxygen_saturation', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="GLC (mg/dL)" value={form.glucose} onChange={(e) => handleFieldChange('glucose', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="Talla (cm)" value={form.height} onChange={(e) => handleFieldChange('height', e.target.value)} type="number" fullWidth inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="Peso (kg)" value={form.weight} onChange={(e) => handleFieldChange('weight', e.target.value)} type="number" fullWidth inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={4}>
              <TextField variant="standard" size="small" label="IMC" value={form.bmi} disabled fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" size="small" startIcon={hasValues ? <EditIcon /> : <AddCircleIcon />} onClick={handleSubmit} disabled={saving} sx={{ fontSize: '0.75rem' }}>
                {saving ? 'Guardando...' : hasValues ? 'Editar' : 'Registrar'}
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      )}
    </Box>
  );
};

export default VitalSignsPanel;
