import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem, DialogActions, TextField, Alert, IconButton, Tooltip, FormHelperText } from "@mui/material";
import { TransferWithinAStationOutlined } from "@mui/icons-material";
import { useFetch } from "../../hooks/useFetch";

const TRANSFER_OPTIONS = ['Quirofano', 'Hospitalizacion', 'UCI'];

const IngressPatientModal = ({ row, onStatusChange }) => {
    const [open, setOpen] = useState(false);
    const [transfer, setTransfer] = useState('');
    const [validation, setValidation] = useState(false);

    const { data: rooms = [] } = useFetch(() => BackendAPI.rooms.getAll(), [open]);

    const handleOpen = () => setOpen(true);

    const handleClose = useCallback(() => {
        setOpen(false);
        setValidation(false);
        setTransfer('');
    }, []);

    const handleIngressPatient = useCallback(() => {
        if (!transfer) {
            alert("FALTAN DATOS POR LLENAR");
            setValidation(true);
            return;
        }
        const currentRoom = rooms.find((f) => f.patient_id === row.patient?.id);
        BackendAPI.emergencies.update({ id: row.id, transfer, status: 3 });
        if (currentRoom) {
            BackendAPI.rooms.update({ ...currentRoom, patient_id: null });
        }
        setTransfer('');
        setValidation(false);
        if (onStatusChange) onStatusChange();
        handleClose();
    }, [transfer, rooms, row, onStatusChange, handleClose]);

    return (
        <>
            <Tooltip title='Ingreso' arrow>
                <span>
                    <IconButton color="info" onClick={handleOpen} disabled={row.status !== 1}>
                        <TransferWithinAStationOutlined />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle textAlign="center" sx={{ bgcolor: 'info.main', color: 'text.primary', fontWeight: 'bold' }}>
                    INGRESO PACIENTE
                </DialogTitle>
                <DialogContent dividers>
                    <Alert variant="filled" severity="warning">
                        SE INFORMA QUE UNA VEZ SE INGRESE AL PACIENTE, ESTOS DATOS NO PUEDEN SER MODIFICADOS
                    </Alert>
                    <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                        <TextField variant="standard" disabled fullWidth label="Paciente" value={`${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim()} />
                        <FormControl>
                            <InputLabel>Ubicacion</InputLabel>
                            <Select variant="standard" error={validation} fullWidth label="Ingresado a..." required name="transfer" value={transfer} onChange={({ target }) => setTransfer(target.value)}>
                                {TRANSFER_OPTIONS.map((opt) => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Requerido</FormHelperText>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={handleClose} variant="outlined" color="error">Cancelar</Button>
                    <Button onClick={handleIngressPatient} variant="outlined" color="success">Ingresar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default IngressPatientModal;
