import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';

const STATUS_COLORS = {
  scheduled: { bg: '#e3f2fd', color: '#1565c0', label: 'Agendada' },
  confirmed: { bg: '#fff3e0', color: '#e65100', label: 'Confirmada' },
  in_consultation: { bg: '#e8f5e9', color: '#2e7d32', label: 'En consulta' },
  completed: { bg: '#f5f5f5', color: '#616161', label: 'Completada' },
  cancelled: { bg: '#fce4ec', color: '#c62828', label: 'Cancelada' },
  no_show: { bg: '#f3e5f5', color: '#7b1fa2', label: 'No asistió' },
};

const ClinicalRecordForm = ({ record, onSave, saving }) => {
  const [form, setForm] = useState({
    reason_for_consultation: record?.reason_for_consultation || '',
    current_illness: record?.current_illness || '',
    diagnostic: record?.diagnostic || '',
    treatment: record?.treatment || '',
    observations: record?.observations || '',
  });

  useEffect(() => {
    if (record) {
      setForm({
        reason_for_consultation: record.reason_for_consultation || '',
        current_illness: record.current_illness || '',
        diagnostic: record.diagnostic || '',
        treatment: record.treatment || '',
        observations: record.observations || '',
      });
    }
  }, [record]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      <TextField variant="standard" fullWidth label="Motivo de Consulta"
        value={form.reason_for_consultation}
        onChange={(e) => handleChange('reason_for_consultation', e.target.value)}
        multiline rows={2} />
      <TextField variant="standard" fullWidth label="Enfermedad Actual"
        value={form.current_illness}
        onChange={(e) => handleChange('current_illness', e.target.value)}
        multiline rows={3} />
      <TextField variant="standard" fullWidth label="Diagnóstico"
        value={form.diagnostic}
        onChange={(e) => handleChange('diagnostic', e.target.value)}
        multiline rows={2} />
      <TextField variant="standard" fullWidth label="Tratamiento"
        value={form.treatment}
        onChange={(e) => handleChange('treatment', e.target.value)}
        multiline rows={2} />
      <TextField variant="standard" fullWidth label="Observaciones"
        value={form.observations}
        onChange={(e) => handleChange('observations', e.target.value)}
        multiline rows={2} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" color="success" onClick={() => onSave(form)} disabled={saving}>
          {saving ? 'Guardando...' : record ? 'Actualizar Historia Clínica' : 'Guardar Historia Clínica'}
        </Button>
      </Box>
    </Box>
  );
};

