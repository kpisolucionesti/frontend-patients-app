import { Chip } from '@mui/material';
import { STATUS_CONFIG } from '../../constants';

const StatusChip = ({ status }) => {
  const config = STATUS_CONFIG[status] || { chipColor: 'default', label: 'DESCONOCIDO' };
  return <Chip color={config.chipColor} label={config.label.toUpperCase()} />;
};

export default StatusChip;
