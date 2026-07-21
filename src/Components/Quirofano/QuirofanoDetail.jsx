import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Button, Typography, Grid, Chip, Box, Divider, Alert, TextField, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { BackendAPI } from '../../services/BackendApi';
import SurgeryTeamForm from './SurgeryTeamForm';
import DocumentsPanel from '../Commons/DocumentsPanel';

const STATUS_CONFIG = {
  scheduled: { color: 'primary', label: 'Programada' },
  in_progress: { color: 'warning', label: 'En Progreso' },
  completed: { color: 'success', label: 'Culminada' },
  cancelled: { color: 'default', label: 'Anulada' },
};

export default function QuirofanoDetail({ open, onClose, surgery, onSaved, onEdit }) {
  const [surgeryData, setSurgeryData] = useState(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (surgery) {
      setSurgeryData(surgery);
      setCloseDialogOpen(false);
      setCancelDialogOpen(false);
      setCancelReason('');
      setActionError(null);
    }
  }, [surgery]);

  if (!surgeryData) return null;

  const isFinalized = surgeryData.status === 'completed' || surgeryData.status === 'cancelled';
  const statusCfg = STATUS_CONFIG[surgeryData.status] || STATUS_CONFIG.scheduled;

  const formatDateTime = (dt) => {
    if (!dt) return null;
    return new Date(dt).toLocaleString('es-ES');
  };

  const handleClose = async () => {
    setActionError(null);
    if (!surgeryData.result || !surgeryData.postop_notes) {
      setActionError('Debe completar el Resultado y las Notas Post-Op antes de culminar la cirugía.');
      return;
    }
    setActionLoading(true);
    try {
      await BackendAPI.quirofano.closeSurgery(surgeryData.id);
      setCloseDialogOpen(false);
      onSaved?.();
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Error al culminar la cirugía');
    }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    setActionError(null);
    if (!cancelReason.trim()) {
      setActionError('Debe indicar el motivo de anulación.');
      return;
    }
    setActionLoading(true);
    try {
      await BackendAPI.quirofano.cancelSurgery(surgeryData.id, cancelReason.trim());
      setCancelDialogOpen(false);
      onSaved?.();
      onClose();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Error al anular la cirugía');
    }
    setActionLoading(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: surgeryData.status === 'cancelled' ? '#b71c1c' : surgeryData.status === 'completed' ? '#2e7d32' : '#00695c', color: 'white', fontWeight: 'bold' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <span>Detalle de Cirugía</span>
              <Chip label={surgeryData.surgery_type} size="small" sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Chip label={statusCfg.label} size="small" color={statusCfg.color} />
              {surgeryData.ambulatory && (
                <Chip label="Ambulatorio" size="small" color="info" sx={{ color: 'white' }} />
              )}
            </Box>
            {!isFinalized && onEdit && (
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<EditIcon />}
                onClick={() => { onClose(); onEdit(surgeryData); }}
              >
                Editar
              </Button>
            )}
          </Box>
        </DialogTitle>

        <DialogContent>
          {surgeryData.status === 'completed' && (
            <Alert severity="warning" sx={{ mt: 2, mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                CIRUGÍA CULMINADA — No editable. Los datos son de carácter informativo.
              </Typography>
            </Alert>
          )}

          {surgeryData.status === 'cancelled' && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                CIRUGÍA ANULADA — No editable. Los datos suministrados ya no son válidos.
              </Typography>
              {surgeryData.cancellation_reason && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Motivo: {surgeryData.cancellation_reason}
                </Typography>
              )}
            </Alert>
          )}

          {actionError && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>{actionError}</Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Paciente</Typography>
              <Typography>{surgeryData.patient?.name} {surgeryData.patient?.lastname}</Typography>
              <Typography variant="body2" color="text.secondary">CI: {surgeryData.patient?.ci}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Cirujano</Typography>
              <Typography>{surgeryData.surgeon_name || 'No asignado'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Fecha</Typography>
              <Typography>{surgeryData.surgery_date?.split('T')[0]}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Estado</Typography>
              <Chip label={statusCfg.label} size="small" color={statusCfg.color} />
            </Grid>
            {surgeryData.scheduled_start_time && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Inicio Programado</Typography>
                <Typography>{formatDateTime(surgeryData.scheduled_start_time)}</Typography>
              </Grid>
            )}
            {surgeryData.scheduled_end_time && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Fin Programado</Typography>
                <Typography>{formatDateTime(surgeryData.scheduled_end_time)}</Typography>
              </Grid>
            )}
            {surgeryData.actual_start_time && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, color: 'success.main' }}>Inicio Real</Typography>
                <Typography>{formatDateTime(surgeryData.actual_start_time)}</Typography>
              </Grid>
            )}
            {surgeryData.actual_end_time && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, color: 'error.main' }}>Fin Real</Typography>
                <Typography>{formatDateTime(surgeryData.actual_end_time)}</Typography>
              </Grid>
            )}
            {surgeryData.anesthesiologist && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Anestesiólogo</Typography>
                <Typography>{surgeryData.anesthesiologist}</Typography>
              </Grid>
            )}
            {surgeryData.anesthesia_type && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Tipo de Anestesia</Typography>
                <Typography>{surgeryData.anesthesia_type}</Typography>
              </Grid>
            )}
            {surgeryData.area && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Quirófano</Typography>
                <Typography>{surgeryData.area.name}</Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {surgeryData.description && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Descripción</Typography>
                <Typography>{surgeryData.description}</Typography>
              </Grid>
            )}
            {surgeryData.preanesthetic_evaluation && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Evaluación Pre-Anestésica</Typography>
                <Typography>{surgeryData.preanesthetic_evaluation}</Typography>
              </Grid>
            )}
            {surgeryData.preop_notes && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Notas Pre-Op</Typography>
                <Typography>{surgeryData.preop_notes}</Typography>
              </Grid>
            )}
            {surgeryData.postop_notes && (
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Notas Post-Op</Typography>
                <Typography>{surgeryData.postop_notes}</Typography>
              </Grid>
            )}
            {surgeryData.result && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Resultado</Typography>
                <Typography>{surgeryData.result}</Typography>
              </Grid>
            )}
          </Grid>

          {surgeryData.status !== 'cancelled' && (
            <>
              <Divider sx={{ my: 2 }} />
              <SurgeryTeamForm surgeryId={surgeryData.id} readOnly={isFinalized} />

              <Divider sx={{ my: 2 }} />
              <DocumentsPanel attachableType="Surgery" attachableId={surgeryData.id} managePermission="quirofano.documentos" />
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box>
            {!isFinalized && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setCloseDialogOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Culminar Cirugía
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Anular
                </Button>
              </>
            )}
          </Box>
          <Button onClick={onClose} variant="outlined" color="error">Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={closeDialogOpen} onClose={() => !actionLoading && setCloseDialogOpen(false)}>
        <DialogTitle>Culminar Cirugía</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Al culminar el registro de la cirugía, esta quedará bloqueada y <strong>no podrá editarse.</strong>
            {' '}¿Está seguro de continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)} disabled={actionLoading}>Cancelar</Button>
          <Button onClick={handleClose} variant="contained" color="success" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={20} /> : 'Sí, culminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cancelDialogOpen} onClose={() => !actionLoading && setCancelDialogOpen(false)}>
        <DialogTitle>Anular Cirugía</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            La cirugía será anulada y <strong>no podrá editarse ni reactivarse.</strong>
          </DialogContentText>
          <TextField
            autoFocus
            label="Motivo de anulación"
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            error={actionError && !cancelReason.trim()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={actionLoading}>Cancelar</Button>
          <Button onClick={handleCancel} variant="contained" color="error" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={20} /> : 'Sí, anular'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
