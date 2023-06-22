import React, { useState, useEffect } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem, DialogActions, TextField, Alert, IconButton, Tooltip } from "@mui/material";
import { TransferWithinAStationOutlined } from "@mui/icons-material";

const MovePatient = ({ row }) => {
    const [open, setOpen] = useState(false)
    const [transfer, setTransfer] = useState({})
    const [roomsOcupated, setRoomsOcupated] = useState([])
    const [validation, setValidation] = useState(false)
    
    useEffect(() => {
        BackendAPI.rooms.getAll().then(res => setRoomsOcupated(res))
    },[transfer])
  

    const handleOpen = () => setOpen(true)
    const handleClose = () => {
        setOpen(false)
        setValidation(false)
        setTransfer({})
    }

    const handleReleasePatient = () => {
        let filterRoom = roomsOcupated.find(f => f.patient_id === row.id)
        if(transfer.transfer) {
            BackendAPI.patients.update({...row, ...transfer, status: 3}).then(res => console.log(res))
            BackendAPI.rooms.update({...filterRoom, patient_id: null}).then(res => console.log(res))
            setTransfer({})
            setValidation(false)
            handleClose()
        } else {
            alert("FALTAN DATOS POR LLENAR")
            setValidation(true)
        }
    }

    return(
    <> 
        <Tooltip title='Ingreso' arrow>
            <IconButton color="info" onClick={handleOpen} disabled={row.status !== 1 ? true : false} size="large">
                <TransferWithinAStationOutlined />
            </IconButton>
        </Tooltip>
        <Dialog open={open} onClose={handleClose} >
            <DialogTitle textAlign="center" sx={{ bgcolor: 'info.main', color: 'text.primary', fontWeight: 'bold' }}>INGRESO PACIENTE</DialogTitle>
            <DialogContent dividers>
                <Alert variant="filled" severity="warning" >SE INFORMA QUE UNA VEZ SE INGRESE AL PACIENTE, ESTOS DATOS NO PUEDEN SER MODIFICADOS</Alert>
                <form onSubmit={handleReleasePatient} >
                    <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                        <TextField disabled fullWidth label="Paciente" value={row.name} />
                        <FormControl>
                            <InputLabel>Ubicacion</InputLabel>
                            <Select error={validation} fullWidth label="Ingresado a..." required name="transfer" value={row.transfer} onChange={({target}) => setTransfer({...row, [target.name]:target.value})} >
                                <MenuItem key="Quirofano" value="Quirofano">Quirofano</MenuItem>
                                <MenuItem key="Hospitalizacion" value="Hospitalizacion">Hospitalizacion</MenuItem>
                                <MenuItem key="UCI" value="UCI">UCI</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                <Button onClick={handleReleasePatient} variant="contained" color="success">Ingresar</Button>
            </DialogActions>
        </Dialog>    
    </>
    )
}

export default MovePatient