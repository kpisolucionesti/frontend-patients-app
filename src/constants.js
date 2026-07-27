export const PEDIATRIC_AGE_THRESHOLD = 14;

export const CLASSIFICATION_OPTIONS = [
  { key: 'red', label: 'Resucitación', color: '#e53935' },
  { key: 'orange', label: 'Muy Urgente', color: '#fb8c00' },
  { key: 'yellow', label: 'Urgente', color: '#fdd835' },
  { key: 'green', label: 'Menos Urgente', color: '#43a047' },
  { key: 'blue', label: 'No Urgente', color: '#1e88e5' },
];

export const STATUS_LABELS = {
  0: 'ESPERANDO',
  1: 'ATENDIDO',
  2: 'ALTA',
  3: 'INGRESADO',
  4: 'ANULADA',
  5: 'FALLECIDO',
};

export const STATUS_CONFIG = {
  0: { label: 'Esperando',  chipColor: 'warning', bg: '#ed6c02' },
  1: { label: 'Atendido',   chipColor: 'info',    bg: '#1565c0' },
  2: { label: 'Alta Médica',chipColor: 'success', bg: '#2e7d32' },
  3: { label: 'Ingreso a Hospitalización', chipColor: 'secondary', bg: '#7b1fa2' },
  4: { label: 'Anulada',    chipColor: 'default', bg: '#9e9e9e' },
  5: { label: 'Fallecido',  chipColor: 'default', bg: '#212121' },
};
