import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge, IconButton, Tooltip, Popover, List, ListItem, ListItemButton,
  ListItemText, Typography, Box, Button, Snackbar, Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useNotificationPoll from '../../hooks/useNotificationPoll';

const TYPE_ICONS = {
  emergency_discharge: '🏥',
  hospitalization_admission: '🏥',
  hospitalization_discharge: '🏥',
  surgery_scheduled: '🩺',
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, newItems, dequeueNew, markRead, markAllRead } = useNotificationPoll();
  const [anchorEl, setAnchorEl] = useState(null);
  const [toast, setToast] = useState(null);
  const toastQueue = useRef([]);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (newItems.length > 0 && !toast) {
      const item = dequeueNew();
      if (item) {
        setToast(item);
      }
    }
  }, [newItems, toast, dequeueNew]);

  const handleToastClose = () => {
    setToast(null);
    const next = toastQueue.current.shift();
    if (next) {
      setToast(next);
    }
  };

  const handleToastAction = () => {
    if (toast) {
      markRead(toast.id);
      navigate(toast.link);
    }
    handleToastClose();
  };

  const handleClick = (e) => setAnchorEl(e.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleItemClick = async (n) => {
    await markRead(n.id);
    navigate(n.link);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Notificaciones" arrow>
        <IconButton onClick={handleClick} sx={{ color: 'inherit' }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 400, mt: 0.5 } } }}
      >
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" fontWeight={600}>Notificaciones</Typography>
          {unreadCount > 0 && (
            <Button size="small" sx={{ fontSize: '0.7rem' }} onClick={markAllRead}>
              Marcar todas como leídas
            </Button>
          )}
        </Box>
        {unreadCount === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Sin notificaciones</Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {notifications.filter((n) => !n.read).slice(0, 20).map((n) => (
              <ListItem key={n.id} disablePadding>
                <ListItemButton onClick={() => handleItemClick(n)} sx={{ py: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span>{TYPE_ICONS[n.notification_type] || '🔔'}</span>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {n.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {n.message}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Popover>

      <Snackbar
        open={!!toast}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{TYPE_ICONS[toast?.notification_type] || '🔔'}</span>
            <Box>
              <Typography variant="body2" fontWeight={600}>{toast?.title}</Typography>
              <Typography variant="caption">{toast?.message}</Typography>
            </Box>
          </Box>
        }
        action={
          <Button color="primary" size="small" onClick={handleToastAction}>
            Ver
          </Button>
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </>
  );
};

export default NotificationBell;
