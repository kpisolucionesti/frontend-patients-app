import React, { useState, useEffect } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem, DialogActions } from "@mui/material";
import { HealthAndSafetyOutlined } from "@mui/icons-material";

const ReleasePatient = ({ patients }) => {
    const [open, setOpen] = useState(false)
    const [patientSelect, setPatientSelect] = useState({})
    const [roomsOcupated, setRoomsOcupated] = useState([])
    
    useEffect(() => {
        BackendAPI.rooms.getAll().then(res => setRoomsOcupated(res))
    },[patientSelect])
  

    const handleOpen = () => setOpen(true)
    const handleClose = () => {
        setOpen(false)
        setPatientSelect({})
    }

    const handleReleasePatient = () => {
        let filterRoom = roomsOcupated.find(f => f.patient_id === patientSelect.id)
        let changeStatusPatent = {...patientSelect, status: 2}
        let changeRoomStatus = {...filterRoom, patient_id: null}

        console.log(filterRoom)
        console.log(changeRoomStatus)
        console.log(changeStatusPatent)
        
        BackendAPI.patients.update(changeStatusPatent).then(res => console.log(res))
        BackendAPI.rooms.update(changeRoomStatus).then(res => console.log(res))
        setPatientSelect({})
        handleClose()

    }

    return(
    <>
        <Button
            startIcon={<HealthAndSafetyOutlined />}
            variant="contained"
            color="error"
            onClick={handleOpen}
            >
            ALTA
        </Button>
        <Dialog open={open} onClose={handleClose} >
            <DialogTitle textAlign="center" >ALTA PACIENTE</DialogTitle>
            <DialogContent>
                <form onSubmit={handleReleasePatient} >
                    <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                        <FormControl>
                            <InputLabel>Paciente</InputLabel>
                            <Select fullWidth label="Paciente" required name="id" value={patientSelect.id} onChange={({target}) => setPatientSelect(patients.find(f => f.id === target.value))} >
                                {patients.filter(f => f.status === 1 ).map(p => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <InputLabel>Ubicacion</InputLabel>
                            <Select fullWidth label="Egreso" required name="medical_exit" value={patientSelect.medical_exit} onChange={({target}) => setPatientSelect({...patientSelect, [target.name]:target.value})} >
                                <MenuItem key="Mejoria Medica" value="Mejoria Medica">Mejoria Medica</MenuItem>
                                <MenuItem key="Referencia" value="Referencia">Referencia</MenuItem>
                                <MenuItem key="Contra opinion Medica" value="Contra opinion Medica">Contra opinion Medica</MenuItem>
                                <MenuItem key="Muerte" value="Muerte">Muerte</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                <Button onClick={handleReleasePatient} variant="contained" color="success">Asignar</Button>
            </DialogActions>
        </Dialog>    
    </>
    )
}

export default ReleasePatient