import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, IconButton
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import { BackendAPI } from '../../services/BackendApi';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function WeeklySchedule({ onSelectSurgery, onEditSurgery }) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d;
  });
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const dateStr = startDate.toISOString().split('T')[0];

  const loadWeek = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BackendAPI.quirofano.getWeekly(dateStr);
      setSchedule(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [dateStr]);

  useEffect(() => { loadWeek(); }, [loadWeek]);

  const changeWeek = (delta) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + delta * 7);
    setStartDate(d);
  };

  const getSurgeriesForDay = (dateStr) => {
    if (!schedule?.surgeries) return [];
    return schedule.surgeries.filter(s => {
      const sDate = new Date(s.surgery_date).toISOString().split('T')[0];
      return sDate === dateStr;
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => changeWeek(-1)}><ChevronLeftIcon /></IconButton>
        <Typography>
          {startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(startDate.getTime() + 6 * 86400000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton onClick={() => changeWeek(1)}><ChevronRightIcon /></IconButton>
      </Box>
      <Grid container spacing={1}>
        {Array.from({ length: 7 }, (_, i) => {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];
          const daySurgeries = getSurgeriesForDay(dateStr);

          return (
            <Grid item xs key={i}>
              <Paper sx={{ p: 1, minHeight: 200, bgcolor: daySurgeries.length > 0 ? 'action.hover' : undefined }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                  {DAYS[d.getDay()]}
                  <br />
                  {d.getDate()}
                </Typography>
                {daySurgeries.map(s => (
                  <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Chip
                      label={`${s.surgery_type}${s.scheduled_start_time ? ' ' + new Date(s.scheduled_start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}${s.ambulatory ? ' (Amb)' : ''}`}
                      size="small"
                      color={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'warning' : s.status === 'cancelled' ? 'default' : 'primary'}
                      onClick={() => onSelectSurgery?.(s)}
                      sx={{ flex: 1, cursor: 'pointer' }}
                    />
                    {onEditSurgery && (
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onEditSurgery(s); }}
                        sx={{ p: 0.3 }}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
