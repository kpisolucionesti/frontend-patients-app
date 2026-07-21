import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Button, Alert, CircularProgress
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const STATUS_COLORS = {
  scheduled: { bg: '#e3f2fd', color: '#1565c0' },
  in_progress: { bg: '#fff3e0', color: '#e65100' },
  completed: { bg: '#e8f5e9', color: '#2e7d32' },
  cancelled: { bg: '#f5f5f5', color: '#9e9e9e' },
};

export default function WeeklySchedule({ onSelectSurgery, onEditSurgery }) {
  const [weekStart, setWeekStart] = useState(moment().startOf('isoWeek'));
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const weekStartStr = weekStart.format('YYYY-MM-DD');
  const weekEndStr = useMemo(() => moment(weekStart).endOf('isoWeek').format('YYYY-MM-DD'), [weekStart]);
  const weekEnd = useMemo(() => moment(weekStart).endOf('isoWeek'), [weekStart]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, 'days')), [weekStart]);

  const loadWeek = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BackendAPI.quirofano.getWeekly(weekStartStr, weekEndStr);
      setSchedule(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar la programación semanal');
      setSchedule(null);
    }
    setLoading(false);
  }, [weekStartStr, weekEndStr]);

  useEffect(() => { loadWeek(); }, [loadWeek]);

  const getSurgeries = (day, hour) => {
    if (!schedule?.surgeries) return [];
    const dayStr = day.format('YYYY-MM-DD');
    return schedule.surgeries.filter(s => {
      if (!s.scheduled_start_time) return false;
      const sMoment = moment(s.scheduled_start_time);
      return sMoment.format('YYYY-MM-DD') === dayStr && sMoment.hour() === hour;
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setWeekStart(moment(weekStart).subtract(1, 'week'))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={600}>
            {weekStart.format('DD MMM')} — {weekEnd.format('DD MMM YYYY')}
          </Typography>
          <IconButton onClick={() => setWeekStart(moment(weekStart).add(1, 'week'))}>
            <ChevronRightIcon />
          </IconButton>
          <Button size="small" variant="outlined" onClick={() => setWeekStart(moment().startOf('isoWeek'))}>
            Hoy
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && schedule && (
        <Paper sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flex: 1, maxHeight: 'calc(100vh - 280px)' }}>
            <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700, minWidth: 60, bgcolor: '#f5f7fa',
                      position: 'sticky', left: 0, zIndex: 3
                    }}
                  >
                    Hora
                  </TableCell>
                  {days.map((day) => {
                    const isToday = day.isSame(moment(), 'day');
                    return (
                      <TableCell
                        key={day.format('YYYY-MM-DD')}
                        align="center"
                        sx={{
                          fontWeight: 700, minWidth: 130,
                          bgcolor: isToday ? '#e3f2fd' : '#f5f7fa',
                        }}
                      >
                        {DAYS[day.isoWeekday() - 1]}<br />
                        <Typography variant="caption">{day.format('DD/MM')}</Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {HOURS.map((hour) => (
                  <TableRow key={hour}>
                    <TableCell
                      sx={{
                        fontWeight: 600, color: '#666',
                        borderRight: '1px solid #e0e0e0', bgcolor: '#fafafa',
                        position: 'sticky', left: 0, zIndex: 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {String(hour).padStart(2, '0')}:00
                    </TableCell>
                    {days.map((day) => {
                      const surgeries = getSurgeries(day, hour);
                      const isToday = day.isSame(moment(), 'day');
                      return (
                        <TableCell
                          key={day.format('YYYY-MM-DD') + '-' + hour}
                          sx={{
                            p: 0.25, height: 48, verticalAlign: 'top',
                            bgcolor: isToday ? '#fafbff' : 'white',
                            borderLeft: '1px solid #f0f0f0',
                          }}
                        >
                          {surgeries.map((s) => {
                            const isFinalized = s.status === 'completed' || s.status === 'cancelled';
                            const sc = STATUS_COLORS[s.status] || STATUS_COLORS.scheduled;
                            const timeStr = moment(s.scheduled_start_time).format('HH:mm');
                            const endTimeStr = s.scheduled_end_time
                              ? moment(s.scheduled_end_time).format('HH:mm')
                              : null;
                            return (
                              <Chip
                                key={s.id}
                                label={
                                  <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem' }}>
                                      {timeStr}{endTimeStr ? `-${endTimeStr}` : ''} | {s.surgery_type}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.55rem' }}>
                                      {s.patient?.name} {s.patient?.lastname}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.55rem' }}>
                                      {s.area?.name || 'S/Q'} | {s.surgeon_name || 'S/C'}
                                    </Typography>
                                  </Box>
                                }
                                size="small"
                                sx={{
                                  mb: 0.25, width: '100%', height: 'auto', py: 0.5,
                                  bgcolor: sc.bg, color: sc.color, fontWeight: 600,
                                  cursor: isFinalized ? 'default' : 'pointer',
                                  opacity: s.status === 'cancelled' ? 0.5 : 1,
                                  '& .MuiChip-label': { display: 'block', whiteSpace: 'normal', p: 0.5 },
                                }}
                                onClick={() => !isFinalized && onSelectSurgery?.(s)}
                                onDelete={onEditSurgery && !isFinalized ? (e) => { e.stopPropagation(); onEditSurgery(s); } : undefined}
                                deleteIcon={onEditSurgery && !isFinalized ? <EditIcon sx={{ fontSize: 12, color: sc.color }} /> : undefined}
                              />
                            );
                          })}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {!loading && !error && schedule && schedule.surgeries?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No hay cirugías programadas para esta semana
          </Typography>
        </Box>
      )}
    </Box>
  );
}
