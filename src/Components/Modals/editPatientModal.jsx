import React, { useEffect, useState } from "react";
import moment from "moment";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Select, MenuItem, FormControl, InputLabel, Button, IconButton, Tooltip, FormHelperText } from "@mui/material";
import { Edit } from '@mui/icons-material';
import { useOpenModal } from "../Hooks/useOpenModal";
import { useActions } from "../Hooks/useActions";
import { useCallList } from "../Hooks/useCallsList";


export const EditPatients = ({ row }) => {

    const [values, setValues] = useState(row)
    const [validation, setValidation] = useState(false)
    const { open, handleClose, handleOpen } = useOpenModal()
    const { handleEdit } = useActions(row)
    const { doctors, callDoctorsList } = useCallList()

    useEffect(() => {
      callDoctorsList()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

  	const handleValueChange = (target) => {
      setValues({...values, id: row.id, [target.name]:target.value})
    }

    const handleSubmit = (event) => {
      event.preventDefault()
      if(!Object.keys(values).length){
        alert("POR FAVOR LLENAR EL FORMULARIO")
      } else {
        if( !values.ci || !values.name || !values.age || !values.gender) {
          setValidation(true)
          alert("FALTAN DATOS POR LLENAR")
        } else {
          let data = {...values, ingress_date: moment(values.ingress_date, 'MM/DD/YYYY').format('DD/M/YYYY')}
          handleEdit(data)
          handleClose()
          setValidation(false)
        }
      }
    }
  
    return (
      <>
      <Tooltip title='Editar' arrow >
        <span>
          <IconButton color="success" onClick={handleOpen} disabled={row.status !== 1 ? true : false} size="large"  >
            <Edit />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} >
        <DialogTitle textAlign="center" sx={{ bgcolor: 'success.main', color: 'text.primary', fontWeight: 'bold' }}>EDITAR PACIENTE</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 3 }}>	
              <TextField error={validation} fullWidth helperText='Requerido' required label="Cedula" name="ci" value={values.ci} onChange={({target})=>handleValueChange(target)}/>
              <TextField error={validation} fullWidth helperText='Requerido' required label="Nombre y Apellido" name="name"	value={values.name} onChange={({target})=>handleValueChange(target)}/>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField error={validation} fullWidth helperText='Requerido' required label="Edad" name="age" value={values.age}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth>
                <InputLabel>Genero</InputLabel>
                <Select error={validation} label="Genero" required name='gender' value={values.gender}	onChange={({target})=>handleValueChange(target)}>
                  <MenuItem key="Masculino" value='Masculino'>Masculino</MenuItem>
                  <MenuItem key="Femenino" value='Femenino'>Femenino</MenuItem>
                  <MenuItem key="Otro" value='Otros'>Otros</MenuItem>
                </Select>
                <FormHelperText>Requerido</FormHelperText>
              </FormControl>
            </Stack>
            <Stack>
              <TextField sx={{ mb: 3}} fullWidth label="Diagnostico" 	name="current_diagnostic" value={values.current_diagnostic}		onChange={({target})=>handleValueChange(target)}/>
              <TextField sx={{ mb: 3}} fullWidth label="Plan" name="treatment" value={values.treatment}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth sx={{ mb: 3}}>
                <InputLabel>Medico Tratante</InputLabel>
                <Select label="Medico Tratante" name="current_doctor" value={values.current_doctor} onChange={({target})=> setValues({...values,[target.name]:target.value})}>
                  {doctors.map(doctor=>(
                    <MenuItem key={doctor.id} value={doctor.name}>{doctor.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={handleClose} variant="contained" color='error'>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color='success'>Guardar</Button>
        </DialogActions>
      </Dialog>
      </>
    );
};

export default EditPatients