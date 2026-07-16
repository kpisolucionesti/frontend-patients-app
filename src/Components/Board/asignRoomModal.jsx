import React, { useCallback, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { KingBed } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip } from "@mui/material";
import { useFetch } from "../../hooks/useFetch";
import { PEDIATRIC_AGE_THRESHOLD } from "../../constants";

const AsignRoom = ({ row, onStatusChange, iconOnly }) => {
    const [openModal, setOpenModal] = useState(false);
    const [roomSelected, setRoomSelected] = useState(null);
    const [validation, setValidation] = useState(false);

    const { data: rooms } = useFetch(() => BackendAPI.rooms.getAll(), []);

    const handleClose = useCallback(() => {
        setOpenModal(false);
        setRoomSelected(null);
    }, []);

    const handleOpen = () => setOpenModal(true);

    const handleSubmit = useCallback(() => {
        if (!roomSelected) {
            alert("FALTAN DATOS POR LLENAR");
            setValidation(true);
            return;
        }
        const currentRoom = (rooms || []).find((f) => f.patient_id === row.patient?.id);
        BackendAPI.rooms.update({ ...roomSelected, patient_id: row.patient?.id });
        if (currentRoom) {
            BackendAPI.rooms.update({ ...currentRoom, patient_id: null });
        }
        setRoomSelected(null);
        setValidation(false);
        handleClose();
        if (onStatusChange) onStatusChange();
    }, [roomSelected, rooms, row.patient?.id, onStatusChange, handleClose]);

    const availableRooms = useMemo(
        () => (rooms || []).filter((r) =>
            ((row.patient?.age || 0) < PEDIATRIC_AGE_THRESHOLD ? r.room_type === 'pediatria' : r.room_type === 'adulto') && !r.patient_id
        ),
        [rooms, row.patient?.age],
    );

    return (
        <>
            {iconOnly ? (
                <Tooltip title='Camas' arrow>
                    <span>
                        <IconButton color="warning" onClick={handleOpen} disabled={row.status !== 1}>
                            <KingBed />
                        </IconButton>
                    </span>
                </Tooltip>
            ) : (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<KingBed />}
                    onClick={handleOpen}
                    disabled={row.status !== 1}
                    sx={{ color: '#ed6c02', borderColor: '#ed6c02', '&:hover': { borderColor: '#ed6c02', bgcolor: '#fff3e0' } }}
                >
                    Cama
                </Button>
            )}
            <Dialog open={openModal} onClose={handleClose}>
                <DialogTitle textAlign="center" sx={{ bgcolor: 'warning.main', color: 'text.primary', fontWeight: 'bold' }}>
                    CAMBIAR UBICACION
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                        <TextField variant="standard" disabled fullWidth label="Paciente" value={`${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim()} />
                        <FormControl>
                            <InputLabel>Ubicacion</InputLabel>
                            <Select variant="standard" error={validation} fullWidth label="Ubicacion" required name="id" value={roomSelected?.id || ''} onChange={({ target }) => setRoomSelected(availableRooms.find((r) => r.id === target.value) || null)}>
                                {availableRooms.map((r) => (
                                    <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="success">Asignar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AsignRoom;
