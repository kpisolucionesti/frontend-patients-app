import { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Grid, Alert, Autocomplete
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { SURGERY_TYPES, STATUS_OPTIONS } from '../Hospitalizacion/SurgeriesTab';

const ANESTHESIA_TYPES = [
  'General', 'Regional', 'Local', 'Sedación', 'Bloqueo', 'Mixta'
];

export default function SurgeryPlanningModal({ open, onClose, onSaved, surgery }) {
  const [form, setForm] = useState({
    surgery_type: '', description: '', surgeon_name: '', patient_id: '',
    surgery_date: '', scheduled_start_time: '', scheduled_end_time: '',
    area_id: '', anesthesiologist: '', anesthesia_type: '',
    preanesthetic_evaluation: '', status: 'scheduled', hospitalization_id: ''
  });
  const [areas, setAreas] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    BackendAPI.areas.getAll().then(setAreas).catch(() => setError('Error al cargar quirófanos'));
    BackendAPI.doctors.getAll().then(setDoctors).catch(() => {});
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
        area_id: surgery.area_id || '',
        anesthesiologist: surgery.anesthesiologist || '',
        anesthesia_type: surgery.anesthesia_type || '',
        preanesthetic_evaluation: surgery.preanesthetic_evaluation || '',
        status: surgery.status || 'scheduled',
        hospitalization_id: surgery.hospitalization_id || ''
      });
    } else {
      setSelectedPatient(null);
      const today = new Date().toISOString().split('T')[0];
      setForm(prev => ({ ...prev, surgery_date: today }));
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
    try {
      if (surgery) {
        await BackendAPI.quirofano.update(surgery.id, form);
      } else {
        await BackendAPI.quirofano.create(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cirugía');
    }
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#00695c', color: 'white', fontWeight: 'bold' }}>{surgery ? 'Editar Cirugía' : 'Planificar Cirugía'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField select variant="standard" size="small" fullWidth label="Tipo de Cirugía" value={form.surgery_type}
              onChange={handleChange('surgery_type')} required>
              {SURGERY_TYPES.map(t => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField variant="standard" size="small" fullWidth label="Nombre del Cirujano" value={form.surgeon_name}
              onChange={handleChange('surgeon_name')} />
          </Grid>
          <Grid item xs={6}>
            <TextField variant="standard" size="small" fullWidth label="Anestesiólogo" value={form.anesthesiologist}
              onChange={handleChange('anesthesiologist')} />
          </Grid>
          <Grid item xs={6}>
            <TextField select variant="standard" size="small" fullWidth label="Tipo de Anestesia" value={form.anesthesia_type}
              onChange={handleChange('anesthesia_type')}>
              {ANESTHESIA_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField variant="standard" size="small" fullWidth type="date" label="Fecha de Cirugía" value={form.surgery_date}
              onChange={handleChange('surgery_date')} InputLabelProps={{ shrink: true }} required />
          </Grid>
          <Grid item xs={3}>
            <TextField variant="standard" size="small" fullWidth type="datetime-local" label="Inicio Programado"
              value={form.scheduled_start_time}
              onChange={handleChange('scheduled_start_time')} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={3}>
            <TextField variant="standard" size="small" fullWidth type="datetime-local" label="Fin Programado"
              value={form.scheduled_end_time}
              onChange={handleChange('scheduled_end_time')} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6}>
            <TextField select variant="standard" size="small" fullWidth label="Quirófano" value={form.area_id}
              onChange={handleChange('area_id')}>
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
              onChange={handleChange('status')}>
              {STATUS_OPTIONS.map(s => <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={patientOptions}
              getOptionLabel={(p) => `${p.name} ${p.lastname || ''} - CI: ${p.ci}`}
              value={selectedPatient}
              onChange={handlePatientSelect}
              onInputChange={(_e, v) => handlePatientSearch(v)}
              renderInput={(params) => (
                <TextField {...params} label="Buscar Paciente" placeholder="CI, nombre o apellido" variant="standard" />
              )}
              noOptionsText="Escriba al menos 2 caracteres"
              isOptionEqualToValue={(o, v) => o.id === v.id}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField variant="standard" size="small" fullWidth multiline rows={3} label="Descripción" value={form.description}
              onChange={handleChange('description')} />
          </Grid>
          <Grid item xs={12}>
            <TextField variant="standard" size="small" fullWidth multiline rows={4} label="Evaluación Pre-Anestésica"
              value={form.preanesthetic_evaluation} onChange={handleChange('preanesthetic_evaluation')} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button variant="outlined" color="success" onClick={handleSubmit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
