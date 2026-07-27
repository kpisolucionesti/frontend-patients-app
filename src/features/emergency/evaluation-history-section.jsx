import React from 'react';
import { Paper, Typography } from '@mui/material';
import EvaluationCard from '../../shared/ui/evaluation-card';

const EvaluationHistorySection = React.memo(function EvaluationHistorySection({
  evaluations,
  emergency,
  readOnly,
  onEdit,
}) {
  if (!evaluations || evaluations.length === 0) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.03em', mb: 1, display: 'block' }}>
        HISTORIAL DE EVALUACIONES ({evaluations.length})
      </Typography>
      {evaluations.map((ev) => (
        <EvaluationCard
          key={ev.id}
          evaluation={ev}
          isPrimary={ev.doctor_id === emergency?.primary_doctor?.id}
          onEdit={!readOnly ? onEdit : undefined}
        />
      ))}
    </Paper>
  );
});

export default EvaluationHistorySection;
