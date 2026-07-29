import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { BackendAPI } from '../../services/BackendApi';

const POLL_INTERVAL = 3000;

const DoctorColumn = ({ doctorData }) => {
  if (!doctorData) return null;
  const { current, waiting } = doctorData;

  return (
    <Box
      sx={{
        flex: '1 1 300px',
        minWidth: 280,
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        borderTop: 4,
        borderColor: 'primary.main',
      }}
    >
      <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
        {doctorData.doctor.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        {doctorData.doctor.specialty}
      </Typography>

      {current ? (
        <Box
          sx={{
            bgcolor: '#e8f5e9',
            borderRadius: 2,
            p: 2,
            mb: 2,
            border: '2px solid #2e7d32',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': { '0%': { boxShadow: '0 0 0 0 rgba(46,125,50,0.4)' }, '70%': { boxShadow: '0 0 0 10px rgba(46,125,50,0)' }, '100%': { boxShadow: '0 0 0 0 rgba(46,125,50,0)' } },
          }}
        >
          <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
            ATENDIENDO
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ color: '#1b5e20', lineHeight: 1.2 }}>
            {String(current.turn_number).padStart(3, '0')}
          </Typography>
          <Typography variant="h5" fontWeight={600} sx={{ color: '#2e7d32' }}>
            {current.patient_name}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 2, mb: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">Esperando pacientes...</Typography>
        </Box>
      )}

      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: '#666' }}>
        SIGUIENTES
      </Typography>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {waiting && waiting.length > 0 ? (
          waiting.slice(0, 5).map((w) => (
            <Box
              key={w.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1,
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <Chip
                label={String(w.turn_number).padStart(3, '0')}
                size="small"
                color={w.patients_ahead === 0 ? 'warning' : 'default'}
                variant={w.patients_ahead === 0 ? 'filled' : 'outlined'}
              />
              <Typography variant="body1" fontWeight={w.patients_ahead === 0 ? 600 : 400}>
                {w.patient_name}
              </Typography>
              {w.patients_ahead === 0 && (
                <Chip label="Siguiente" size="small" color="warning" sx={{ ml: 'auto' }} />
              )}
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">Sin pacientes en espera</Typography>
        )}
      </Box>
    </Box>
  );
};

const AppointmentDisplayScreen = () => {
  useDocumentTitle('Pantalla TV');
  const { displayId } = useParams();
  const [queue, setQueue] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const prevCurrentIds = useRef(new Set());
  const audioCtxRef = useRef(null);

  const playBeep = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // audio not supported
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    if (!displayId) return;
    try {
      const data = await BackendAPI.appointmentDisplays.getQueue(displayId);
      const doctors = data.queue || [];
      setDisplayName(data.display?.name || '');
      setQueue(doctors);

      const currentIds = new Set(
        doctors.filter((d) => d.current).map((d) => `${d.doctor.id}-${d.current.id}`)
      );
      if (prevCurrentIds.current.size > 0) {
        const newCalls = [...currentIds].filter((id) => !prevCurrentIds.current.has(id));
        if (newCalls.length > 0) {
          playBeep();
        }
      }
      prevCurrentIds.current = currentIds;
    } catch {
      // ignore
    }
  }, [displayId, playBeep]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  if (!queue) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <Typography variant="h4">Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: 'background.default',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: 'primary.dark' }}>
          {displayName || 'SALA DE ESPERA'}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 3, alignContent: 'flex-start', justifyContent: 'center', overflow: 'auto' }}>
        {queue.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Typography variant="h4" color="text.secondary">
              No hay consultas activas en este momento
            </Typography>
          </Box>
        ) : (
          queue.map((d) => <DoctorColumn key={d.doctor.id} doctorData={d} />)
        )}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Los turnos se asignan por orden de llegada — Tome asiento y espere su turno
        </Typography>
      </Box>
    </Box>
  );
};

export default AppointmentDisplayScreen;
