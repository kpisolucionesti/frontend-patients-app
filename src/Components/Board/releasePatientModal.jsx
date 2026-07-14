import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem, DialogActions, TextField, Alert, IconButton, Tooltip } from "@mui/material";
import { HealthAndSafetyOutlined } from "@mui/icons-material";
import { useFetch } from "../../hooks/useFetch";

const EXIT_REASONS = ['Mejoria Medica', 'Referencia', 'Contra opinion Medica', 'Muerte'];

const ReleasePatient = ({ row, onStatusChange }) => {
    const [open, setOpen] = useState(false);
    const [extraData, setExtraData] = useState({ medical_exit: '', observations: '' });
    const [validation, setValidation] = useState(false);

    const { data: rooms = [] } = useFetch(() => BackendAPI.rooms.getAll(), [open]);

    const handleOpen = () => setOpen(true);

    const handleClose = useCallback(() => {
        setOpen(false);
        setValidation(false);
        setExtraData({ medical_exit: '', observations: '' });
    }, []);

    const handleValueChange = useCallback((target) => {
        setExtraData((prev) => ({ ...prev, [target.name]: target.value }));
    }, []);

    const handleReleasePatient = useCallback(() => {
        if (!extraData.medical_exit) {
            alert("FALTAN DATOS POR LLENAR");
            setValidation(true);
            return;
        }
        const currentRoom = rooms.find((f) => f.patient_id === row.patient?.id);
        BackendAPI.emergencies.update({ id: row.id, ...extraData, status: 2 });
        if (currentRoom) {
            BackendAPI.rooms.update({ ...currentRoom, patient_id: null });
        }
        setExtraData({ medical_exit: '', observations: '' });
        setValidation(false);
        if (onStatusChange) onStatusChange();
        handleClose();
    }, [extraData, rooms, row, onStatusChange, handleClose]);

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
                    ALTA PACIENTE
                </DialogTitle>
                <DialogContent dividers>
                    <Alert variant="filled" severity="warning">
                        SE INFORMA QUE UNA VEZ SE DE EL ALTA AL PACIENTE, ESTOS DATOS NO PUEDEN SER MODIFICADOS
                    </Alert>
                    <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                        <TextField disabled fullWidth label="Paciente" value={row.patient?.name || ''} />
                        <FormControl>
                            <InputLabel>Causas</InputLabel>
                            <Select error={validation} fullWidth label="Egreso" required name="medical_exit" value={extraData.medical_exit} onChange={({ target }) => handleValueChange(target)}>
                                {EXIT_REASONS.map((r) => (
                                    <MenuItem key={r} value={r}>{r}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField multiline rows={4} fullWidth label='Observaciones' name='observations' value={extraData.observations} onChange={({ target }) => handleValueChange(target)} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                    <Button onClick={handleReleasePatient} variant="contained" color="success">DAR DE ALTA</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ReleasePatient;
