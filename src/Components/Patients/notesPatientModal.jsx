import { NoteAdd } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const NotesPatient = ({ row, onNoteAdded }) => {
    const [note, setNote] = useState('');
    const [open, setOpen] = useState(false);

    const handleClose = useCallback(() => {
        setNote('');
        setOpen(false);
    }, []);

    const handleOpen = () => setOpen(true);

    const patientId = row.patient?.id || row.patient_id;
    const handleCreateNote = useCallback(() => {
        if (!note.trim()) return;
        BackendAPI.notes.create({ note, patient_id: patientId });
        if (onNoteAdded) onNoteAdded();
        handleClose();
    }, [note, patientId, onNoteAdded, handleClose]);

    return (
        <>
            <Tooltip title='Notas' arrow>
                <span>
                    <IconButton color="secondary" onClick={handleOpen} disabled={row.status !== 1}>
                        <NoteAdd />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog fullWidth maxWidth='xs' open={open} onClose={handleClose}>
                <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }} textAlign='center'>
                    AGREGAR NOTA PACIENTE
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        <TextField disabled fullWidth label='Paciente' value={row.patient?.name || row.name || ''} />
                        <TextField multiline rows={4} fullWidth placeholder="Notas" label='Notas' value={note} onChange={({ target }) => setNote(target.value)} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                    <Button onClick={handleCreateNote} variant='contained' color="success">Agregar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default NotesPatient;
