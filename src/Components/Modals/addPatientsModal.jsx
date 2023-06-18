import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AddCircleOutlineRounded } from '@mui/icons-material'
import { BackendAPI } from "../../services/BackendApi";


export const CreatePatients = ({ onSubmit }) => {

    const [values, setValues] = useState({});
    const [openModal, setOpenModal] = useState(false)
    const [doctorsList, setDoctorsList] = useState([])
    const [patientsList, setPatientsList] = useState([])
    
    useEffect(() => {
      BackendAPI.doctors.getAll().then((res) => setDoctorsList(res) )
      BackendAPI.patients.getAll().then((res) => setPatientsList(res) )
    },[])

    const validationPatient = () => {
      if(Object.keys(values).length){
        let check = patientsList.find(f => f.ci === values.ci)
        if(typeof check !== 'undefined' ) {
          setValues(check)
        } 
      } 
    }

  	const handleValueChange = (target) => {
      const current = new Date()
      const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`
      setValues({...values, status: 0, ingress_date: date, [target.name]:target.value})
      console.log(values)
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
        onSubmit(values)
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
      <Dialog fullWidth maxWidth='sm' open={openModal} onClose={handleClose} >
        <DialogTitle textAlign="center" sx={{ bgcolor: 'success.main', color: 'text.primary', fontWeight: 'bold' }}>AGREGAR PACIENTE</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack useFlexGap direction="row" spacing={2} sx={{ mb: 2, mt: 3 }}>	
              <TextField defaultValue="" fullWidth helperText='Requerido' required label="Cedula" name="ci" value={values.ci} onChange={({target})=>handleValueChange(target)}/>
              <Button onClick={validationPatient} variant="contained" >VALIDAR</Button>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField defaultValue="" fullWidth helperText='Requerido' required placeholder="Nombre y Apellido" name="name" value={values.name} onChange={({target})=>handleValueChange(target)}/>
              <TextField defaultValue="" fullWidth helperText='Requerido' required placeholder="Edad" name="age" value={values.age}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth>
                <InputLabel>Genero</InputLabel>
                <Select defaultValue="" placeholder="Genero" label="Genero" helperText='Requerido' required name='gender' value={values.gender}	onChange={({target})=>handleValueChange(target)}>
                  <MenuItem key="Masculino" value='Masculino'>Masculino</MenuItem>
                  <MenuItem key="Femenino" value='Femenino'>Femenino</MenuItem>
                  <MenuItem key="Otro" value='Otros'>Otros</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack>
              <TextField defaultValue="" sx={{ mb: 3}} fullWidth placeholder="Diagnostico" 	name="current_diagnostic" value={values.current_diagnostic}		onChange={({target})=>handleValueChange(target)}/>
              <TextField defaultValue="" sx={{ mb: 3}} fullWidth placeholder="Plan" name="treatment" value={values.treatment}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth sx={{ mb: 3}}>
                <InputLabel>Medico Tratante</InputLabel>
                <Select defaultValue="" placeholder="Medico Tratante" label="Medico Tratante" name="current_doctor" value={values.current_doctor} onChange={({target})=> handleValueChange(target)}>
                  {doctorsList.map(doctor=>(
                    <MenuItem key={doctor.id} value={doctor.name}>{doctor.name}</MenuItem>
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