import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, TextField, Button, IconButton, Collapse,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const VitalSignsHistoryTab = ({ emergencyId, readOnly }) => {
  const [vitalSigns, setVitalSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState({
    systolic_bp: '', diastolic_bp: '', heart_rate: '',
    respiratory_rate: '', temperature: '', oxygen_saturation: '',
    glucose: '', height: '', weight: '', bmi: '',
  });
  const [saving, setSaving] = useState(false);
  const { show: showSnackbar } = useSnackbar();

  const fetchVitalSigns = useCallback(async () => {
    if (!emergencyId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.vitalSigns.getAll(emergencyId);
      setVitalSigns(data || []);
    } catch {
      showSnackbar('Error al cargar signos vitales', 'error');
    } finally {
      setLoading(false);
    }
  }, [emergencyId, showSnackbar]);

  useEffect(() => { fetchVitalSigns(); }, [fetchVitalSigns]);

  const handleFieldChange = (field, value) => {
    const updated = { ...form, [field]: value };
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
      showSnackbar('Signos vitales registrados', 'success');
      setForm({ systolic_bp: '', diastolic_bp: '', heart_rate: '', respiratory_rate: '', temperature: '', oxygen_saturation: '', glucose: '', height: '', weight: '', bmi: '' });
      fetchVitalSigns();
    } catch {
      showSnackbar('Error al guardar signos vitales', 'error');
    } finally {
      setSaving(false);
    }
  };

  const latest = vitalSigns[0];

  return (
    <Box>
      {latest?.recorded_at && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mb: 1 }}>
          Último: {new Date(latest.recorded_at).toLocaleString()}
        </Typography>
      )}

      {latest && (
        <Paper variant="outlined" sx={{ p: 1, mb: 1.5, bgcolor: 'background.paper', borderLeft: 3, borderColor: 'error.main' }}>
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', color: 'error.main', display: 'block', mb: 0.5 }}>
            ÚLTIMO REGISTRO
          </Typography>
          <Grid container spacing={0.5}>
            {latest.systolic_bp && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.65rem' }}>PA</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.systolic_bp}/{latest.diastolic_bp}</Typography>
              </Grid>
            )}
            {latest.heart_rate && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.65rem' }}>FC</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.heart_rate} lpm</Typography>
              </Grid>
            )}
            {latest.temperature && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.65rem' }}>Temp</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.temperature} °C</Typography>
              </Grid>
            )}
            {latest.oxygen_saturation && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.65rem' }}>SpO2</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.oxygen_saturation}%</Typography>
              </Grid>
            )}
            {latest.respiratory_rate && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.65rem' }}>FR</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.respiratory_rate} rpm</Typography>
              </Grid>
            )}
            {latest.glucose && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.65rem' }}>GLC</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.glucose} mg/dL</Typography>
              </Grid>
            )}
            {latest.height && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.65rem' }}>Talla</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.height} cm</Typography>
              </Grid>
            )}
            {latest.weight && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.65rem' }}>Peso</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.weight} kg</Typography>
              </Grid>
            )}
            {latest.bmi && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.65rem' }}>IMC</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.bmi}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {!readOnly && (
        <Paper variant="outlined" sx={{ p: 1, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', color: 'error.main' }}>
              NUEVO REGISTRO
            </Typography>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              <ExpandMoreIcon sx={{ fontSize: 18, transform: open ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
          </Box>
          <Collapse in={open}>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="PA Sist" value={form.systolic_bp} onChange={(e) => handleFieldChange('systolic_bp', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="PA Diast" value={form.diastolic_bp} onChange={(e) => handleFieldChange('diastolic_bp', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="FC (lpm)" value={form.heart_rate} onChange={(e) => handleFieldChange('heart_rate', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="FR (rpm)" value={form.respiratory_rate} onChange={(e) => handleFieldChange('respiratory_rate', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="Temp (°C)" value={form.temperature} onChange={(e) => handleFieldChange('temperature', e.target.value)} type="number" fullWidth inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="SpO2 (%)" value={form.oxygen_saturation} onChange={(e) => handleFieldChange('oxygen_saturation', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="GLC (mg/dL)" value={form.glucose} onChange={(e) => handleFieldChange('glucose', e.target.value)} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="Talla (cm)" value={form.height} onChange={(e) => handleFieldChange('height', e.target.value)} type="number" fullWidth inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="Peso (kg)" value={form.weight} onChange={(e) => handleFieldChange('weight', e.target.value)} type="number" fullWidth inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="IMC" value={form.bmi} disabled fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" size="small" startIcon={<AddCircleIcon />} onClick={handleSubmit} disabled={saving} sx={{ fontSize: '0.75rem' }}>
                  {saving ? 'Guardando...' : 'Registrar'}
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </Paper>
      )}

      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', color: 'error.main', mb: 0.5, display: 'block' }}>
        HISTORIAL
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
      ) : vitalSigns.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 2, textAlign: 'center' }}>
          Sin registros de signos vitales
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ flex: 1, minHeight: 0, overflow: 'auto', boxShadow: 3, borderRadius: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Fecha / Hora</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>PA</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>FC</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>FR</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Temp</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>SpO2</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>GLC</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Talla</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Peso</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>IMC</TableCell>
                <TableCell sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Registrado por</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vitalSigns.map((vs) => (
                <TableRow key={vs.id} hover>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5, whiteSpace: 'nowrap' }}>
                    {vs.recorded_at ? new Date(vs.recorded_at).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.systolic_bp ? `${vs.systolic_bp}/${vs.diastolic_bp || '-'}` : '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.heart_rate || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.respiratory_rate || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.temperature || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.oxygen_saturation ? `${vs.oxygen_saturation}%` : '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.glucose || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.height ? `${vs.height} cm` : '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.weight ? `${vs.weight} kg` : '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.bmi || '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.recorded_by?.name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default VitalSignsHistoryTab;
