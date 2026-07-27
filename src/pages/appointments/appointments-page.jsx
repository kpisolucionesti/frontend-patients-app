import React, { useState, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AppointmentCalendar from '../../Components/Citas/AppointmentCalendar';
import TodayAppointments from '../../Components/Citas/TodayAppointments';
import NewAppointmentModal from '../../Components/Citas/NewAppointmentModal';

const AppointmentsLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'hoy';
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewAppointment = useCallback(() => setNewAppointmentOpen(true), []);
  const handleCloseNewAppointment = useCallback(() => setNewAppointmentOpen(false), []);
  const handleAppointmentSaved = useCallback(() => {
    setNewAppointmentOpen(false);
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f0f4ff' }}>
      <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '1rem' }}>
          Citas
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={handleNewAppointment}
          sx={{ fontSize: '0.8rem' }}
        >
          Nueva Cita
        </Button>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {tab === 'hoy' ? <TodayAppointments key={refreshKey} /> : <AppointmentCalendar key={refreshKey} />}
      </Box>
      <NewAppointmentModal open={newAppointmentOpen} onClose={handleCloseNewAppointment} onSaved={handleAppointmentSaved} />
    </Box>
  );
};

export default AppointmentsLayout;
