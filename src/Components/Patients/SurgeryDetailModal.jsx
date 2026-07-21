import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Divider, Grid } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import moment from 'moment';
import { generateSurgeryReport } from '../../services/surgeryReport';

const SURGERY_TYPE_LABELS = {
  general: 'Cirugía General',
  traumatologia: 'Traumatología',
  neurocirugia: 'Neurocirugía',
  cardiovascular: 'Cardiovascular',
  toracica: 'Torácica',
  abdominal: 'Abdominal',
  urologica: 'Urológica',
  ginecologica: 'Ginecológica',
  oftalmologica: 'Oftalmológica',
  otorrino: 'Otorrinolaringología',
  maxilofacial: 'Maxilofacial',
  pediatrica: 'Pediátrica',
  otros: 'Otra',
};

const STATUS_LABELS = {
  scheduled: { label: 'Programada', color: '#1565c0' },
  in_progress: { label: 'En Progreso', color: '#e65100' },
  completed: { label: 'Realizada', color: '#2e7d32' },
  cancelled: { label: 'Cancelada', color: '#757575' },
};

const Field = ({ label, value }) => (
  <Box sx={{ mb: 0.5 }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
      {value || '-'}
    </Typography>
  </Box>
);

const SurgeryDetailModal = ({ open, surgery, onClose }) => {
  if (!surgery) return null;

  const status = STATUS_LABELS[surgery.status] || { label: surgery.status, color: '#757575' };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#00695c', color: 'white', display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
        <LocalHospitalIcon />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {SURGERY_TYPE_LABELS[surgery.surgery_type] || surgery.surgery_type}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {surgery.surgery_date ? moment(surgery.surgery_date).format('DD/MM/YYYY') : ''}
          </Typography>
        </Box>
        <Chip
          label={status.label}
          size="small"
          sx={{ ml: 'auto', bgcolor: status.color, color: 'white', fontWeight: 600, fontSize: '0.7rem' }}
        />
      </DialogTitle>
      <DialogContent dividers sx={{ py: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#00695c', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <PersonIcon sx={{ fontSize: 14 }} /> Equipo Médico
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Field label="Cirujano" value={surgery.surgeon_name} />
              <Field label="Anestesiólogo" value={surgery.anesthesiologist} />
              <Field label="Tipo de Anestesia" value={surgery.anesthesia_type} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 0.5 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#00695c', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, mt: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 14 }} /> Horarios
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Field label="Programado Inicio" value={surgery.scheduled_start_time ? moment(surgery.scheduled_start_time).format('DD/MM/YYYY HH:mm') : ''} />
                </Grid>
                <Grid item xs={6}>
                  <Field label="Programado Fin" value={surgery.scheduled_end_time ? moment(surgery.scheduled_end_time).format('DD/MM/YYYY HH:mm') : ''} />
                </Grid>
                <Grid item xs={6}>
                  <Field label="Inicio Real" value={surgery.actual_start_time ? moment(surgery.actual_start_time).format('DD/MM/YYYY HH:mm') : ''} />
                </Grid>
                <Grid item xs={6}>
                  <Field label="Fin Real" value={surgery.actual_end_time ? moment(surgery.actual_end_time).format('DD/MM/YYYY HH:mm') : ''} />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 0.5 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#00695c', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, mt: 1 }}>
              <DescriptionIcon sx={{ fontSize: 14 }} /> Notas y Evaluaciones
            </Typography>
            <Box sx={{ pl: 1 }}>
              <Field label="Descripción" value={surgery.description} />
              <Field label="Evaluación Pre-Anestésica" value={surgery.preanesthetic_evaluation} />
              <Field label="Notas Pre-Op" value={surgery.preop_notes} />
              <Field label="Notas Post-Op" value={surgery.postop_notes} />
              <Field label="Resultado" value={surgery.result} />
            </Box>
          </Grid>

          {surgery.ambulatory && (
            <Grid item xs={12}>
              <Chip label="Paciente Ambulatorio" size="small" color="info" sx={{ fontSize: '0.7rem' }} />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => generateSurgeryReport(surgery)}
          sx={{ fontSize: '0.75rem' }}
        >
          Descargar Historia Clínica
        </Button>
        <Button onClick={onClose} variant="outlined" size="small">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurgeryDetailModal;
