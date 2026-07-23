import { Box, Chip, Divider, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const FieldRow = ({ label, value }) => (
  <Box sx={{ mt: 1 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {value || '—'}
    </Typography>
  </Box>
);

const EvaluationCard = ({ evaluation, isPrimary }) => {
  if (!evaluation) return null;

  return (
    <Box sx={{ p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <PersonIcon sx={{ fontSize: 16, color: isPrimary ? '#1565c0' : '#6a1b9a' }} />
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem', color: isPrimary ? '#1565c0' : '#6a1b9a' }}>
          {evaluation.doctor?.name || 'Médico'}
        </Typography>
        <Chip
          label={isPrimary ? 'Principal' : 'Interconsulta'}
          size="small"
          sx={{
            height: 18, fontSize: '0.6rem',
            bgcolor: isPrimary ? '#1565c0' : '#6a1b9a',
            color: 'white', fontWeight: 600, ml: 0.5,
          }}
        />
      </Box>
      <Divider sx={{ mb: 1 }} />
      <FieldRow label="Impresión Diagnóstica" value={evaluation.diagnostic_impression} />
      <FieldRow label="Plan" value={evaluation.plan} />
    </Box>
  );
};

export default EvaluationCard;
