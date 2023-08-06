import React, { useEffect, useState } from "react";
import { KingBed } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip } from "@mui/material";
import { useOpenModal } from "../Hooks/useOpenModal";
import { useActions } from "../Hooks/useActions";
import { useCallList } from "../Hooks/useCallsList";

const AsignRoom = ({ row }) => {
    const [roomSelected, setRoomSelected] = useState({})
    const [validation, setValidation] = useState(false)
    const { rooms, callRoomsList } = useCallList()
    const { open, handleClose, handleOpen } = useOpenModal()
    const { handleAssingRoom } = useActions(row, rooms)

    useEffect(() => {
        callRoomsList()
        setRoomSelected({})
        setValidation(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[open])

    const handleSubmit = () => {
        if(Object.keys(roomSelected).length){
            handleAssingRoom(roomSelected, row)
            setRoomSelected({})
            handleClose()
            setValidation(false)
        } else {
            setValidation(true)
        }
    }

    return (
        <>
            <Tooltip title='Camas' arrow >
                <span>
                    <IconButton color="warning" onClick={handleOpen} disabled={row.status !== 1 ? true : false} size="large" >
                        <KingBed />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} >
                <DialogTitle textAlign="center" sx={{ bgcolor: 'warning.main', color: 'text.primary', fontWeight: 'bold' }} >CAMBIAR UBICACION</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                            <TextField disabled fullWidth label="Paciente" value={row.name} />
                            <FormControl>
                                <InputLabel>Ubicacion</InputLabel>
                                <Select error={validation} fullWidth label="Ubicación" required name="id" value={roomSelected.id || ''} onChange={({target}) => setRoomSelected(rooms.find(r => r.id === target.value))} >
                                    {rooms.filter(f => f.room_type === 'adulto' && !f.patient_id ).map(r => (
                                        <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </form>
                </DialogContent>
                <DialogActions sx={{ p: '1.25rem' }}>
                    <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="success">Asignar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default AsignRoom