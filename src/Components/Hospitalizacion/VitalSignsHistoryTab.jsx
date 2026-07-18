import { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Grid, TextField, Button, IconButton, Collapse,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const VitalSignsHistoryTab = ({ emergencyId, readOnly }) => {
  const [vitalSigns, setVitalSigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState({
    systolic_bp: '', diastolic_bp: '', heart_rate: '',
    respiratory_rate: '', temperature: '', oxygen_saturation: '',
    glucose: '', gcs_eye: '', gcs_verbal: '', gcs_motor: '',
    pupil_left: '', pupil_right: '', pain_scale: '',
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
      fetchVitalSigns();
    } catch {
      showSnackbar('Error al guardar signos vitales', 'error');
    } finally {
      setSaving(false);
    }
  };

  const latest = vitalSigns[0];

  return (
    <Paper sx={{ p: 1.5, borderLeft: '4px solid #c62828' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MonitorHeartIcon sx={{ fontSize: 18, color: '#c62828' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#c62828', fontSize: '0.8rem' }}>
            SIGNOS VITALES
          </Typography>
          {latest?.recorded_at && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              (Último: {new Date(latest.recorded_at).toLocaleString()})
            </Typography>
          )}
        </Box>
      </Box>

      {latest && (
        <Paper variant="outlined" sx={{ p: 1, mb: 1.5, bgcolor: '#fff8f8' }}>
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', color: '#c62828', display: 'block', mb: 0.5 }}>
            ÚLTIMO REGISTRO
          </Typography>
          <Grid container spacing={0.5}>
            {latest.systolic_bp && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>PA</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.systolic_bp}/{latest.diastolic_bp}</Typography>
              </Grid>
            )}
            {latest.heart_rate && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>FC</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.heart_rate} lpm</Typography>
              </Grid>
            )}
            {latest.temperature && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>Temp</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.temperature} °C</Typography>
              </Grid>
            )}
            {latest.oxygen_saturation && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>SpO2</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.oxygen_saturation}%</Typography>
              </Grid>
            )}
            {latest.respiratory_rate && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>FR</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.respiratory_rate} rpm</Typography>
              </Grid>
            )}
            {latest.glucose && (
              <Grid item xs={3} sm={2}>
                <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>GLC</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.glucose} mg/dL</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {!readOnly && (
        <Paper variant="outlined" sx={{ p: 1, mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', color: '#c62828' }}>
              NUEVO REGISTRO
            </Typography>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              <ExpandMoreIcon sx={{ fontSize: 18, transform: open ? 'rotate(180deg)' : 'none' }} />
            </IconButton>
          </Box>
          <Collapse in={open}>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="PA Sist" value={form.systolic_bp} onChange={(e) => setForm({ ...form, systolic_bp: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="PA Diast" value={form.diastolic_bp} onChange={(e) => setForm({ ...form, diastolic_bp: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="FC (lpm)" value={form.heart_rate} onChange={(e) => setForm({ ...form, heart_rate: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="FR (rpm)" value={form.respiratory_rate} onChange={(e) => setForm({ ...form, respiratory_rate: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="Temp (°C)" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} type="number" fullWidth inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="SpO2 (%)" value={form.oxygen_saturation} onChange={(e) => setForm({ ...form, oxygen_saturation: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="GLC (mg/dL)" value={form.glucose} onChange={(e) => setForm({ ...form, glucose: e.target.value })} type="number" fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="GCS Ojos" value={form.gcs_eye} onChange={(e) => setForm({ ...form, gcs_eye: e.target.value })} type="number" fullWidth inputProps={{ min: 1, max: 4, style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="GCS Verbal" value={form.gcs_verbal} onChange={(e) => setForm({ ...form, gcs_verbal: e.target.value })} type="number" fullWidth inputProps={{ min: 1, max: 5, style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="GCS Motor" value={form.gcs_motor} onChange={(e) => setForm({ ...form, gcs_motor: e.target.value })} type="number" fullWidth inputProps={{ min: 1, max: 6, style: { fontSize: '0.75rem' } }} />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="Pupila Izq" value={form.pupil_left} onChange={(e) => setForm({ ...form, pupil_left: e.target.value })} fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} placeholder="reactiva/lenta/fija" />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="Pupila Der" value={form.pupil_right} onChange={(e) => setForm({ ...form, pupil_right: e.target.value })} fullWidth inputProps={{ style: { fontSize: '0.75rem' } }} placeholder="reactiva/lenta/fija" />
              </Grid>
              <Grid item xs={4} sm={3} lg={2}>
                <TextField variant="standard" size="small" label="Dolor (0-10)" value={form.pain_scale} onChange={(e) => setForm({ ...form, pain_scale: e.target.value })} type="number" fullWidth inputProps={{ min: 0, max: 10, style: { fontSize: '0.75rem' } }} />
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

      <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', color: '#c62828', mb: 0.5, display: 'block' }}>
        HISTORIAL
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
      ) : vitalSigns.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 2, textAlign: 'center' }}>
          Sin registros de signos vitales
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>Fecha / Hora</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>PA</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>FC</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>FR</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>Temp</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>SpO2</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>GLC</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>GCS</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>Pupilas</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>Dolor</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', p: 0.5 }}>Registrado por</TableCell>
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
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>
                    {vs.gcs_eye || vs.gcs_verbal || vs.gcs_motor
                      ? `${[vs.gcs_eye, vs.gcs_verbal, vs.gcs_motor].filter(Boolean).reduce((a, b) => Number(a) + Number(b), 0)}/15`
                      : '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>
                    {vs.pupil_left || vs.pupil_right
                      ? `${vs.pupil_left === 'reactive' ? '◉' : '●'}/${vs.pupil_right === 'reactive' ? '◉' : '●'}`
                      : '-'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.pain_scale !== null && vs.pain_scale !== undefined && vs.pain_scale !== '' ? `${vs.pain_scale}/10` : '-'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{vs.recorded_by?.name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default VitalSignsHistoryTab;
