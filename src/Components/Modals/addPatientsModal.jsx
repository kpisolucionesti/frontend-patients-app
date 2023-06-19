import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Select, MenuItem, FormControl, InputLabel, Button, FormHelperText } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AddCircleOutlineRounded } from '@mui/icons-material'
import { BackendAPI } from "../../services/BackendApi";


export const CreatePatients = ({ onSubmit }) => {

    const [values, setValues] = useState({});
    const [openModal, setOpenModal] = useState(false)
    const [doctorsList, setDoctorsList] = useState([])
    const [patientsList, setPatientsList] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [roomsList, setRoomsList] = useState([])
    const [roomSelected, setRoomSelected] = useState({})
    const [validation, setValidation] = useState(false)
    
    useEffect(() => {
      BackendAPI.doctors.getAll().then((res) => setDoctorsList(res) )
      BackendAPI.patients.getAll().then((res) => setPatientsList(res) )
      BackendAPI.rooms.getAll().then((res) => setRoomsList(res))
      const newDate = `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`
      setCurrentDate(newDate)
    },[])

    const validationPatient = () => {
      if(Object.keys(values).length){
        let check = patientsList.find(f => f.ci === values.ci)
        if(typeof check !== 'undefined' ) {
            setValues({ingress_date: currentDate, ci: check.ci, name: check.name, age: check.age, gender: check.gender})
        } else {
          setValues({...values, ingress_date: currentDate, name: '', age: '', gender: ''})
        }
      }
    }


  	const handleValueChange = (target) => {
      setValues({...values, status: 1, [target.name]:target.value})
    }

    const handleOpen = () => {
      setOpenModal(true)
    }

    const handleClose = () => {
      setValues({})
      setValidation(false)
      setOpenModal(false)
    }    

    const handleSubmit = (event) => {
      event.preventDefault()
      if(!Object.keys(values).length){
        alert("POR FAVOR LLENAR EL FORMULARIO")
      } else {
        if( !values.ci || !values.name || !values.age || !values.gender || !roomSelected.id) {
          alert("FALTAN DATOS POR LLENAR")
          setValidation(true)
        } else {
          onSubmit(values, roomSelected)
          setValidation(false)
          handleClose();
        }
      }
      setRoomSelected({})
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
            <Stack useFlexGap direction="row" spacing={1} sx={{ mb: 2, mt: 3 }}>	
              <TextField error={validation} defaultValue="" helperText='Requerido' required label="Cedula" name="ci" value={values.ci} onChange={({target})=>handleValueChange(target)}/>
              <TextField defaultValue={currentDate} helperText='Fecha de Ingreso' label='F. Ingreso' name="ingress_date" disabled />
              <Button onClick={validationPatient} variant="contained" >VALIDAR</Button>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField error={validation} fullWidth defaultValue="" helperText='Requerido' required placeholder="Nombre y Apellido" name="name" value={values.name} onChange={({target})=>handleValueChange(target)}/>
              <TextField error={validation} defaultValue="" helperText='Requerido' required placeholder="Edad" name="age" value={values.age}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth>
                <InputLabel>Genero</InputLabel>
                <Select error={validation} required defaultValue="" placeholder="Genero" label="Genero" name='gender' value={values.gender}	onChange={({target})=>handleValueChange(target)}>
                  <MenuItem key="Masculino" value='Masculino'>Masculino</MenuItem>
                  <MenuItem key="Femenino" value='Femenino'>Femenino</MenuItem>
                  <MenuItem key="Otro" value='Otros'>Otros</MenuItem>
                </Select>
                <FormHelperText>Requerido</FormHelperText>
              </FormControl>
            </Stack>
            <Stack >
              <TextField defaultValue="" sx={{ mb: 3}} fullWidth placeholder="Diagnostico" 	name="current_diagnostic" value={values.current_diagnostic}		onChange={({target})=>handleValueChange(target)}/>
              <TextField defaultValue="" sx={{ mb: 3}} fullWidth placeholder="Plan" name="treatment" value={values.treatment}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth sx={{ mb: 3}}>
                <InputLabel>Medico Tratante</InputLabel>
                <Select defaultValue="" placeholder="Medico Tratante" label="Medico Tratante" name="current_doctor" value={values.current_doctor} onChange={({target})=> handleValueChange(target)}>
                  {doctorsList.map(doctor=>(
                    <MenuItem key={doctor.id} value={doctor.name}>{doctor.name} -- {doctor.speciality} </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Ubicacion</InputLabel>
                <Select error={validation} helperText='Requerido' disabled={Object.keys(values).length ? false : true} fullWidth label="Paciente" required name="id" value={roomSelected.id} onChange={({target}) => setRoomSelected(roomsList.find(r => r.id === target.value))} >
                  {roomsList.filter(f => values.age < 12 ? f.room_type === 'pediatria' : f.room_type === 'adulto' && !f.patient_id ).map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
                </Select>
                <FormHelperText>Requerido</FormHelperText>
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