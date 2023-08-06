import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem, DialogActions, TextField, Alert, IconButton, Tooltip, FormHelperText } from "@mui/material";
import { TransferWithinAStationOutlined } from "@mui/icons-material";
import { useOpenModal } from "../Hooks/useOpenModal";
import { useActions } from "../Hooks/useActions";
import { useCallList } from "../Hooks/useCallsList";

const MovePatient = ({ row, onChange, edit }) => {
    const [transfer, setTransfer] = useState({})
    const [validation, setValidation] = useState(false)
    const { rooms, callRoomsList } = useCallList()
    const { open, handleOpen, handleClose } = useOpenModal()
    const { handleRelease } = useActions(row, rooms)

    useEffect(() => {
        callRoomsList()
        setTransfer({})
        setValidation(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[open])
    
    const handleSubmit = () => {
        if(Object.keys(transfer).length){
            handleRelease(transfer, 3)
            setTransfer({})
            handleClose()
            setValidation(false)
            onChange(edit ? false : !edit ? true : false)
        } else {
            setValidation(true)
            alert("SELECCIONE UNA UBICACION")
        }
    }

    return(
    <> 
        <Tooltip title='Ingreso' arrow >
            <span>
                <IconButton color="info" onClick={handleOpen} disabled={row.status !== 1 ? true : false} size="large">
                    <TransferWithinAStationOutlined />
                </IconButton>
            </span>
        </Tooltip>
        <Dialog open={open} onClose={handleClose} >
            <DialogTitle textAlign="center" sx={{ bgcolor: 'info.main', color: 'text.primary', fontWeight: 'bold' }}>INGRESO PACIENTE</DialogTitle>
            <DialogContent dividers>
                <Alert variant="filled" severity="warning" >SE INFORMA QUE UNA VEZ SE INGRESE AL PACIENTE, ESTOS DATOS NO PUEDEN SER MODIFICADOS</Alert>
                <form onSubmit={handleSubmit} >
                    <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                        <TextField disabled fullWidth label="Paciente" value={row.name} />
                        <FormControl>
                            <InputLabel>Ubicacion</InputLabel>
                            <Select error={validation} fullWidth label="Ingresado a..." required name="transfer" value={transfer.transfer || ''} onChange={({target}) => setTransfer({[target.name]: target.value})} >
                                <MenuItem key="Quirofano" value="Quirofano">Quirofano</MenuItem>
                                <MenuItem key="Hospitalizacion" value="Hospitalizacion">Hospitalizacion</MenuItem>
                                <MenuItem key="UCI" value="UCI">UCI</MenuItem>
                            </Select>
                            <FormHelperText>Requerido</FormHelperText>
                        </FormControl>
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="success">Ingresar</Button>
            </DialogActions>
        </Dialog>    
    </>
    )
}

export default MovePatient