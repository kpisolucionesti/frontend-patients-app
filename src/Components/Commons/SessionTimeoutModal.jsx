import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { BackendAPI } from '../../services/BackendApi';

const COUNTDOWN_SECONDS = 120;

const SessionTimeoutModal = ({ open, onContinue }) => {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!open) {
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const handleContinue = async () => {
    try {
      await BackendAPI.auth.keepAlive();
    } catch {
      // ignore
    }
    onContinue();
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <Dialog open={open} maxWidth="xs" fullWidth onClose={handleContinue}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
        Sesión próxima a expirar
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Su sesión expirará por inactividad en:
        </Typography>
        <Typography variant="h3" fontWeight="bold" color="error">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Presione "Continuar sesión" para mantenerla activa.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button variant="outlined" size="large" onClick={handleContinue}>
          Continuar sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutModal;
