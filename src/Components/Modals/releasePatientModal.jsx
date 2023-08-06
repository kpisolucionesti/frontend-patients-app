import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem, DialogActions, TextField, Alert, IconButton, Tooltip } from "@mui/material";
import { HealthAndSafetyOutlined } from "@mui/icons-material";
import { useOpenModal } from "../Hooks/useOpenModal";
import { useActions } from "../Hooks/useActions";
import { useCallList } from "../Hooks/useCallsList";

const ReleasePatient = ({ row, onChange, edit }) => {
    const [values, setValues] = useState({})
    const [validation, setValidation] = useState(false)
    const { open, handleOpen, handleClose } = useOpenModal()
    const { rooms, callRoomsList } = useCallList()
    const { handleRelease } = useActions(row, rooms)
  
    useEffect(() => {
        callRoomsList()
        setValidation(false)
        setValues({})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[open])

    const handleValueChange = (target) => {
        setValues({...values, [target.name]:target.value})
    }

    const handleSubmit = () => {
        if(Object.keys(values).length){
            handleRelease(values, 2)
            handleClose()
            setValues({})
            setValidation(false)
            onChange(edit ? false : !edit ? true : false )
        } else {
            setValidation(true)
            alert("SELECCIONE UNA UBICACION")
        }
    }

    return(
    <>  <Tooltip title='Alta Medica' arrow >
            <span>
                <IconButton color="error" onClick={handleOpen} disabled={row.status !== 1 ? true : false} size="large">
                    <HealthAndSafetyOutlined />
                </IconButton>
            </span>
        </Tooltip>
        <Dialog fullWidth maxWidth='xs' open={open} onClose={handleClose} >
            <DialogTitle textAlign="center" sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 'bold' }} >ALTA PACIENTE</DialogTitle>
            <DialogContent dividers>
                <Alert variant="filled" severity="warning" >SE INFORMA QUE UNA VEZ SE DE EL ALTA AL PACIENTE, ESTOS DATOS NO PUEDEN SER MODIFICADOS</Alert>
                <form onSubmit={handleSubmit} >
                    <Stack spacing={2} sx={{ mb: 2, mt: 3 }}>
                        <TextField disabled fullWidth label="Paciente" value={row.name} />
                        <FormControl>
                            <InputLabel>Causas</InputLabel>
                            <Select error={validation}  fullWidth label="Egreso" defaultValue='' required name="medical_exit" value={values.medical_exit} onChange={({target}) => handleValueChange(target)} >
                                <MenuItem key="Mejoria Medica" value="Mejoria Medica">Mejoria Medica</MenuItem>
                                <MenuItem key="Referencia" value="Referencia">Referencia</MenuItem>
                                <MenuItem key="Contra opinion Medica" value="Contra opinion Medica">Contra opinion Medica</MenuItem>
                                <MenuItem key="Muerte" value="Muerte">Muerte</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField multiline rows={4} fullWidth defaultValue="" placeholder="Observaciones..." label='Observaciones' name='observations' value={values.observations} onChange={({target}) => handleValueChange(target)} />
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color="success">DAR DE ALTA</Button>
            </DialogActions>
        </Dialog>    
    </>
    )
}

export default ReleasePatient