import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Grid, Chip, Box, Divider
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import SurgeryTeamForm from './SurgeryTeamForm';
import DocumentsPanel from '../Commons/DocumentsPanel';

export default function QuirofanoDetail({ open, onClose, surgery, onSaved }) {
  const [surgeryData, setSurgeryData] = useState(null);

  useEffect(() => {
    if (surgery) {
      setSurgeryData(surgery);
    }
  }, [surgery]);

  if (!surgeryData) return null;

  const statusColor = {
    scheduled: 'primary',
    completed: 'success',
    cancelled: 'default'
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#00695c', color: 'white', fontWeight: 'bold' }}>
        Detalle de Cirugía
        <Chip
          label={surgeryData.surgery_type}
          color={statusColor[surgeryData.status] || 'default'}
          size="small"
          sx={{ ml: 2, color: 'white' }}
        />
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
            <Typography>{surgeryData.status}</Typography>
          </Grid>
          {surgeryData.scheduled_start_time && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Inicio Programado</Typography>
              <Typography>{new Date(surgeryData.scheduled_start_time).toLocaleString('es-ES')}</Typography>
            </Grid>
          )}
          {surgeryData.scheduled_end_time && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Fin Programado</Typography>
              <Typography>{new Date(surgeryData.scheduled_end_time).toLocaleString('es-ES')}</Typography>
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
