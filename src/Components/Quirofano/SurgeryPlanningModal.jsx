import { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Grid, Alert, Autocomplete,
  FormControlLabel, Checkbox, Typography, Divider
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { SURGERY_TYPES, STATUS_OPTIONS } from '../Hospitalizacion/SurgeriesTab';
import { sanitizeInput } from '../../utils/sanitize';

const ANESTHESIA_TYPES = [
  'General', 'Regional', 'Local', 'Sedación', 'Bloqueo', 'Mixta'
];

const EXTENDED_STATUS_OPTIONS = [
  ...STATUS_OPTIONS,
  { key: 'in_progress', label: 'En Progreso', color: 'warning' },
];

export default function SurgeryPlanningModal({ open, onClose, onSaved, surgery }) {
  const [form, setForm] = useState({
    surgery_type: '', description: '', surgeon_name: '', patient_id: '',
    surgery_date: '', scheduled_start_time: '', scheduled_end_time: '',
    actual_start_time: '', actual_end_time: '',
    area_id: '', anesthesiologist: '', anesthesia_type: '',
    preanesthetic_evaluation: '', preop_notes: '', postop_notes: '', result: '',
    status: 'scheduled', hospitalization_id: '', ambulatory: false
  });
  const [areas, setAreas] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    BackendAPI.areas.getAll().then(setAreas).catch(() => setError('Error al cargar quirófanos'));
  }, []);

  useEffect(() => {
    if (surgery) {
      const patient = surgery.patient ? {
        id: surgery.patient.id,
        name: surgery.patient.name,
        lastname: surgery.patient.lastname,
        ci: surgery.patient.ci
      } : null;
      setSelectedPatient(patient);
      setForm({
        surgery_type: surgery.surgery_type || '',
        description: surgery.description || '',
        surgeon_name: surgery.surgeon_name || '',
        patient_id: surgery.patient_id || surgery.patient?.id || '',
        surgery_date: surgery.surgery_date?.split('T')[0] || '',
        scheduled_start_time: surgery.scheduled_start_time || '',
        scheduled_end_time: surgery.scheduled_end_time || '',
        actual_start_time: surgery.actual_start_time || '',
        actual_end_time: surgery.actual_end_time || '',
        area_id: surgery.area_id || '',
        anesthesiologist: surgery.anesthesiologist || '',
        anesthesia_type: surgery.anesthesia_type || '',
        preanesthetic_evaluation: surgery.preanesthetic_evaluation || '',
        preop_notes: surgery.preop_notes || '',
        postop_notes: surgery.postop_notes || '',
        result: surgery.result || '',
        status: surgery.status || 'scheduled',
        hospitalization_id: surgery.hospitalization_id || '',
        ambulatory: surgery.ambulatory === true || (!surgery.hospitalization_id && surgery.patient_id != null)
      });
    } else {
      setSelectedPatient(null);
      const today = new Date().toISOString().split('T')[0];
      setForm(prev => ({ ...prev, surgery_date: today, ambulatory: false }));
    }
  }, [surgery, open]);

  const handlePatientSearch = (q) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.length < 2) { setPatientOptions([]); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await BackendAPI.patients.getAll({ q, per_page: 20 });
        setPatientOptions(res.data || []);
      } catch { /* ignore */ }
    }, 400);
  };

  const handlePatientSelect = (event, value) => {
    setSelectedPatient(value);
    setForm(prev => ({ ...prev, patient_id: value?.id || '' }));
  };

  const handleSubmit = async () => {
    setError(null);
    const payload = { ...form };
    if (form.ambulatory) {
      delete payload.hospitalization_id;
    }
    try {
      if (surgery) {
        await BackendAPI.quirofano.update(surgery.id, payload);
      } else {
        await BackendAPI.quirofano.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cirugía');
    }
  };

  const handleChange = (field) => (e) => {
    const raw = e.target.value;
    const textFields = ['description', 'surgeon_name', 'anesthesiologist', 'preanesthetic_evaluation', 'preop_notes', 'postop_notes', 'result'];
    const value = textFields.includes(field) ? sanitizeInput(raw, { maxLength: 5000 }) : raw;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFinalized = surgery?.status === 'completed' || surgery?.status === 'cancelled';
  const statusIsPast = form.status === 'completed' || form.status === 'cancelled';
  const statusIsActive = form.status === 'in_progress';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#00695c', color: 'white', fontWeight: 'bold' }}>
        {surgery ? 'Editar Cirugía' : 'Planificar Cirugía'}
      </DialogTitle>
      <DialogContent>
        {isFinalized && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta cirugía ya fue {surgery.status === 'completed' ? 'culminada' : 'anulada'} y no puede modificarse.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.ambulatory}
                    onChange={(e) => setForm(prev => ({ ...prev, ambulatory: e.target.checked, hospitalization_id: e.target.checked ? '' : prev.hospitalization_id }))}
                    color="primary"
                    disabled={isFinalized}
                  />
                }
                label={<Typography variant="body2" fontWeight={600}>Paciente ambulatorio (sin hospitalización)</Typography>}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField select variant="standard" size="small" fullWidth label="Tipo de Cirugía" value={form.surgery_type}
                onChange={handleChange('surgery_type')} required disabled={isFinalized}>
                {SURGERY_TYPES.map(t => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField variant="standard" size="small" fullWidth label="Nombre del Cirujano" value={form.surgeon_name}
                onChange={handleChange('surgeon_name')} disabled={isFinalized} />
            </Grid>

            {form.ambulatory && (
              <Grid item xs={12}>
                <Autocomplete
                  options={patientOptions}
                  getOptionLabel={(p) => `${p.name} ${p.lastname || ''} - CI: ${p.ci}`}
                  value={selectedPatient}
                  onChange={handlePatientSelect}
                  onInputChange={(_e, v) => handlePatientSearch(v)}
                  disabled={isFinalized}
                  renderInput={(params) => (
                    <TextField {...params} label="Buscar Paciente" placeholder="CI, nombre o apellido" variant="standard" />
                  )}
                  noOptionsText="Escriba al menos 2 caracteres"
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                />
              </Grid>
            )}

            <Grid item xs={6}>
              <TextField variant="standard" size="small" fullWidth type="date" label="Fecha de Cirugía" value={form.surgery_date}
                onChange={handleChange('surgery_date')} InputLabelProps={{ shrink: true }} required disabled={isFinalized} />
            </Grid>
            <Grid item xs={3}>
              <TextField variant="standard" size="small" fullWidth type="datetime-local" label="Inicio Programado"
                value={form.scheduled_start_time}
                onChange={handleChange('scheduled_start_time')} InputLabelProps={{ shrink: true }} disabled={isFinalized} />
            </Grid>
            <Grid item xs={3}>
              <TextField variant="standard" size="small" fullWidth type="datetime-local" label="Fin Programado"
                value={form.scheduled_end_time}
                onChange={handleChange('scheduled_end_time')} InputLabelProps={{ shrink: true }} disabled={isFinalized} />
            </Grid>

            {(statusIsActive || statusIsPast) && (
              <>
                <Grid item xs={6}>
                  <TextField variant="standard" size="small" fullWidth type="datetime-local" label="Inicio Real"
                    value={form.actual_start_time}
                    onChange={handleChange('actual_start_time')} InputLabelProps={{ shrink: true }} disabled={isFinalized} />
                </Grid>
                <Grid item xs={6}>
                  <TextField variant="standard" size="small" fullWidth type="datetime-local" label="Fin Real"
                    value={form.actual_end_time}
                    onChange={handleChange('actual_end_time')} InputLabelProps={{ shrink: true }} disabled={isFinalized} />
                </Grid>
              </>
            )}

            <Grid item xs={6}>
              <TextField select variant="standard" size="small" fullWidth label="Quirófano" value={form.area_id}
                onChange={handleChange('area_id')} disabled={isFinalized}>
                {areas.filter(a => a.room_type === 'quirofano').length > 0 ? (
                  areas.filter(a => a.room_type === 'quirofano').map(a =>
                    <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                  )
                ) : (
                  <MenuItem disabled value="">No hay quirófanos configurados</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select variant="standard" size="small" fullWidth label="Estado" value={form.status}
                onChange={handleChange('status')} disabled={isFinalized}>
                {EXTENDED_STATUS_OPTIONS.map(s => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField variant="standard" size="small" fullWidth label="Anestesiólogo" value={form.anesthesiologist}
                onChange={handleChange('anesthesiologist')} disabled={isFinalized} />
            </Grid>
            <Grid item xs={6}>
              <TextField select variant="standard" size="small" fullWidth label="Tipo de Anestesia" value={form.anesthesia_type}
                onChange={handleChange('anesthesia_type')} disabled={isFinalized}>
                {ANESTHESIA_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Notas y Evaluaciones</Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField variant="standard" size="small" fullWidth multiline rows={2} label="Descripción" value={form.description}
                onChange={handleChange('description')} disabled={isFinalized} />
            </Grid>
            <Grid item xs={12}>
              <TextField variant="standard" size="small" fullWidth multiline rows={3} label="Evaluación Pre-Anestésica"
                value={form.preanesthetic_evaluation} onChange={handleChange('preanesthetic_evaluation')} disabled={isFinalized} />
            </Grid>
            <Grid item xs={6}>
              <TextField variant="standard" size="small" fullWidth multiline rows={3} label="Notas Pre-Op"
                value={form.preop_notes} onChange={handleChange('preop_notes')} disabled={isFinalized} />
            </Grid>
            <Grid item xs={6}>
              <TextField variant="standard" size="small" fullWidth multiline rows={3} label="Notas Post-Op"
                value={form.postop_notes} onChange={handleChange('postop_notes')} disabled={isFinalized} />
            </Grid>
            <Grid item xs={12}>
              <TextField variant="standard" size="small" fullWidth multiline rows={3} label="Resultado"
                value={form.result} onChange={handleChange('result')} disabled={isFinalized} />
            </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">{isFinalized ? 'Cerrar' : 'Cancelar'}</Button>
        {!isFinalized && (
          <Button variant="outlined" color="success" onClick={handleSubmit}>Guardar</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
