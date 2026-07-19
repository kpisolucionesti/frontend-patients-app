import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stepper, Step, StepLabel, TextField, FormControl,
  InputLabel, Select, MenuItem, Alert, Typography,
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';

const STEPS = ['Paciente', 'Cita', 'Confirmación'];

const NewAppointmentModal = ({ open, onClose, onSaved, doctors: doctorsProp }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [searchCi, setSearchCi] = useState('');
  const [foundPatient, setFoundPatient] = useState(null);
  const [patientForm, setPatientForm] = useState({ ci: '', name: '', lastname: '', gender: '', birthday: '' });

  const [doctors, setDoctors] = useState(doctorsProp || []);
  const [specialties, setSpecialties] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointment, setAppointment] = useState({
    doctor_id: null,
    specialty_id: null,
    appointment_date: moment().format('YYYY-MM-DD'),
    start_time: '',
    notes: '',
  });

  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    setSearchCi('');
    setFoundPatient(null);
    setPatientForm({ ci: '', name: '', lastname: '', gender: '', birthday: '' });
    setAppointment({ doctor_id: null, specialty_id: null, appointment_date: moment().format('YYYY-MM-DD'), start_time: '', notes: '' });
    setAvailableSlots([]);
    setError(null);
    BackendAPI.specialties.getAll().then(setSpecialties).catch(() => {});
    if (!doctorsProp) {
      BackendAPI.doctors.getAll().then(setDoctors).catch(() => {});
    }
  }, [open, doctorsProp]);

  useEffect(() => {
    if (!appointment.doctor_id || !appointment.appointment_date) return;
    BackendAPI.appointments.availableSlots(appointment.doctor_id, appointment.appointment_date)
      .then(setAvailableSlots)
      .catch(() => setAvailableSlots([]));
  }, [appointment.doctor_id, appointment.appointment_date]);

  const handleSearchCi = async () => {
    setError(null);
    try {
      const res = await BackendAPI.patients.findByCi(searchCi);
      if (res) {
        setFoundPatient(res);
        setPatientForm({ ci: res.ci || '', name: res.name || '', lastname: res.lastname || '', gender: res.gender || '', birthday: res.birthday || '' });
      } else {
        setFoundPatient(null);
        setPatientForm({ ci: searchCi, name: '', lastname: '', gender: '', birthday: '' });
      }
    } catch {
      setError('Error al buscar paciente');
    }
  };

  const handleAppointmentChange = (field, value) => {
    setAppointment((prev) => ({ ...prev, [field]: value }));
    if (field === 'doctor_id') {
      const doc = doctors.find((d) => d.id === value);
      if (doc?.specialty?.id) setAppointment((prev) => ({ ...prev, specialty_id: doc.specialty.id }));
    }
  };

  const canGoNext = () => {
    if (activeStep === 0) {
      if (!foundPatient) return patientForm.name && patientForm.lastname && patientForm.gender;
      return !!foundPatient;
    }
    if (activeStep === 1) return appointment.doctor_id && appointment.start_time;
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && searchCi && !foundPatient && !patientForm.name) {
      handleSearchCi();
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      let patientId = foundPatient?.id;
      if (!patientId) {
        const newPatient = await BackendAPI.patients.create(patientForm);
        patientId = newPatient.id;
      }
      await BackendAPI.appointments.create({ ...appointment, patient_id: patientId });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear cita');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setSearchCi('');
    setFoundPatient(null);
    setPatientForm({ ci: '', name: '', lastname: '', gender: '', birthday: '' });
    setAppointment({ doctor_id: null, specialty_id: null, appointment_date: moment().format('YYYY-MM-DD'), start_time: '', notes: '' });
    setAvailableSlots([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
        NUEVA CITA
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        {activeStep === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2">Buscar paciente por CI</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size="small" label="CI" value={searchCi} onChange={(e) => setSearchCi(e.target.value)} sx={{ flex: 1 }} />
              <Button variant="outlined" onClick={handleSearchCi}>Buscar</Button>
            </Box>
            {foundPatient && (
              <Alert severity="success">Paciente encontrado: {foundPatient.name} {foundPatient.lastname}</Alert>
            )}
            <Typography variant="caption" color="text.secondary">
              {foundPatient ? 'Paciente seleccionado. Continúe al siguiente paso.' : 'Si no se encuentra, complete los datos para crear un nuevo paciente.'}
            </Typography>
            {!foundPatient && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField size="small" label="Nombre" value={patientForm.name} onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })} required />
                <TextField size="small" label="Apellido" value={patientForm.lastname} onChange={(e) => setPatientForm({ ...patientForm, lastname: e.target.value })} required />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Género</InputLabel>
                    <Select value={patientForm.gender} onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })} label="Género" required>
                      <MenuItem value="M">Masculino</MenuItem>
                      <MenuItem value="F">Femenino</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField size="small" label="Fecha de Nacimiento" type="date" value={patientForm.birthday}
                    onChange={(e) => setPatientForm({ ...patientForm, birthday: e.target.value })}
                    InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                </Box>
              </Box>
            )}
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2">Datos de la Cita</Typography>
            <FormControl fullWidth>
              <InputLabel>Médico</InputLabel>
              <Select
                size="small"
                value={appointment.doctor_id || ''}
                label="Médico"
                onChange={(e) => handleAppointmentChange('doctor_id', e.target.value)}
                required
              >
                {(doctors || []).filter((d) => d.status === 'active').map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialty?.name || ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Especialidad</InputLabel>
              <Select
                size="small"
                value={appointment.specialty_id || ''}
                label="Especialidad"
                onChange={(e) => handleAppointmentChange('specialty_id', e.target.value)}
              >
                {(specialties || []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              fullWidth
              label="Fecha"
              type="date"
              value={appointment.appointment_date}
              onChange={(e) => handleAppointmentChange('appointment_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            {availableSlots.length > 0 ? (
              <FormControl fullWidth>
                <InputLabel>Horario</InputLabel>
                <Select
                  size="small"
                  value={appointment.start_time}
                  label="Horario"
                  onChange={(e) => handleAppointmentChange('start_time', e.target.value)}
                  required
                >
                  {availableSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>{slot}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                size="small"
                fullWidth
                label="Horario (HH:MM)"
                value={appointment.start_time}
                onChange={(e) => handleAppointmentChange('start_time', e.target.value)}
                placeholder="08:00"
                disabled={!!appointment.doctor_id && !!appointment.appointment_date}
                helperText={appointment.doctor_id && appointment.appointment_date ? 'No hay slots disponibles para este médico y fecha' : ''}
              />
            )}
            <TextField
              size="small"
              fullWidth
              label="Notas"
              value={appointment.notes}
              onChange={(e) => handleAppointmentChange('notes', e.target.value)}
              multiline rows={2}
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="subtitle2">Confirmar Cita</Typography>
            <Alert severity="info">
              <strong>Paciente:</strong> {foundPatient ? `${foundPatient.name} ${foundPatient.lastname}` : `${patientForm.name} ${patientForm.lastname}`}
              {patientForm.ci && <> — CI: {patientForm.ci}</>}
              <br />
              <strong>Médico:</strong> {doctors.find((d) => d.id === appointment.doctor_id)?.name || ''}
              <br />
              <strong>Especialidad:</strong> {specialties.find((s) => s.id === appointment.specialty_id)?.name || ''}
              <br />
              <strong>Fecha:</strong> {moment(appointment.appointment_date).format('DD/MM/YYYY')}
              <br />
              <strong>Horario:</strong> {appointment.start_time}
              {appointment.notes && <><br /><strong>Notas:</strong> {appointment.notes}</>}
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined">Cancelar</Button>
        {activeStep < STEPS.length - 1 ? (
          <Button variant="contained" onClick={handleNext} disabled={!canGoNext()}>
            Siguiente
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cita'}
          </Button>
        )}
        {activeStep > 0 && activeStep < STEPS.length - 1 && (
          <Button onClick={handleBack} variant="outlined">Atrás</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NewAppointmentModal;
