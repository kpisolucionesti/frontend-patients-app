import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SectionSidebar from '../Commons/SectionSidebar';
import AppointmentCalendar from './AppointmentCalendar';
import TodayAppointments from './TodayAppointments';
import NewAppointmentModal from './NewAppointmentModal';

const SECTIONS = [
  { key: 'hoy', label: 'Hoy', icon: <TodayIcon /> },
  { key: 'calendario', label: 'Calendario', icon: <CalendarMonthIcon /> },
];

const AppointmentsLayout = () => {
  const [selected, setSelected] = useState('hoy');
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNewAppointment = useCallback(() => setNewAppointmentOpen(true), []);
  const handleCloseNewAppointment = useCallback(() => setNewAppointmentOpen(false), []);
  const handleAppointmentSaved = useCallback(() => {
    setNewAppointmentOpen(false);
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', gap: 0 }}>
      <SectionSidebar
        sections={SECTIONS}
        activeSection={selected}
        onSectionChange={setSelected}
        collapsible
        extraAction={{ label: 'Nueva Cita', icon: <AddCircleIcon />, onClick: handleNewAppointment }}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f0f4ff' }}>
        {selected === 'hoy' ? <TodayAppointments key={refreshKey} /> : <AppointmentCalendar key={refreshKey} />}
      </Box>
      <NewAppointmentModal open={newAppointmentOpen} onClose={handleCloseNewAppointment} onSaved={handleAppointmentSaved} />
    </Box>
  );
};

export default AppointmentsLayout;
