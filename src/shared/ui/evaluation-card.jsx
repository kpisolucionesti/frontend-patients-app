import { memo } from 'react';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const FieldRow = memo(function FieldRow({ label, value }) {
  return (
    <Box sx={{ mt: 0.75 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.3 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.4 }}>
        {value || '—'}
      </Typography>
    </Box>
  );
});

const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
};

const EvaluationCard = ({ evaluation, isPrimary, onEdit }) => {
  if (!evaluation) return null;

  return (
    <Box
      sx={{
        p: 1.25,
        bgcolor: 'grey.50',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        mb: 1,
      }}
      role="article"
      aria-label={`Evaluación ${isPrimary ? 'principal' : 'de interconsulta'} de ${evaluation.doctor?.name || 'médico'}`}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <PersonIcon sx={{ fontSize: 16, color: isPrimary ? 'primary.main' : 'secondary.main', flexShrink: 0 }} />
        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem', color: isPrimary ? 'primary.main' : 'secondary.main' }}>
          {evaluation.doctor?.name || 'Médico'}
        </Typography>
        <Chip
          label={isPrimary ? 'Principal' : 'Interconsulta'}
          size="small"
          sx={{ height: 18, fontSize: '0.7rem', bgcolor: isPrimary ? 'primary.main' : 'secondary.main', color: 'white', fontWeight: 600 }}
        />
        {evaluation.doctor?.specialty?.name && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {evaluation.doctor.specialty.name}
          </Typography>
        )}
        <Box sx={{ flex: 1 }} />
        {onEdit && (
          <IconButton size="small" onClick={() => onEdit(evaluation)} sx={{ p: 0.25 }}
            aria-label={`Editar evaluación de ${evaluation.doctor?.name || 'médico'}`}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      <FieldRow label="Impresión Diagnóstica" value={evaluation.diagnostic_impression} />
      <FieldRow label="Plan" value={evaluation.plan} />
      {evaluation.suggestions && <FieldRow label="Sugerencias Médicas" value={evaluation.suggestions} />}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
        <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
          {evaluation.updated_at
            ? `Actualizado: ${formatDate(evaluation.updated_at)}`
            : evaluation.created_at
              ? `Creado: ${formatDate(evaluation.created_at)}`
              : ''}
        </Typography>
      </Box>
    </Box>
  );
};

export default EvaluationCard;
