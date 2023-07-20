import React, { useState, useEffect } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { KingBed } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip } from "@mui/material";

const AsignRoom = ({ row }) => {
    const [openModal, setOpenModal] = useState(false)
    const [roomSelected, setRoomSelected] = useState({})
    const [roomsList, setRoomsList] = useState([])
    const [validation, setValidation] = useState(false)

    useEffect(() => {
        BackendAPI.rooms.getAll().then(res => setRoomsList(res))
    },[roomSelected])

    const handleSubmit = () => {
        let removeRoom = roomsList.find(f => f.patient_id === row.id)
        if(roomSelected) {
            BackendAPI.rooms.update({...roomSelected, patient_id: row.id}).then(res => console.log(res))
            BackendAPI.rooms.update({...removeRoom, patient_id: null}).then(res => console.log(res))
            setValidation(false)
            setRoomSelected({})
            handleClose()
        } else {
            alert("FALTAN DATOS POR LLENAR")
            setValidation(true)
        }
    }

    const handleOpen = () => setOpenModal(true)
    const handleClose = () => {
        setOpenModal(false)
        setRoomSelected({})
    }

    return (
        <>
            <Tooltip title='Camas' arrow>
                <IconButton color="warning" onClick={handleOpen} disabled={row.status !== 1 ? true : false} size="large" >
                    <KingBed />
                </IconButton>
            </Tooltip>
            <Dialog open={openModal} onClose={handleClose} >
                <DialogTitle textAlign="center" sx={{ bgcolor: 'warning.main', color: 'text.primary', fontWeight: 'bold' }} >CAMBIAR UBICACION</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                            <TextField disabled fullWidth label="Paciente" value={row.name} />
                            <FormControl>
                                <InputLabel>Ubicacion</InputLabel>
                                <Select error={validation} fullWidth label="Ubicacion" defaultValue='' required name="id" value={roomSelected.id} onChange={({target}) => setRoomSelected(roomsList.find(r => r.id === target.value))} >
                                    {roomsList.filter(f => row.age < 12 ? f.room_type === 'pediatria' : f.room_type === 'adulto' && !f.patient_id ).map(r => (
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