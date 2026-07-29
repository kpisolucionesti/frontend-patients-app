import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({ icon, title, description, action, sx }) => (
  <Box sx={{ py: 3, textAlign: 'center', ...sx }}>
    {icon || <InboxIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />}
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
      {title || 'Sin registros'}
    </Typography>
    {description && (
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25, fontSize: '0.65rem' }}>
        {description}
      </Typography>
    )}
    {action && <Box sx={{ mt: 1 }}>{action}</Box>}
  </Box>
);

export default EmptyState;