const PatientHistorySummary = ({ patientId }) => {
  const [emergencies, setEmergencies] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [hospitalizations, setHospitalizations] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [antecedents, setAntecedents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([
      BackendAPI.emergencies.getAll({ patient_id: patientId }).catch(() => ({ data: [] })),
      BackendAPI.appointments.getAll({ patient_id: patientId }).catch(() => []),
      BackendAPI.hospitalizations.census().catch(() => []),
      BackendAPI.allergies.getAll(patientId).catch(() => []),
      BackendAPI.antecedents.getAll(patientId).catch(() => []),
    ]).then(([emergenciesRes, apps, census, aller, ant]) => {
      setEmergencies(emergenciesRes?.data || []);
      setAppointments(apps || []);
      const patientHosp = (census?.data || []).filter((h) => h.emergency?.patient?.id === patientId);
      setHospitalizations(patientHosp);
      setAllergies(aller || []);
      setAntecedents(ant || []);
    }).finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <CircularProgress sx={{ display: 'block', m: 'auto', p: 2 }} />;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Emergencias Previas</Typography>
      {emergencies.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Sin emergencias registradas</Typography>
      ) : (
        emergencies.slice(0, 5).map((e) => (
          <Box key={e.id} sx={{ p: 1, mb: 0.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight={600}>
              {moment(e.ingress_date).format('DD/MM/YYYY')} — {e.diagnostic || 'Sin diagnóstico'}
            </Typography>
          </Box>
        ))
      )}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Hospitalizaciones</Typography>
      {hospitalizations.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Sin hospitalizaciones</Typography>
      ) : (
        hospitalizations.slice(0, 5).map((h) => (
          <Box key={h.id} sx={{ p: 1, mb: 0.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight={600}>
              {h.admission_date} — {h.admission_diagnosis || 'Sin diagnóstico'} {h.status === 'active' ? '(Activa)' : '(Alta)'}
            </Typography>
          </Box>
        ))
      )}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Citas Anteriores</Typography>
      {appointments.filter((a) => a.status === 'completed').length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Sin citas previas</Typography>
      ) : (
        appointments.filter((a) => a.status === 'completed').slice(0, 5).map((a) => (
          <Box key={a.id} sx={{ p: 1, mb: 0.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight={600}>
              {a.appointment_date} — {a.doctor?.name || '?'} — {a.doctor?.specialty?.name || ''}
            </Typography>
          </Box>
        ))
      )}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Alergias</Typography>
      {allergies.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Sin alergias registradas</Typography>
      ) : (
        allergies.map((a) => (
          <Box key={a.id} sx={{ p: 1, mb: 0.5, bgcolor: '#fce4ec', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight={600}>{a.allergy}</Typography>
          </Box>
        ))
      )}

      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Antecedentes</Typography>
      {antecedents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Sin antecedentes registrados</Typography>
      ) : (
        antecedents.slice(0, 5).map((a) => (
          <Box key={a.id} sx={{ p: 1, mb: 0.5, bgcolor: '#fff3e0', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight={600}>{a.description || a.condition_type}</Typography>
          </Box>
        ))
      )}
    </Box>
  );
};

const AppointmentDetail = ({ open, appointmentId, onClose }) => {
  const [appointment, setAppointment] = useState(null);
  const [record, setRecord] = useState(null);
  const [tab, setTab] = useState('record');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!appointmentId) return;
    setLoading(true);
    try {
      const app = await BackendAPI.appointments.getById(appointmentId);
      setAppointment(app);
      const rec = await BackendAPI.appointmentRecords.getByAppointment(appointmentId);
      setRecord(rec);
    } catch {
      setAppointment(null);
    }
    setLoading(false);
  }, [appointmentId]);

  useEffect(() => { if (open) fetch(); }, [open, fetch]);

  const handleSaveRecord = async (formData) => {
    setSaving(true);
    try {
      if (record) {
        await BackendAPI.appointmentRecords.update(appointmentId, formData);
      } else {
        await BackendAPI.appointmentRecords.create(appointmentId, formData);
      }
      fetch();
    } catch (err) {
      alert('Error al guardar la historia clínica');
    }
    setSaving(false);
  };

  if (!appointment) {
    return (
      <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
        <DialogContent>{loading ? <CircularProgress /> : <Typography>No se encontró la cita</Typography>}</DialogContent>
        <DialogActions><Button onClick={onClose}>Cerrar</Button></DialogActions>
      </Dialog>
    );
  }

  const sc = STATUS_COLORS[appointment.status] || STATUS_COLORS.scheduled;

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
        CITA #{appointment.turn_number} — {appointment.patient?.name} {appointment.patient?.lastname}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600 }} />
          <Chip label={`Médico: ${appointment.doctor?.name || '?'}`} size="small" variant="outlined" />
          <Chip label={`Especialidad: ${appointment.specialty?.name || ''}`} size="small" variant="outlined" />
          <Chip label={`Fecha: ${appointment.appointment_date}`} size="small" variant="outlined" />
          <Chip label={`Hora: ${appointment.start_time?.substring(0, 5) || '--:--'}`} size="small" variant="outlined" />
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Historia Clínica" value="record" />
          <Tab label="Historial del Paciente" value="history" />
        </Tabs>

        {tab === 'record' && (
          appointment.status === 'completed' || appointment.status === 'in_consultation' ? (
            <ClinicalRecordForm record={record} onSave={handleSaveRecord} saving={saving} />
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              La consulta debe estar {appointment.status === 'scheduled' ? 'iniciada' : 'en curso'} para registrar la historia clínica.
            </Typography>
          )
        )}

        {tab === 'history' && (
          <PatientHistorySummary patientId={appointment.patient_id} />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetail;
