import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem, DialogActions, TextField, Alert, IconButton, Tooltip } from "@mui/material";
import { HealthAndSafetyOutlined } from "@mui/icons-material";
import { useFetch } from "../../hooks/useFetch";

const EXIT_REASONS = ['Mejoria Medica', 'Referencia', 'Contra opinion Medica', 'Muerte'];

const ReleasePatient = ({ row, onStatusChange }) => {
    const [open, setOpen] = useState(false);
    const [extraData, setExtraData] = useState({ medical_exit: '', observations: '', cause_of_death: '', death_at: '' });
    const [validation, setValidation] = useState(false);

    const { data: rooms = [] } = useFetch(() => BackendAPI.rooms.getAll(), [open]);

    const handleOpen = () => setOpen(true);

    const handleClose = useCallback(() => {
        setOpen(false);
        setValidation(false);
        setExtraData({ medical_exit: '', observations: '', cause_of_death: '', death_at: '' });
    }, []);

    const handleValueChange = useCallback((target) => {
        setExtraData((prev) => ({ ...prev, [target.name]: target.value }));
    }, []);

    const isDeath = extraData.medical_exit === 'Muerte';

    const handleReleasePatient = useCallback(() => {
        if (!extraData.medical_exit) {
            alert("FALTAN DATOS POR LLENAR");
            setValidation(true);
            return;
        }
        if (isDeath && !extraData.cause_of_death) {
            alert("DEBE ESPECIFICAR LA CAUSA DE MUERTE");
            setValidation(true);
            return;
        }
        const currentRoom = rooms.find((f) => f.patient_id === row.patient?.id);

        if (isDeath) {
            BackendAPI.emergencies.update({
                id: row.id,
                status: 5,
                cause_of_death: extraData.cause_of_death,
                observations: extraData.observations,
                egress_at: extraData.death_at || new Date().toISOString(),
            });
            if (row.patient?.id) {
                BackendAPI.patients.update(row.patient.id, { disabled: true });
            }
        } else {
            BackendAPI.emergencies.update({ id: row.id, ...extraData, status: 2 });
        }

        if (currentRoom) {
            BackendAPI.rooms.update({ ...currentRoom, patient_id: null });
        }
        setExtraData({ medical_exit: '', observations: '', cause_of_death: '', death_at: '' });
        setValidation(false);
        if (onStatusChange) onStatusChange();
        handleClose();
    }, [extraData, rooms, row, onStatusChange, handleClose, isDeath]);

    return (
        <>
            <Tooltip title='Alta Medica' arrow>
                <span>
                    <IconButton color="error" onClick={handleOpen} disabled={row.status !== 1}>
                        <HealthAndSafetyOutlined />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog fullWidth maxWidth='xs' open={open} onClose={handleClose}>
                <DialogTitle textAlign="center" sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 'bold' }}>
                    {isDeath ? 'REGISTRO DE FALLECIMIENTO' : 'ALTA PACIENTE'}
                </DialogTitle>
                <DialogContent dividers>
                    <Alert variant="filled" severity={isDeath ? 'error' : 'warning'}>
                        {isDeath
                            ? 'SE REGISTRARÁ EL FALLECIMIENTO DEL PACIENTE. ESTOS DATOS NO PUEDEN SER MODIFICADOS.'
                            : 'SE INFORMA QUE UNA VEZ SE DE EL ALTA AL PACIENTE, ESTOS DATOS NO PUEDEN SER MODIFICADOS'
                        }
                    </Alert>
                    <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                        <TextField variant="standard" disabled fullWidth label="Paciente" value={`${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim()} />
                        <FormControl>
                            <InputLabel>Causas</InputLabel>
                            <Select variant="standard" error={validation} fullWidth label="Egreso" required name="medical_exit" value={extraData.medical_exit} onChange={({ target }) => handleValueChange(target)}>
                                {EXIT_REASONS.map((r) => (
                                    <MenuItem key={r} value={r}>{r}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {isDeath && (
                            <>
                                <TextField variant="standard" multiline rows={2} fullWidth required label='Causa de Muerte' name='cause_of_death' value={extraData.cause_of_death} onChange={({ target }) => handleValueChange(target)} error={validation && !extraData.cause_of_death} helperText={validation && !extraData.cause_of_death ? 'Requerido' : ''} />
                                <TextField variant="standard" fullWidth type="datetime-local" label="Fecha y Hora de Muerte" name="death_at" value={extraData.death_at} onChange={({ target }) => handleValueChange(target)} InputLabelProps={{ shrink: true }} />
                            </>
                        )}
                        <TextField variant="standard" multiline rows={4} fullWidth label='Observaciones' name='observations' value={extraData.observations} onChange={({ target }) => handleValueChange(target)} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                    <Button onClick={handleReleasePatient} variant="contained" color={isDeath ? 'error' : 'success'}>{isDeath ? 'REGISTRAR FALLECIMIENTO' : 'DAR DE ALTA'}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ReleasePatient;
