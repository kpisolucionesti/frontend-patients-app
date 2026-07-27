import React from 'react';
import { Grid, Typography } from '@mui/material';

const VITAL_GRID = [
  { label: 'PA',       key: 'bp',        render: (v) => `${v.systolic_bp || '—'}/${v.diastolic_bp || '—'} mmHg` },
  { label: 'FC',       key: 'heart_rate', render: (v) => v.heart_rate ? `${v.heart_rate} lpm` : '—' },
  { label: 'FR',       key: 'respiratory_rate', render: (v) => v.respiratory_rate ? `${v.respiratory_rate} rpm` : '—' },
  { label: 'Temp',     key: 'temperature', render: (v) => v.temperature ? `${v.temperature}°C` : '—' },
  { label: 'SpO₂',     key: 'oxygen_saturation', render: (v) => v.oxygen_saturation ? `${v.oxygen_saturation}%` : '—' },
  { label: 'Glucosa',  key: 'glucose',    render: (v) => v.glucose ? `${v.glucose} mg/dL` : null },
  { label: 'Peso',     key: 'weight',     render: (v) => v.weight ? `${v.weight} kg` : null },
  { label: 'Talla',    key: 'height',     render: (v) => v.height ? `${v.height} m` : null },
  { label: 'IMC',      key: 'bmi',        render: (v) => v.bmi ? `${v.bmi}` : null },
];

const VitalSignsCard = React.memo(function VitalSignsCard({ vitalSigns }) {
  if (!vitalSigns?.length) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
        Sin signos vitales registrados
      </Typography>
    );
  }

  const v = vitalSigns[vitalSigns.length - 1];
  const visible = VITAL_GRID.filter((item) => item.render(v) !== null);

  if (visible.length === 0) return null;

  return (
    <Grid container spacing={1}>
      {visible.map((item) => (
        <Grid item xs={4} key={item.key}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {item.label}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {item.render(v)}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
});

export default VitalSignsCard;
