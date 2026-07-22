import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Typography
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useDoctors } from '../../hooks/useApiData';
import moment from 'moment';
import AppointmentDetail from './AppointmentDetail';

const STATUS_COLORS = {
  scheduled: { bg: '#e3f2fd', color: '#1565c0', label: 'Agendada' },
  confirmed: { bg: '#fff3e0', color: '#e65100', label: 'Confirmada' },
  in_consultation: { bg: '#e8f5e9', color: '#2e7d32', label: 'En consulta' },
  completed: { bg: '#f5f5f5', color: '#616161', label: 'Completada' },
  cancelled: { bg: '#fce4ec', color: '#c62828', label: 'Cancelada' },
  no_show: { bg: '#f3e5f5', color: '#7b1fa2', label: 'No asistió' },
};

const TodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const { data: doctors } = useDoctors();
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const apps = await BackendAPI.appointments.getAll({ date: moment().format('YYYY-MM-DD') });
      setAppointments(apps || []);
    } catch {
      setAppointments([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCallPatient = async (app) => {
    try {
      await BackendAPI.appointments.update(app.id, { status: 'in_consultation' });
      fetch();
    } catch {
      alert('Error al llamar paciente');
    }
  };

  const handleComplete = async (app) => {
    setSelectedAppointment(app);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.9rem' }}>
          Citas de Hoy — {moment().format('DD/MM/YYYY')}
        </Typography>
      </Box>

      {appointments.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Typography color="text.secondary">No hay citas para hoy</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexWrap: 'wrap', gap: 2, alignContent: 'flex-start' }}>
          {appointments.map((app) => {
            const sc = STATUS_COLORS[app.status] || STATUS_COLORS.scheduled;
            return (
              <Card key={app.id} sx={{ width: 320, borderLeft: 4, borderColor: sc.color }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Chip label={`Turno #${app.turn_number}`} size="small" color="primary" variant="outlined" />
                    <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600 }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {app.patient?.name} {app.patient?.lastname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {app.start_time?.substring(0, 5) || '--:--'} — {app.doctor?.name || 'Sin médico'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {app.status === 'scheduled' && (
                      <Button size="small" variant="contained" onClick={() => handleCallPatient(app)}>
                        Llamar Paciente
                      </Button>
                    )}
                    {app.status === 'in_consultation' && (
                      <Button size="small" variant="contained" color="success" onClick={() => handleComplete(app)}>
                        Finalizar Consulta
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {selectedAppointment && (
        <AppointmentDetail
          open={!!selectedAppointment}
          appointmentId={selectedAppointment.id}
          onClose={() => { setSelectedAppointment(null); fetch(); }}
        />
      )}
    </Box>
  );
};

export default TodayAppointments;
