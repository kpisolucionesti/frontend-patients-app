import React, { useState, useCallback } from 'react';
import { Box, Button } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AppointmentCalendar from './AppointmentCalendar';
import TodayAppointments from './TodayAppointments';
import NewAppointmentModal from './NewAppointmentModal';

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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircleIcon />}
          onClick={handleNewAppointment}
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
