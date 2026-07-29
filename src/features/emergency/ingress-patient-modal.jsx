import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import {
  Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem,
  DialogActions, TextField, Alert, IconButton, Tooltip, FormHelperText, Stepper, Step, StepLabel, Box, Typography, Chip, CircularProgress
} from "@mui/material";
import { TransferWithinAStationOutlined } from "@mui/icons-material";

const STEPS = ['Paciente', 'Ingreso'];
const TRANSFER_OPTIONS = ['Quirofano', 'Hospitalizacion', 'UCI'];

const IngressPatientModal = ({ row, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [transfer, setTransfer] = useState('');
  const [validation, setValidation] = useState(false);
  const [ingressing, setIngressing] = useState(false);
  const [error, setError] = useState('');

  const missingFields = (() => {
    const required = [
      { field: 'diagnostic', label: 'Diagnóstico' },
      { field: 'treatment', label: 'Plan' },
      { field: 'classification', label: 'Clasificación' },
      { field: 'reason_for_consultation', label: 'Motivo de Consulta' },
      { field: 'current_illness', label: 'Enfermedad Actual' },
    ];
    return required.filter(f => !row[f.field]);
  })();

  const missingDoctor = !row.primary_doctor?.id;

  const handleOpen = () => setOpen(true);

  const handleClose = useCallback(() => {
    setOpen(false); setActiveStep(0); setValidation(false); setTransfer(''); setError('');
  }, []);

  const handleNext = () => { setError(''); setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1)); };

  const handleIngressPatient = useCallback(async () => {
    if (!transfer) { setValidation(true); setError('Debe seleccionar una ubicación'); return; }
    setIngressing(true); setError('');
    try {
      if (transfer === 'Hospitalizacion') {
        if (missingFields.length > 0)
          throw new Error('Debe completar antes de ingresar: ' + missingFields.map(f => f.label).join(', '));
        if (missingDoctor)
          throw new Error('Debe asignar un Médico Tratante antes de ingresar a Hospitalización');
        await BackendAPI.hospitalizations.create(row.id, {}).catch((err) => {
          throw new Error('No se pudo crear el registro de hospitalización: ' + (err.response?.data?.error || err.message || 'Error de conexión'));
        });
      }
      await BackendAPI.emergencies.update({ id: row.id, transfer, status: 3 });
      if (onStatusChange) onStatusChange();
      handleClose();
    } catch (err) { setError(err.message || 'Error al ingresar paciente'); }
    finally { setIngressing(false); }
  }, [transfer, row, onStatusChange, handleClose, missingFields, missingDoctor]);

  return (
    <>
      <Tooltip title='Ingreso' arrow>
        <span>
          <IconButton color="info" onClick={handleOpen} disabled={row.status !== 1}>
            <TransferWithinAStationOutlined />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
          NUEVO INGRESO
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mt: 0.25, fontSize: '0.7rem', fontWeight: 400 }}>
            {row.patient?.name} {row.patient?.lastname} · CI: {row.patient?.ci || '—'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }} aria-label="Progreso de ingreso">
            {STEPS.map((label, idx) => (
              <Step key={label} active={idx === activeStep} completed={idx < activeStep}>
                <StepLabel aria-current={idx === activeStep ? 'step' : undefined}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)} role="alert">{error}</Alert>}

          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Paciente</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim()} variant="outlined" size="small" />
                <Chip label={`CI: ${row.patient?.ci || '-'}`} variant="outlined" size="small" />
                <Chip label={`Edad: ${row.patient?.age || '-'}`} variant="outlined" size="small" />
              </Box>
              {missingFields.length > 0 && <Alert severity="warning">Campos requeridos faltantes: {missingFields.map(f => f.label).join(', ')}</Alert>}
              {missingDoctor && <Alert severity="warning">Médico Tratante no asignado</Alert>}
              {missingFields.length === 0 && !missingDoctor && <Alert severity="success">Todos los campos requeridos están completos</Alert>}
              <Alert severity="warning" variant="outlined">Una vez ingresado, estos datos no pueden ser modificados</Alert>
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Seleccionar Ubicación</Typography>
              <FormControl variant="standard" error={validation}>
                <InputLabel id="ingress-transfer-label">Ubicación</InputLabel>
                <Select labelId="ingress-transfer-label" variant="standard" value={transfer}
                  onChange={({ target }) => setTransfer(target.value)}>
                  {TRANSFER_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
                {validation && <FormHelperText>Requerido</FormHelperText>}
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error" disabled={ingressing} size="small">Cancelar</Button>
          {activeStep === 0 ? (
            <Button variant="contained" onClick={handleNext} size="small">Siguiente</Button>
          ) : (
            <Button variant="outlined" color="success" onClick={handleIngressPatient} disabled={ingressing || !transfer} size="small">
              {ingressing ? <CircularProgress size={20} /> : 'Confirmar Ingreso'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IngressPatientModal;
