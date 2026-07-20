import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, IconButton
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { BackendAPI } from '../../services/BackendApi';

export default function ScheduleBoard({ onSelectSurgery }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const dateStr = currentDate.toISOString().split('T')[0];

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BackendAPI.quirofano.getSchedule(dateStr);
      setSchedule(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [dateStr]);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  const changeDate = (delta) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + delta);
    setCurrentDate(d);
  };

  const statusColor = {
    scheduled: 'primary',
    completed: 'success',
    cancelled: 'default'
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => changeDate(-1)}><ChevronLeftIcon /></IconButton>
        <Typography variant="h6">
          {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>
        <IconButton onClick={() => changeDate(1)}><ChevronRightIcon /></IconButton>
      </Box>

      {loading ? (
        <Typography>Cargando...</Typography>
      ) : schedule ? (
        <Grid container spacing={2}>
          {schedule.areas?.length > 0 ? (
            schedule.areas.map(area => (
              <Grid item xs={12} md={6} lg={4} key={area.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{area.name}</Typography>
                  {schedule.surgeries
                    .filter(s => s.area?.id === area.id)
                    .map(s => (
                      <Paper
                        key={s.id}
                        variant="outlined"
                        sx={{ p: 1, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => onSelectSurgery(s)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {s.surgery_type}
                          </Typography>
                          <Chip label={s.status} size="small" color={statusColor[s.status] || 'default'} />
                        </Box>
                        <Typography variant="caption" display="block">
                          {s.patient?.name} {s.patient?.lastname}
                        </Typography>
                        {s.scheduled_start_time && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(s.scheduled_start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            {s.scheduled_end_time ? ` - ${new Date(s.scheduled_end_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : ''}
                          </Typography>
                        )}
                        <Typography variant="caption" display="block" color="text.secondary">
                          Cirujano: {s.surgeon_name || 'No asignado'}
                        </Typography>
                      </Paper>
                    ))}
                  {schedule.surgeries.filter(s => s.area?.id === area.id).length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Sin cirugías programadas
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary">
                No hay quirófanos configurados. Configure áreas con tipo "Quirófano" en Configuraciones.
              </Typography>
            </Grid>
          )}
        </Grid>
      ) : null}
    </Box>
  );
}
