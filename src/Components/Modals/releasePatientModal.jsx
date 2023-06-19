import React, { useState, useEffect } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem, DialogActions, TextField, Alert } from "@mui/material";
import { HealthAndSafetyOutlined } from "@mui/icons-material";

const ReleasePatient = ({ row }) => {
    const [open, setOpen] = useState(false)
    const [roomsOcupated, setRoomsOcupated] = useState([])
    const [extraData, setExtraData] = useState({})
    const [validation, setValidation] = useState(false)
    
    useEffect(() => {
        BackendAPI.rooms.getAll().then(res => setRoomsOcupated(res))
    },[extraData])
  
    const handleOpen = () => setOpen(true)
    const handleClose = () => {
        setValidation(false)
        setOpen(false)
    }

    const handleReleasePatient = () => {
        let filterRoom = roomsOcupated.find(f => f.patient_id === row.id)
        if(extraData.medical_exit || extraData.observations) {
            BackendAPI.patients.update({...extraData, status: 2}).then(res => console.log(res))
            BackendAPI.rooms.update({...filterRoom, patient_id: null}).then(res => console.log(res))
            setExtraData({})
            setValidation(false)
            handleClose()
        } else {
            alert("FALTAN DATOS POR LLENAR")
            setValidation(true)
        }
    }

    return(
    <>
        <Button
            startIcon={<HealthAndSafetyOutlined />}
            variant="contained"
            color="error"
            onClick={handleOpen}
            disabled={row.status !== 1 ? true : false}
        />
        <Dialog fullWidth maxWidth='xs' open={open} onClose={handleClose} >
            <DialogTitle textAlign="center" sx={{ bgcolor: 'error.main', color: 'text.primary', fontWeight: 'bold' }} >ALTA PACIENTE</DialogTitle>
            <DialogContent dividers>
                <Alert variant="filled" severity="warning" >SE INFORMA QUE UNA VEZ SE DE EL ALTA AL PACIENTE, ESTOS DATOS NO PUEDEN SER MODIFICADOS</Alert>
                <form onSubmit={handleReleasePatient} >
                    <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                        <TextField disabled fullWidth label="Paciente" value={row.name} />
                        <FormControl>
                            <InputLabel>Causas</InputLabel>
                            <Select error={validation}  fullWidth label="Egreso" required name="medical_exit" value={row.medical_exit} onChange={({target}) => setExtraData({...row, [target.name]:target.value})} >
                                <MenuItem key="Mejoria Medica" value="Mejoria Medica">Mejoria Medica</MenuItem>
                                <MenuItem key="Referencia" value="Referencia">Referencia</MenuItem>
                                <MenuItem key="Contra opinion Medica" value="Contra opinion Medica">Contra opinion Medica</MenuItem>
                                <MenuItem key="Muerte" value="Muerte">Muerte</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField multiline rows={4} fullWidth defaultValue="" placeholder="Observaciones..." label='Observaciones' name='observations' value={row.observations} onChange={({target}) => setExtraData({...row, [target.name]:target.value})} />
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                <Button onClick={handleReleasePatient} variant="contained" color="success">DAR DE ALTA</Button>
            </DialogActions>
        </Dialog>    
    </>
    )
}

export default ReleasePatient