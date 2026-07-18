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
        setOpen(false);
        setActiveStep(0);
        setValidation(false);
        setTransfer('');
        setError('');
    }, []);

    const handleNext = () => {
      setError('');
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const handleIngressPatient = useCallback(async () => {
        if (!transfer) {
            setValidation(true);
            setError('Debe seleccionar una ubicación');
            return;
        }
        setIngressing(true);
        setError('');
        try {
            if (transfer === 'Hospitalizacion') {
                if (missingFields.length > 0) {
                    throw new Error('Debe completar antes de ingresar: ' + missingFields.map(f => f.label).join(', '));
                }
                if (missingDoctor) {
                    throw new Error('Debe asignar un Médico Tratante antes de ingresar a Hospitalización');
                }
                await BackendAPI.hospitalizations.create(row.id, {}).catch((err) => {
                    const msg = err.response?.data?.error || err.message || 'Error de conexión';
                    throw new Error('No se pudo crear el registro de hospitalización: ' + msg);
                });
            }
            await BackendAPI.emergencies.update({ id: row.id, transfer, status: 3 });
            setTransfer('');
            setValidation(false);
            if (onStatusChange) onStatusChange();
            handleClose();
        } catch (err) {
            const msg = err.message || 'Error al ingresar paciente';
            setError(msg);
        } finally {
            setIngressing(false);
        }
    }, [transfer, row, onStatusChange, handleClose, missingFields, missingDoctor]);

    const canGoToStep2 = () => {
      if (transfer === 'Hospitalizacion') {
        return missingFields.length === 0 && !missingDoctor;
      }
      return true;
    };

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
                <DialogTitle sx={{ bgcolor: '#1565c0', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                    NUEVO INGRESO
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                        {STEPS.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

                    {activeStep === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Typography variant="subtitle2">Paciente</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={`${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim()} variant="outlined" size="small" />
                                <Chip label={`CI: ${row.patient?.ci || '-'}`} variant="outlined" size="small" />
                                <Chip label={`Edad: ${row.patient?.age || '-'}`} variant="outlined" size="small" />
                            </Box>

                            {missingFields.length > 0 && (
                              <Alert severity="warning">
                                Campos requeridos faltantes: {missingFields.map(f => f.label).join(', ')}
                              </Alert>
                            )}
                            {missingDoctor && (
                              <Alert severity="warning">
                                Médico Tratante no asignado
                              </Alert>
                            )}
                            {missingFields.length === 0 && !missingDoctor && (
                              <Alert severity="success">Todos los campos requeridos están completos</Alert>
                            )}

                            <Alert variant="filled" severity="warning" sx={{ mt: 1 }}>
                                SE INFORMA QUE UNA VEZ SE INGRESE AL PACIENTE, ESTOS DATOS NO PUEDEN SER MODIFICADOS
                            </Alert>
                        </Box>
                    )}

                    {activeStep === 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="subtitle2">Seleccionar Ubicación</Typography>
                            <FormControl fullWidth>
                                <InputLabel>Ubicación</InputLabel>
                                <Select variant="standard" error={validation} fullWidth label="Ingresado a..." required name="transfer" value={transfer} onChange={({ target }) => setTransfer(target.value)}>
                                    {TRANSFER_OPTIONS.map((opt) => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>Requerido</FormHelperText>
                            </FormControl>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} variant="outlined" disabled={ingressing}>Cancelar</Button>
                    {activeStep === 0 ? (
                        <Button variant="contained" onClick={handleNext}>
                            Siguiente
                        </Button>
                    ) : (
                        <Button variant="contained" color="primary" onClick={handleIngressPatient} disabled={ingressing || !transfer}>
                            {ingressing ? <CircularProgress size={20} /> : 'Confirmar Ingreso'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default IngressPatientModal;
