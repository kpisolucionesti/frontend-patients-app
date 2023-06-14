import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AddCircleOutlineRounded } from '@mui/icons-material'
import { BackendAPI } from "../../services/BackendApi";


export const CreatePatients = ({ onSubmit }) => {

    const [values, setValues] = useState({});
    const [openModal, setOpenModal] = useState(false)
    const [doctorsList, setDoctorsList] = useState([])
    
    useEffect(() => {
      BackendAPI.doctors.getAll().then((res) => setDoctorsList(res) )
    },[])

  	const handleValueChange = (target) => {
      setValues({...values, medical_exit: "", status: 0, [target.name]:target.value})
    }

    const handleOpen = () => {
      setOpenModal(true)
    }

    const handleClose = () => {
      setValues({})
      setOpenModal(false)
    }    

    const handleSubmit = (event) => {
      event.preventDefault()
      if(!Object.keys(values).length){
        alert("POR FAVOR LLENAR EL FORMULARIO")
      } else {
        const current = new Date()
        const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`
        onSubmit({...values, ingress_date: date});
        handleClose();
      }
    };
  
    return (
      <>
      <Button
        color="success"
        onClick={handleOpen}
        variant="contained"
        startIcon={<AddCircleOutlineRounded />}
      > 
        PACIENTE
      </Button> 
      <Dialog open={openModal} onClose={handleClose} >
        <DialogTitle textAlign="center" sx={{ bgcolor: 'success.main', color: 'text.primary', fontWeight: 'bold' }}>AGREGAR PACIENTE</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 3 }}>	
              <TextField fullWidth helperText='Campo requerido' required label="Cedula" name="ci" value={values.ci} onChange={({target})=>handleValueChange(target)}/>
              <TextField fullWidth helperText='Campo requerido' required label="Nombre y Apellido" name="name"	value={values.name} onChange={({target})=>handleValueChange(target)}/>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField fullWidth helperText='Campo requerido' required label="Edad" name="age" value={values.age}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth>
                <InputLabel>Genero</InputLabel>
                <Select label="Genero" helperText='Campo requerido' required name='gender' value={values.gender}	onChange={({target})=>handleValueChange(target)}>
                  <MenuItem key="Masculino" value='Masculino'>Masculino</MenuItem>
                  <MenuItem key="Femenino" value='Femenino'>Femenino</MenuItem>
                  <MenuItem key="Otro" value='Otros'>Otros</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack>
              <TextField sx={{ mb: 3}} fullWidth label="Diagnostico" 	name="current_diagnostic" value={values.current_diagnostic}		onChange={({target})=>handleValueChange(target)}/>
              <TextField sx={{ mb: 3}} fullWidth label="Plan" name="treatment" value={values.treatment}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth sx={{ mb: 3}}>
                <InputLabel>Medico Tratante</InputLabel>
                <Select label="Medico Tratante" name="current_doctor" value={values.current_doctor} onChange={({target})=> handleValueChange(target)}>
                  {doctorsList.map(doctor=>(
                    <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: '1.25rem' }}>
          <Button onClick={handleClose} variant="contained" color='error'>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color='success'>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
      </>
    );
};

export default CreatePatients