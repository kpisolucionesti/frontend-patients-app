import { Chip } from '@mui/material';

const STATUS_MAP = {
  0: { color: 'success', label: 'ESPERANDO' },
  1: { color: 'warning', label: 'ATENDIDO' },
  2: { color: 'error', label: 'ALTA' },
  3: { color: 'info', label: 'INGRESADO' },
};

const StatusChip = ({ status }) => {
  const config = STATUS_MAP[status] || { color: 'default', label: 'DESCONOCIDO' };
  return <Chip color={config.color} label={config.label} />;
};

export default StatusChip;
