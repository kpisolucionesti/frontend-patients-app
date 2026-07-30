import { useState, useRef, useEffect } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, CircularProgress } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import UndoIcon from '@mui/icons-material/Undo';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const UNDO_GRACE_SECONDS = 10;
const DEFAULT_LABEL = 'Fallecimiento';
const DEFAULT_SX = {
  fontSize: '0.7rem',
  fontWeight: 600,
};

const DeathDialogButton = ({ emergencyId, patientId, patientName, patientCi, onSuccess, buttonLabel, buttonSx, previousStatus = 1 }) => {
  const [open, setOpen] = useState(false);
  const [cause, setCause] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [observations, setObservations] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const undoRef = useRef(null);
  const { show: showSnackbar } = useSnackbar();

  useEffect(() => {
    return () => {
      if (undoRef.current) clearTimeout(undoRef.current);
    };
  }, []);

  const handleOpen = () => {
    setCause('');
    setDateTime(new Date().toISOString().slice(0, 16));
    setObservations('');
    setCertificateNumber('');
    setSelectedFile(null);
    setOpen(true);
  };

  const handleUndo = async () => {
    if (undoRef.current) clearTimeout(undoRef.current);
    setUndoing(true);
    try {
      await BackendAPI.emergencies.update({
        id: emergencyId,
        status: previousStatus,
      });
      await BackendAPI.patients.update(patientId, { disabled: false });
      showSnackbar('Fallecimiento revertido', 'success');
      if (onSuccess) onSuccess();
    } catch {
      showSnackbar('Error al revertir fallecimiento', 'error');
    } finally {
      setUndoing(false);
    }
  };

  const handleConfirm = async () => {
    if (!cause || !emergencyId || !patientId) return;
    if (!certificateNumber.trim()) { showSnackbar('El Nro. Acta de Defunción es requerido', 'warning'); return; }
    setSaving(true);
    try {
      await BackendAPI.emergencies.update({
        id: emergencyId,
        status: 5,
        cause_of_death: cause,
        egress_at: new Date(dateTime).toISOString(),
        observations,
        death_certificate_number: certificateNumber,
      });
      if (selectedFile) {
        setUploading(true);
        try {
          const fd = new FormData();
          fd.append('file', selectedFile);
          fd.append('attachable_type', 'Emergency');
          fd.append('attachable_id', emergencyId);
          fd.append('file_type', selectedFile.type);
          await BackendAPI.documents.create(fd);
        } catch { /* file upload failure is non-blocking */ }
        setUploading(false);
      }
      await BackendAPI.patients.update(patientId, { disabled: true });
      showSnackbar(
        <>
          Fallecimiento registrado
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
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      showSnackbar('Error al registrar fallecimiento', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="error"
        size="small"
        startIcon={<WarningIcon />}
        onClick={handleOpen}
        sx={{ ...DEFAULT_SX, ...buttonSx }}
      >
        {buttonLabel || DEFAULT_LABEL}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>
          REGISTRAR FALLECIMIENTO
          {patientName && (
            <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mt: 0.25, fontSize: '0.7rem', fontWeight: 400 }}>
              {patientName}{patientCi ? ` · CI: ${patientCi}` : ''}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField variant="standard" fullWidth size="small" required label="Causa de Muerte"
              value={cause} onChange={(e) => setCause(e.target.value)}
              inputProps={{ maxLength: 2000 }}
              error={!cause} helperText={!cause ? 'Requerido' : ''} />
            <TextField variant="standard" fullWidth size="small" label="Fecha y Hora de Muerte"
              type="datetime-local" value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              InputLabelProps={{ shrink: true }} />
            <TextField variant="standard" fullWidth size="small" required label="Nro. Acta de Defunción"
              type="number" value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              error={!certificateNumber.trim()}
              helperText={!certificateNumber.trim() ? 'Requerido' : ''} />
            <Box>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                Adjuntar Acta de Defunción
              </Typography>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden
                onChange={(e) => setSelectedFile(e.target.files[0] || null)} />
              {selectedFile ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.primary', flex: 1 }}>
                    {selectedFile.name}
                  </Typography>
                  <Button size="small" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    startIcon={<DeleteIcon />} color="error" sx={{ fontSize: '0.65rem', py: 0.1 }}>
                    Quitar
                  </Button>
                </Box>
              ) : (
                <Button size="small" variant="outlined" startIcon={<AttachFileIcon />}
                  onClick={() => fileInputRef.current?.click()} sx={{ fontSize: '0.7rem' }}>
                  Seleccionar archivo
                </Button>
              )}
            </Box>
            <TextField variant="standard" fullWidth size="small" label="Observaciones"
              value={observations} onChange={(e) => setObservations(e.target.value)}
              inputProps={{ maxLength: 2000 }} multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" color="error" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" color="error" onClick={handleConfirm} disabled={saving || uploading || !cause || !certificateNumber.trim()}>
            {saving || uploading ? 'Guardando...' : 'Confirmar Fallecimiento'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeathDialogButton;
