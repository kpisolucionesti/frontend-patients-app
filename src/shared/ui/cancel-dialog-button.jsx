import { useState, useRef, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const UNDO_GRACE_SECONDS = 10;

const CancelDialogButton = ({
  emergencyId,
  dialogTitle,
  successMessage,
  onSuccess,
  buttonLabel,
  buttonSx,
  extraAction,
  patientName,
  patientCi,
  previousStatus = 1,
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const undoRef = useRef(null);
  const { show: showSnackbar } = useSnackbar();

  useEffect(() => {
    return () => {
      if (undoRef.current) clearTimeout(undoRef.current);
    };
  }, []);

  const handleUndo = async () => {
    if (undoRef.current) clearTimeout(undoRef.current);
    setUndoing(true);
    try {
      await BackendAPI.emergencies.update({
        id: emergencyId,
        status: previousStatus,
      });
      showSnackbar('Anulación revertida', 'success');
      if (onSuccess) onSuccess();
    } catch {
      showSnackbar('Error al revertir anulación', 'error');
    } finally {
      setUndoing(false);
    }
  };

  const handleConfirm = async () => {
    if (!reason || !emergencyId) return;
    setSaving(true);
    try {
      await BackendAPI.emergencies.update({
        id: emergencyId,
        status: 4,
        medical_exit: reason,
      });
      if (extraAction) await extraAction();
      showSnackbar(
        <>
          {successMessage}
          <Button
            size="small"
            color="inherit"
            startIcon={<UndoIcon />}
            onClick={handleUndo}
            disabled={undoing}
            sx={{ ml: 1, fontWeight: 700, textDecoration: 'underline' }}
          >
            {undoing ? 'Revirtiendo...' : 'Deshacer'}
          </Button>
        </>,
        { severity: 'success', autoHideDuration: UNDO_GRACE_SECONDS * 1000 },
      );
      setOpen(false);
      setReason('');
      if (onSuccess) onSuccess();
    } catch {
      showSnackbar('Error al anular', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        color="error"
        startIcon={<CancelIcon />}
        onClick={() => setOpen(true)}
        sx={{ fontSize: '0.7rem', ...buttonSx }}
      >
        {buttonLabel || 'Anular'}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>
          {dialogTitle}
          {patientName && (
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mt: 0.25, fontSize: '0.7rem', fontWeight: 400 }}>
              {patientName}{patientCi ? ` · CI: ${patientCi}` : ''}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <TextField
            variant="standard"
            fullWidth
            size="small"
            required
            multiline
            rows={3}
            label="Motivo de anulación"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={!reason}
            helperText={!reason ? 'Requerido' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" color="error" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={handleConfirm}
            disabled={saving || !reason}
          >
            {saving ? 'Anulando...' : dialogTitle}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CancelDialogButton;
