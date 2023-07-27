import { NoteAdd } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const NotesPatient = ({ row }) => {
    const [values, setValues] = useState({})
    const [open, setOpen] = useState(false)

    const handleCreateNote = () => {
        BackendAPI.notes.create({...values, patient_id: row.id}).then()
        handleClose()
    }

    const handleOpen = () => setOpen(true)

    const handleClose = () => {
        setValues({})
        setOpen(false)
    }

    return (
    <>
        <Tooltip title='Notas' arrow >
            <span>
                <IconButton color="secondary" onClick={handleOpen} disabled={row.status !== 1 ? true : false} >
                    <NoteAdd />
                </IconButton>
            </span>
        </Tooltip>
        <Dialog fullWidth maxWidth='xs' open={open} onClose={handleClose} >
            <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }} textAlign='center'>AGREGAR NOTA PACIENTE</DialogTitle>
            <DialogContent dividers >
                <form onSubmit={handleCreateNote}>
                    <Stack spacing={2}>
                        <TextField disabled fullWidth label='Paciente' value={row.name} />
                        <TextField multiline rows={4} fullWidth defaultValue='' placeholder="Notas" label='Notas' name="note" onChange={({target}) => setValues({[target.name]: target.value})} />
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions >
                <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                <Button onClick={handleCreateNote} variant='contained' color="success">Agregar</Button>
            </DialogActions>
        </Dialog>
    </>
    )
}

export default NotesPatient