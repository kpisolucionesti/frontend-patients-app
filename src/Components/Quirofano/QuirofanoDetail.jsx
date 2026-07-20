import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Grid, Chip, Box, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { BackendAPI } from '../../services/BackendApi';
import SurgeryTeamForm from './SurgeryTeamForm';
import DocumentsPanel from '../Commons/DocumentsPanel';

export default function QuirofanoDetail({ open, onClose, surgery, onSaved, onEdit }) {
  const [surgeryData, setSurgeryData] = useState(null);

  useEffect(() => {
    if (surgery) {
      setSurgeryData(surgery);
    }
  }, [surgery]);

  if (!surgeryData) return null;

  const statusColor = {
    scheduled: 'primary',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'default'
  };

  const formatDateTime = (dt) => {
    if (!dt) return null;
    return new Date(dt).toLocaleString('es-ES');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#00695c', color: 'white', fontWeight: 'bold' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            Detalle de Cirugía
            <Chip
              label={surgeryData.surgery_type}
              color={statusColor[surgeryData.status] || 'default'}
              size="small"
              sx={{ ml: 2, color: 'white' }}
            />
            {surgeryData.ambulatory && (
              <Chip label="Ambulatorio" size="small" color="info" sx={{ ml: 1, color: 'white' }} />
            )}
          </Box>
          {onEdit && (
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
        <Grid container spacing={2}>
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
            <Chip
              label={surgeryData.status}
              size="small"
              color={statusColor[surgeryData.status] || 'default'}
            />
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

        <Divider sx={{ my: 2 }} />
        <SurgeryTeamForm surgeryId={surgeryData.id} />

        <Divider sx={{ my: 2 }} />
        <DocumentsPanel attachableType="Surgery" attachableId={surgeryData.id} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
