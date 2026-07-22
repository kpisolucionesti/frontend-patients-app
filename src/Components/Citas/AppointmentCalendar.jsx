import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, FormControl, IconButton, InputLabel,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { BackendAPI } from '../../services/BackendApi';
import { useDoctors } from '../../hooks/useApiData';
import moment from 'moment';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7);

const STATUS_COLORS = {
  scheduled: { bg: '#e3f2fd', color: '#1565c0' },
  confirmed: { bg: '#fff3e0', color: '#e65100' },
  in_consultation: { bg: '#e8f5e9', color: '#2e7d32' },
  completed: { bg: '#f5f5f5', color: '#616161' },
  cancelled: { bg: '#fce4ec', color: '#c62828' },
  no_show: { bg: '#f3e5f5', color: '#7b1fa2' },
};

const AppointmentCalendar = () => {
  const [weekStart, setWeekStart] = useState(moment().startOf('isoWeek'));
  const [appointments, setAppointments] = useState([]);
  const { data: doctors } = useDoctors();
  const [filterDoctor, setFilterDoctor] = useState('');
  const [loading, setLoading] = useState(true);
  const weekEnd = moment(weekStart).endOf('isoWeek');
  const days = Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, 'days'));

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        start_date: weekStart.format('YYYY-MM-DD'),
        end_date: weekEnd.format('YYYY-MM-DD'),
      };
      if (filterDoctor) params.doctor_id = filterDoctor;
      const apps = await BackendAPI.appointments.getAll(params);
      setAppointments(apps || []);
    } catch {
      setAppointments([]);
    }
    setLoading(false);
  }, [weekStart, weekEnd, filterDoctor]);

  useEffect(() => { fetch(); }, [fetch]);

  const getAppointments = (day, hour) => {
    const dayStr = day.format('YYYY-MM-DD');
    const hourStr = `${String(hour).padStart(2, '0')}:`;
    return (appointments || []).filter((a) => {
      if (a.appointment_date !== dayStr) return false;
      if (!a.start_time) return false;
      return a.start_time.startsWith(hourStr);
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => setWeekStart(moment(weekStart).subtract(1, 'week'))}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            {weekStart.format('DD MMM')} — {weekEnd.format('DD MMM YYYY')}
          </Typography>
          <IconButton onClick={() => setWeekStart(moment(weekStart).add(1, 'week'))}>
            <ChevronRight />
          </IconButton>
          <Button size="small" variant="outlined" onClick={() => setWeekStart(moment().startOf('isoWeek'))}>
            Hoy
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Médico</InputLabel>
            <Select value={filterDoctor} label="Médico" onChange={(e) => setFilterDoctor(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {(doctors || []).filter((d) => d.status === 'active').map((doc) => (
                <MenuItem key={doc.id} value={doc.id}>{doc.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Paper sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TableContainer sx={{ flex: 1 }}>
          <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, minWidth: 60, bgcolor: '#f5f7fa' }}>Hora</TableCell>
                {days.map((day) => (
                  <TableCell
                    key={day.format('YYYY-MM-DD')}
                    align="center"
                    sx={{
                      fontWeight: 700,
                      minWidth: 120,
                      bgcolor: day.isSame(moment(), 'day') ? '#e3f2fd' : '#f5f7fa',
                    }}
                  >
                    {day.format('dddd')}<br />
                    <Typography variant="caption">{day.format('DD/MM')}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {HOURS.map((hour) => (
                <TableRow key={hour}>
                  <TableCell sx={{ fontWeight: 600, color: '#666', borderRight: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
                    {String(hour).padStart(2, '0')}:00
                  </TableCell>
                  {days.map((day) => {
                    const apps = getAppointments(day, hour);
                    return (
                      <TableCell
                        key={day.format('YYYY-MM-DD') + '-' + hour}
                        align="center"
                        sx={{
                          p: 0.25,
                          height: 60,
                          verticalAlign: 'top',
                          bgcolor: day.isSame(moment(), 'day') ? '#fafbff' : 'white',
                          borderLeft: '1px solid #f0f0f0',
                        }}
                      >
                        {apps.length > 0 ? apps.map((app) => {
                          const sc = STATUS_COLORS[app.status] || STATUS_COLORS.scheduled;
                          return (
                            <Chip
                              key={app.id}
                              label={`#${app.turn_number} ${app.patient?.name || ''}`}
                              size="small"
                              sx={{
                                mb: 0.25,
                                width: '100%',
                                justifyContent: 'flex-start',
                                fontSize: '0.6rem',
                                height: 20,
                                bgcolor: sc.bg,
                                color: sc.color,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                              onClick={() => {}}
                            />
                          );
                        }) : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

    </Box>
  );
};

export default AppointmentCalendar;
