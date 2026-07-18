import { Box, Paper, Typography, Grid } from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

const LatestVitalSigns = ({ vitalSigns = [] }) => {
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
        {(latest.gcs_eye || latest.gcs_verbal || latest.gcs_motor) && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>GCS</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {[latest.gcs_eye, latest.gcs_verbal, latest.gcs_motor].filter(Boolean).reduce((a, b) => Number(a) + Number(b), 0)}
              /15
            </Typography>
          </Grid>
        )}
        {latest.pupil_left && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>Pupilas</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {latest.pupil_left === 'reactive' ? '◉' : '●'} / {latest.pupil_right === 'reactive' ? '◉' : '●'}
            </Typography>
          </Grid>
        )}
        {latest.pain_scale !== null && latest.pain_scale !== undefined && latest.pain_scale !== '' && (
          <Grid item xs={4}>
            <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.65rem' }}>Dolor</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{latest.pain_scale}/10</Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default LatestVitalSigns;
