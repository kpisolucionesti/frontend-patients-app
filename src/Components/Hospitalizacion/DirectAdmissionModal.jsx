import { useState, useEffect } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stepper, Step, StepLabel,
  TextField, Typography, Autocomplete, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const STEPS = ['Paciente', 'Datos de Ingreso', 'Asignación'];

const DirectAdmissionModal = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [searchCi, setSearchCi] = useState('');
  const [foundPatient, setFoundPatient] = useState(null);
  const [patientForm, setPatientForm] = useState({ ci: '', name: '', lastname: '', gender: '', birthday: '' });
  const [emergencyForm, setEmergencyForm] = useState({
    diagnostic: '', treatment: '', classification: '',
    reason_for_consultation: '', current_illness: '', admission_note: '',
  });
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');

  useEffect(() => {
    if (!open) return;
    BackendAPI.doctors.getAll().then((d) => setDoctors(d || [])).catch(() => {});
    BackendAPI.rooms.getAll().then((r) => setRooms((r || []).filter((rm) => !rm.patient_id))).catch(() => {});
  }, [open]);

  const handleSearchCi = async () => {
    setError(null);
    try {
      const res = await BackendAPI.patients.findByCi(searchCi);
      if (res) {
        if (res.disabled) {
          setError('El paciente ha fallecido');
          return;
        }
        const hasActive = await BackendAPI.emergencies.getAll({ patient_id: res.id, status: '1,3' });
        if ((hasActive.data || []).length > 0) {
          setError('El paciente ya tiene una emergencia activa');
          return;
        }
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

  const canGoNext = () => {
    if (activeStep === 0) {
      if (!foundPatient) {
        return patientForm.name && patientForm.lastname && patientForm.gender;
      }
      return !!foundPatient;
    }
    if (activeStep === 1) {
      return emergencyForm.diagnostic && emergencyForm.treatment && emergencyForm.classification
        && emergencyForm.reason_for_consultation && emergencyForm.current_illness && selectedDoctor;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && !foundPatient && patientForm.ci && !patientForm.name) {
      handleSearchCi();
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        patient: foundPatient ? undefined : patientForm,
        patient_id: foundPatient?.id,
        emergency: emergencyForm,
        doctors: [{ id: selectedDoctor.id }],
        hospitalization: {
          room_id: selectedRoom || null,
          attending_doctor_id: selectedDoctor.id,
          admission_diagnosis: emergencyForm.diagnostic,
        },
      };
      await BackendAPI.directAdmissions.create(payload);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear ingreso directo');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setSearchCi('');
    setFoundPatient(null);
    setPatientForm({ ci: '', name: '', lastname: '', gender: '', birthday: '' });
    setEmergencyForm({ diagnostic: '', treatment: '', classification: '', reason_for_consultation: '', current_illness: '', admission_note: '' });
    setSelectedDoctor(null);
    setSelectedRoom('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1565c0', color: 'white', fontSize: '0.9rem', fontWeight: 700 }}>
        Nuevo Ingreso Directo a Hospitalización
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
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
                  <TextField size="small" label="Fecha de Nacimiento" type="date" value={patientForm.birthday} onChange={(e) => setPatientForm({ ...patientForm, birthday: e.target.value })}
                    InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                </Box>
              </Box>
            )}
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="subtitle2">Datos Clínicos de Ingreso</Typography>
            <TextField size="small" label="Diagnóstico" value={emergencyForm.diagnostic} onChange={(e) => setEmergencyForm({ ...emergencyForm, diagnostic: e.target.value })} required multiline rows={2} />
            <TextField size="small" label="Plan / Tratamiento" value={emergencyForm.treatment} onChange={(e) => setEmergencyForm({ ...emergencyForm, treatment: e.target.value })} required multiline rows={2} />
            <TextField size="small" label="Clasificación" value={emergencyForm.classification} onChange={(e) => setEmergencyForm({ ...emergencyForm, classification: e.target.value })} required />
            <TextField size="small" label="Motivo de Consulta" value={emergencyForm.reason_for_consultation} onChange={(e) => setEmergencyForm({ ...emergencyForm, reason_for_consultation: e.target.value })} required multiline rows={2} />
            <TextField size="small" label="Enfermedad Actual" value={emergencyForm.current_illness} onChange={(e) => setEmergencyForm({ ...emergencyForm, current_illness: e.target.value })} required multiline rows={2} />
            <TextField size="small" label="Nota de Ingreso (opcional)" value={emergencyForm.admission_note} onChange={(e) => setEmergencyForm({ ...emergencyForm, admission_note: e.target.value })} multiline rows={2} />
            <Autocomplete
              size="small"
              options={doctors}
              getOptionLabel={(opt) => opt.name}
              value={selectedDoctor}
              onChange={(_e, v) => setSelectedDoctor(v)}
              renderInput={(params) => <TextField {...params} label="Médico de Cabecera" required />}
              disableClearable
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2">Asignación de Cama</Typography>
            <FormControl size="small" fullWidth>
              <InputLabel>Cama</InputLabel>
              <Select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} label="Cama">
                <MenuItem value=""><em>Sin asignar</em></MenuItem>
                {rooms.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name} {r.area_name ? `(${r.area_name})` : ''}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert severity="info">
              Se creará una emergencia con estado "Ingresado" y se asignará a la cama seleccionada.
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
            {saving ? <CircularProgress size={20} /> : 'Confirmar Ingreso'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DirectAdmissionModal;
