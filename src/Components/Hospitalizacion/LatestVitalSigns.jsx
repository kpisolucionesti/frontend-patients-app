import { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { BackendAPI } from '../../services/BackendApi';
import { usePolling } from '../../hooks/usePolling';

const POLL_INTERVAL = 10000;

const LatestVitalSigns = ({ emergencyId }) => {
  const [vitalSigns, setVitalSigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVitalSigns = useCallback(async () => {
    if (!emergencyId) return;
    try {
      const data = await BackendAPI.vitalSigns.getAll(emergencyId);
      setVitalSigns(data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [emergencyId]);

  useEffect(() => { fetchVitalSigns(); }, [fetchVitalSigns]);
  usePolling(fetchVitalSigns, POLL_INTERVAL);

  const latest = vitalSigns[0];
  if (!latest) return null;

  return (
    <Paper sx={{ p: 1.5, borderLeft: '4px solid #c62828' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <MonitorHeartIcon sx={{ fontSize: 18, color: '#c62828' }} />
        <Typography variant="caption" fontWeight={600} sx={{ color: '#c62828', fontSize: '0.8rem' }}>
          ÚLTIMOS SIGNOS VITALES
        </Typography>
        {latest.recorded_at && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            ({new Date(latest.recorded_at).toLocaleTimeString()})
          </Typography>
        )}
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}><CircularProgress size={16} /></Box>
      ) : (
      <Grid container spacing={1}>
        {latest.systolic_bp && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>PA</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.systolic_bp}/{latest.diastolic_bp}</Typography>
          </Grid>
        )}
        {latest.heart_rate && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>FC</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.heart_rate} lpm</Typography>
          </Grid>
        )}
        {latest.temperature && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>Temp</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.temperature} °C</Typography>
          </Grid>
        )}
        {latest.oxygen_saturation && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>SpO2</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.oxygen_saturation}%</Typography>
          </Grid>
        )}
        {latest.respiratory_rate && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>FR</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.respiratory_rate} rpm</Typography>
          </Grid>
        )}
        {latest.glucose && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>GLC</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.glucose} mg/dL</Typography>
          </Grid>
        )}
        {latest.height && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>Talla</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.height} cm</Typography>
          </Grid>
        )}
        {latest.weight && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>Peso</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.weight} kg</Typography>
          </Grid>
        )}
        {latest.bmi && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>IMC</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.bmi}</Typography>
          </Grid>
        )}
      </Grid>
      )}
    </Paper>
  );
};

export default LatestVitalSigns;
