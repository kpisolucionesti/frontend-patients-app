import { useState, useEffect } from 'react';
import { Box, Typography, Grid, TextField, Button, IconButton, Collapse } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BackendAPI } from '../../services/BackendApi';
import { catalogsApi } from '../../services/catalogsApi';
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
  const [ranges, setRanges] = useState([]);
  const { show: showSnackbar } = useSnackbar();

  useEffect(() => {
    catalogsApi.vitalSignsRanges.list().then(setRanges).catch(() => {});
  }, []);

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

  const getVitalSignColor = (param, val) => {
    if (!val || ranges.length === 0) return undefined;
    const range = ranges.find((r) => r.parameter === param && r.sex === 'all');
    if (!range) return undefined;
    const v = Number(val);
    if (range.min_alert && v < Number(range.min_alert)) return 'error.main';
    if (range.max_alert && v > Number(range.max_alert)) return 'error.main';
    if (range.min_normal && v < Number(range.min_normal)) return 'warning.dark';
    if (range.max_normal && v > Number(range.max_normal)) return 'warning.dark';
    return undefined;
  };

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
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>PA</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'baseline' }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: getVitalSignColor('systolic_bp', latest.systolic_bp) }}>
                  {latest.systolic_bp}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>/</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: getVitalSignColor('diastolic_bp', latest.diastolic_bp) }}>
                  {latest.diastolic_bp}
                </Typography>
              </Box>
            </Grid>
          )}
          {latest.heart_rate && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>FC</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: getVitalSignColor('heart_rate', latest.heart_rate) }}>{latest.heart_rate} lpm</Typography>
            </Grid>
          )}
          {latest.temperature && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>Temp</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: getVitalSignColor('temperature', latest.temperature) }}>{latest.temperature} °C</Typography>
            </Grid>
          )}
          {latest.oxygen_saturation && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>SpO2</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: getVitalSignColor('oxygen_saturation', latest.oxygen_saturation) }}>{latest.oxygen_saturation}%</Typography>
            </Grid>
          )}
          {latest.respiratory_rate && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>FR</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: getVitalSignColor('respiratory_rate', latest.respiratory_rate) }}>{latest.respiratory_rate} rpm</Typography>
            </Grid>
          )}
          {latest.glucose && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>GLC</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: getVitalSignColor('glucose', latest.glucose) }}>{latest.glucose} mg/dL</Typography>
            </Grid>
          )}
          {latest.height && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>Talla</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.height} cm</Typography>
            </Grid>
          )}
          {latest.weight && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>Peso</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{latest.weight} kg</Typography>
            </Grid>
          )}
          {latest.bmi && (
            <Grid item xs={4}>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>IMC</Typography>
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
