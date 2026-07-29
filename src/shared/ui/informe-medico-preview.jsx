import { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Grid, Chip, Divider,
  Checkbox, FormControlLabel, FormGroup, Alert,
  CircularProgress, Paper, Stepper, Step, StepLabel, Snackbar
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BackendAPI } from '../../services/BackendApi';
import { generateInformeMedico } from '../../services/informeMedicoPdf';
import moment from 'moment';

export default function InformeMedicoPreview({ open, onClose, emergency, patient, attachableType, attachableId }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [treatmentOptions, setTreatmentOptions] = useState({ sePropone: true, seRealiza: false });
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [step, setStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const iframeRef = useRef(null);

  const STEPS = ['Datos del Informe', 'Vista Previa'];

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setLoading(true);
    setError(null);
    setPdfBlobUrl(null);
    setApproved(false);

    const loadDoctor = async () => {
      try {
        if (user.doctor_id) {
          const doc = await BackendAPI.doctors.getById(user.doctor_id);
          setDoctor(doc);
        } else {
          setDoctor(null);
        }
      } catch {
        setError('No se pudo cargar la información del médico.');
        setDoctor(null);
      }
      setLoading(false);
    };
    loadDoctor();
  }, [open, user.doctor_id]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  const handleGeneratePreview = () => {
    try {
      setGenerating(true);
      setError(null);
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      const doc = generateInformeMedico({ patient, emergency, doctor, treatmentOptions });
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setStep(1);
    } catch {
      setError('Error al generar la vista previa del PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!attachableType || !attachableId) {
      setError('No se puede guardar el informe: falta información del paciente.');
      return;
    }
    setApproving(true);
    setError(null);
    try {
      const doc = generateInformeMedico({ patient, emergency, doctor, treatmentOptions });
      const blob = doc.output('blob');
      const fileName = `Informe_Medico_${patient?.name || ''}_${patient?.lastname || ''}_${moment().format('YYYYMMDD')}.pdf`;

      const fd = new FormData();
      fd.append('file', blob, fileName);
      fd.append('attachable_type', attachableType);
      fd.append('attachable_id', attachableId);
      fd.append('file_type', 'application/pdf');
      fd.append('report_type', 'informe_medico');
      fd.append('metadata', JSON.stringify({
        treatment: treatmentOptions,
        doctor_name: doctor?.name || user?.name,
        doctor_ci: doctor?.ci,
        doctor_code: doctor?.doctor_code,
        sanidad_number: doctor?.sanidad_number,
      }));

      await BackendAPI.documents.create(fd);
      doc.save(fileName);
      setApproved(true);
      setSnackbar({ open: true, message: 'Informe Médico aprobado y guardado exitosamente.', severity: 'success' });
    } catch {
      setError('Error al guardar el informe médico.');
    } finally {
      setApproving(false);
    }
  };

  const genderLabel = patient?.gender === 'M' ? 'Masculino' : patient?.gender === 'F' ? 'Femenino' : patient?.gender || '';
  const age = patient?.birthday ? moment().diff(moment(patient.birthday), 'years') : '';

  const paraclinicos = emergency?.paraclinical_studies || [];
  const physicalExam = emergency?.physical_exam || {};

  return (
    <Dialog open={open} onClose={approved ? undefined : onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PictureAsPdfIcon />
        Informe Médico
      </DialogTitle>

      <Box sx={{ px: 3, pt: 2 }}>
        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {approved && (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2 }}>
            Informe Médico aprobado y guardado exitosamente.
          </Alert>
        )}

        {!loading && !approved && step === 0 && (
          <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f8faff' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon fontSize="small" /> DATOS DEL INFORME
            </Typography>
            <Divider sx={{ mb: 1.5 }} />

            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Paciente</Typography>
                <Typography variant="body2" fontWeight={600}>{patient?.name} {patient?.lastname}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Sexo</Typography>
                <Typography variant="body2">{genderLabel}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Edad</Typography>
                <Typography variant="body2">{age} años</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Motivo de Consulta</Typography>
                <Typography variant="body2">{emergency?.reason_for_consultation || <Chip label="No registrado" size="small" variant="outlined" />}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Examen Físico Resumido</Typography>
                {Object.entries(physicalExam).filter(([k, v]) => k !== 'id' && k !== 'emergency_id' && k !== 'created_at' && k !== 'updated_at' && v).length > 0 ? (
                  Object.entries(physicalExam)
                    .filter(([k, v]) => k !== 'id' && k !== 'emergency_id' && k !== 'created_at' && k !== 'updated_at' && v)
                    .map(([k, v]) => (
                      <Typography key={k} variant="body2"><strong>{k.charAt(0).toUpperCase() + k.slice(1)}:</strong> {v}</Typography>
                    ))
                ) : (
                  <Chip label="No registrado" size="small" variant="outlined" />
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Exámenes Paracínicos</Typography>
                {paraclinicos.length > 0 ? paraclinicos.map((e, i) => (
                  <Typography key={i} variant="body2">• {e.study_type}: {e.description}</Typography>
                )) : (
                  <Chip label="No registrado" size="small" variant="outlined" />
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Diagnóstico</Typography>
                <Typography variant="body2">{emergency?.diagnostic || <Chip label="No registrado" size="small" variant="outlined" />}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Tratamiento</Typography>
                <FormGroup row sx={{ ml: 1 }}>
                  <FormControlLabel
                    control={<Checkbox checked={treatmentOptions.sePropone} onChange={(e) => setTreatmentOptions(prev => ({ ...prev, sePropone: e.target.checked }))} size="small" />}
                    label={<Typography variant="body2">SE PROPONE</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={treatmentOptions.seRealiza} onChange={(e) => setTreatmentOptions(prev => ({ ...prev, seRealiza: e.target.checked }))} size="small" />}
                    label={<Typography variant="body2">SE REALIZA</Typography>}
                  />
                </FormGroup>
                <Typography variant="body2" sx={{ ml: 1, mt: 0.5 }}>{emergency?.treatment || <Chip label="No registrado" size="small" variant="outlined" />}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Médico</Typography>
                <Typography variant="body2" fontWeight={600}>{doctor?.name || user?.name || 'No especificado'}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Cédula</Typography>
                <Typography variant="body2">{doctor?.ci || '-'}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Código Médico</Typography>
                <Typography variant="body2">{doctor?.doctor_code || '-'}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">N° Sanidad</Typography>
                <Typography variant="body2">{doctor?.sanidad_number || '-'}</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {!loading && !approved && step === 1 && (
          <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PictureAsPdfIcon fontSize="small" /> VISTA PREVIA DEL DOCUMENTO
            </Typography>
            <Divider sx={{ mb: 1.5 }} />

            {pdfBlobUrl ? (
              <iframe
                ref={iframeRef}
                src={pdfBlobUrl}
                type="application/pdf"
                width="100%"
                height="500"
                style={{ border: '1px solid #ddd', borderRadius: 4 }}
                title="Vista previa Informe Médico"
              />
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {approved ? (
          <Button onClick={onClose} variant="contained" color="success" startIcon={<CheckCircleIcon />}>
            Finalizar
          </Button>
        ) : (
          <>
            <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>

            {step === 0 && (
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={handleGeneratePreview}
                disabled={loading || generating}
              >
                {generating ? 'Generando...' : 'Siguiente'}
              </Button>
            )}

            {step === 1 && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setStep(0)}
                  disabled={approving}
                >
                  Atrás
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleApprove}
                  disabled={approving}
                >
                  {approving ? 'Guardando...' : 'Aprobar'}
                </Button>
              </>
            )}
          </>
        )}
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
