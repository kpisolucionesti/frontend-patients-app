import React, { useState, useEffect } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { BedOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";

const AsignRoom = ({ patients }) => {
    const [openModal, setOpenModal] = useState(false)
    const [patientSelected, setPatientSelected] = useState({})
    const [roomSelected, setRoomSelected] = useState({})
    const [roomsList, setRoomsList] = useState([])

    useEffect(() => {
        BackendAPI.rooms.getAll().then(res => setRoomsList(res))
    },[])

    const handleSubmit = () => {
        let asignRoom = {...roomSelected, patient_id: patientSelected.id}
        BackendAPI.patients.update({...patientSelected, status: 1}).then(res => console.log(res))
        BackendAPI.rooms.update(asignRoom).then(res => console.log(res))
        setPatientSelected({})
        setRoomSelected({})
        handleClose()
    }

    const handleOpen = () => setOpenModal(true)
    const handleClose = () => {
        setOpenModal(false)
        setPatientSelected({})
        setRoomSelected({})
    }

    return (
        <>
            <Button
                color="info"
                variant="contained"
                startIcon={<BedOutlined />}
                onClick={handleOpen}
            >
                UBICACION
            </Button>
            <Dialog open={openModal} onClose={handleClose} >
                <DialogTitle textAlign="center" sx={{ bgcolor: 'info.main', color: 'text.primary', fontWeight: 'bold' }} >ASIGNAR UBICACION</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                            <FormControl>
                                <InputLabel>Paciente</InputLabel>
                                <Select fullWidth label="Paciente" required name="id" value={patientSelected.id} onChange={({target}) => setPatientSelected(patients.find(p => p.id === target.value))} >
                                    {patients.filter(f => f.status === 0 ).map(p => (
                                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl>
                                <InputLabel>Ubicacion</InputLabel>
                                <Select disabled={!Object.keys(patientSelected).length} fullWidth label="Paciente" required name="id" value={roomSelected.id} onChange={({target}) => setRoomSelected(roomsList.find(r => r.id === target.value))} >
                                    {roomsList.filter(f => patientSelected.age < 12 ? f.room_type === 'pediatria' : f.room_type === 'adulto' && !f.patient_id ).map(r => (
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