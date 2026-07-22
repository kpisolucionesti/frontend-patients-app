import { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Grid, Divider,
  Alert, CircularProgress, Paper, Stepper, Step, StepLabel, Snackbar
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BackendAPI } from '../../services/BackendApi';
import { generateHistoriaMedica } from '../../services/historiaMedicaPdf';
import moment from 'moment';

const STEPS = ['Datos del Reporte', 'Vista Previa'];

export default function HistoriaMedicaPreview({ open, onClose, patientId, emergencyId, attachableType, attachableId }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [step, setStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const iframeRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setLoading(true);
    setError(null);
    setData(null);
    setPdfBlobUrl(null);
    setApproved(false);

    const load = async () => {
      try {
        const [emergencyRes, antecedents, familyAntecedents, gynecologicalHistories, lifestyleHabits, notes] = await Promise.all([
          BackendAPI.emergencies.getById(emergencyId),
          BackendAPI.antecedents.getAll(patientId),
          BackendAPI.familyAntecedents.getAll(patientId),
          BackendAPI.gynecologicalHistories.getAll(patientId),
          BackendAPI.lifestyleHabits.getAll(patientId),
          BackendAPI.notes.getAll({ emergency_id: emergencyId }),
        ]);
        let doctorData = null;
        if (user.doctor_id) {
          try { doctorData = await BackendAPI.doctors.getById(user.doctor_id); } catch {}
        }
        setDoctor(doctorData);
        setData({
          patient: emergencyRes.patient || {},
          emergency: emergencyRes,
          antecedents: antecedents || [],
          familyAntecedents: familyAntecedents || [],
          gynecologicalHistories: gynecologicalHistories || [],
          lifestyleHabits: lifestyleHabits || [],
          notes: notes || [],
        });
      } catch (e) {
        setError('Error al cargar los datos para el reporte.');
      }
      setLoading(false);
    };
    load();
  }, [open, patientId, emergencyId, user.doctor_id]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  const handleGeneratePreview = () => {
    if (!data) return;
    try {
      setGenerating(true);
      setError(null);
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      const doc = generateHistoriaMedica({ ...data, doctor });
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
    if (!data || !attachableType || !attachableId) {
      setError('No se puede guardar el reporte: falta información.');
      return;
    }
    setApproving(true);
    setError(null);
    try {
      const doc = generateHistoriaMedica({ ...data, doctor });
      const blob = doc.output('blob');
      const fileName = `Historia_Medica_${data.patient?.name || ''}_${data.patient?.lastname || ''}_${moment().format('YYYYMMDD')}.pdf`;

      const fd = new FormData();
      fd.append('file', blob, fileName);
      fd.append('attachable_type', attachableType);
      fd.append('attachable_id', attachableId);
      fd.append('file_type', 'application/pdf');
      fd.append('report_type', 'historia_medica');
      fd.append('metadata', JSON.stringify({
        doctor_name: doctor?.name || user?.name,
        doctor_ci: doctor?.ci,
        doctor_code: doctor?.doctor_code,
        sanidad_number: doctor?.sanidad_number,
      }));

      await BackendAPI.documents.create(fd);
      doc.save(fileName);
      setApproved(true);
      setSnackbar({ open: true, message: 'Historia Médica aprobada y guardada exitosamente.', severity: 'success' });
    } catch {
      setError('Error al guardar la Historia Médica.');
    } finally {
      setApproving(false);
    }
  };

  const p = data?.patient || {};
  const e = data?.emergency || {};

  return (
    <Dialog open={open} onClose={approved ? undefined : onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1565c0', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <PictureAsPdfIcon />
        Historia Médica
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
            Historia Médica aprobada y guardada exitosamente.
          </Alert>
        )}

        {!loading && !approved && step === 0 && (
          <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f8faff' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#1565c0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityIcon fontSize="small" /> DATOS DEL REPORTE
            </Typography>
            <Divider sx={{ mb: 1.5 }} />

            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Paciente</Typography>
                <Typography variant="body2" fontWeight={600}>{p.name} {p.lastname}</Typography>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Typography variant="caption" color="text.secondary">CI</Typography>
                <Typography variant="body2">{p.ci || '—'}</Typography>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Typography variant="caption" color="text.secondary">Edad</Typography>
                <Typography variant="body2">{p.age ? `${p.age} años` : '—'}</Typography>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Typography variant="caption" color="text.secondary">Sexo</Typography>
                <Typography variant="body2">{p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : p.gender || '—'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Antecedentes Personales</Typography>
                {(data?.antecedents || []).length > 0 ? (data?.antecedents || []).map((a, i) => (
                  <Typography key={i} variant="body2" sx={{ fontSize: '0.72rem' }}>• {[a.category, a.condition_type, a.description].filter(Boolean).join(' — ') || '—'}</Typography>
                )) : <Typography variant="body2" sx={{ fontSize: '0.72rem' }} color="text.disabled">Sin registros</Typography>}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Antecedentes Familiares</Typography>
                {(data?.familyAntecedents || []).length > 0 ? (data?.familyAntecedents || []).map((r, i) => (
                  <Typography key={i} variant="body2" sx={{ fontSize: '0.72rem' }}>• {r.patologia}{r.parentesco ? ` (${r.parentesco})` : ''}: {r.valor || '—'}</Typography>
                )) : <Typography variant="body2" sx={{ fontSize: '0.72rem' }} color="text.disabled">Sin registros</Typography>}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Historia Ginecobstétrica</Typography>
                {(data?.gynecologicalHistories || []).length > 0 ? (data?.gynecologicalHistories || []).map((r, i) => (
                  <Typography key={i} variant="body2" sx={{ fontSize: '0.72rem' }}>• {r.evento}{r.fecha_ultimo_evento ? ` — ${moment(r.fecha_ultimo_evento).format('DD/MM/YYYY')}` : ''}{r.observaciones ? ` — ${r.observaciones}` : ''}</Typography>
                )) : <Typography variant="body2" sx={{ fontSize: '0.72rem' }} color="text.disabled">Sin registros</Typography>}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Estilo de Vida</Typography>
                {(data?.lifestyleHabits || []).length > 0 ? (data?.lifestyleHabits || []).map((r, i) => (
                  <Typography key={i} variant="body2" sx={{ fontSize: '0.72rem' }}>• {r.habito}{r.concurrencia ? ` — ${r.concurrencia}` : ''}{r.observaciones ? ` — ${r.observaciones}` : ''}</Typography>
                )) : <Typography variant="body2" sx={{ fontSize: '0.72rem' }} color="text.disabled">Sin registros</Typography>}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Diagnóstico</Typography>
                <Typography variant="body2">{e.diagnostic || '—'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 0.5 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Médico</Typography>
                <Typography variant="body2" fontWeight={600}>{doctor?.name || user?.name || 'No especificado'}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">CMM</Typography>
                <Typography variant="body2">{doctor?.doctor_code || '—'}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">MPPS</Typography>
                <Typography variant="body2">{doctor?.sanidad_number || '—'}</Typography>
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
                title="Vista previa Historia Médica"
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
            <Button onClick={onClose} variant="outlined" color="error" disabled={approving}>Cancelar</Button>

            {step === 0 && (
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={handleGeneratePreview}
                disabled={loading || generating || !data}
              >
                {generating ? 'Generando...' : 'Siguiente'}
              </Button>
            )}

            {step === 1 && (
              <>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setStep(0)} disabled={approving}>
                  Atrás
                </Button>
                <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleApprove} disabled={approving}>
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
