import { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';

const PatientAppointmentsSummary = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!patientId) return;
    BackendAPI.appointments.getAll({ patient_id: patientId })
      .then((data) => setAppointments(data || []))
      .catch(() => setAppointments([]));
  }, [patientId]);

  const upcoming = appointments
    .filter((a) => a.status === 'scheduled' || a.status === 'confirmed')
    .sort((a, b) => a.appointment_date?.localeCompare(b.appointment_date))
    .slice(0, 3);

  const past = appointments
    .filter((a) => a.status === 'completed')
    .sort((a, b) => b.appointment_date?.localeCompare(a.appointment_date))
    .slice(0, 3);

  if (appointments.length === 0) return null;

  return (
    <Paper sx={{ p: 1.5, borderTop: 1, borderColor: 'primary.main' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <CalendarMonthIcon sx={{ fontSize: 18, color: '#1565c0' }} />
        <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0', fontSize: '0.8rem' }}>
          CITAS MÉDICAS
        </Typography>
      </Box>

      {upcoming.length > 0 && (
        <>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#e65100', fontSize: '0.65rem' }}>PRÓXIMAS</Typography>
          {upcoming.map((a) => (
            <Box key={a.id} sx={{ p: 0.5, mb: 0.25, bgcolor: '#fff3e0', borderRadius: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                {a.appointment_date} {a.start_time?.substring(0, 5)} — {a.doctor?.name} ({a.doctor?.specialty?.name || ''})
              </Typography>
            </Box>
          ))}
        </>
      )}

      {past.length > 0 && (
        <>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#666', fontSize: '0.65rem', mt: 1, display: 'block' }}>ANTERIORES</Typography>
          {past.map((a) => (
            <Box key={a.id} sx={{ p: 0.5, mb: 0.25, bgcolor: '#f5f5f5', borderRadius: 0.5 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                {a.appointment_date} — {a.doctor?.name} ({a.doctor?.specialty?.name || ''})
              </Typography>
            </Box>
          ))}
        </>
      )}
    </Paper>
  );
};

export default PatientAppointmentsSummary;
