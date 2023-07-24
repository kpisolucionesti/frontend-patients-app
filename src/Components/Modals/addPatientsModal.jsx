import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Select, MenuItem, FormControl, InputLabel, Button, FormHelperText } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AddCircleOutlineRounded, CheckCircle } from '@mui/icons-material'
import { BackendAPI } from "../../services/BackendApi";
import moment from 'moment';


export const CreatePatients = ({ onSubmit }) => {

    const [values, setValues] = useState({});
    const [openModal, setOpenModal] = useState(false)
    const [doctorsList, setDoctorsList] = useState([])
    const [patientsList, setPatientsList] = useState([])
    const [currentDate, setCurrentDate] = useState("")
    const [roomsList, setRoomsList] = useState([])
    const [roomSelected, setRoomSelected] = useState({})
    const [validation, setValidation] = useState(false)
    const [check, setCheck] = useState(0)
    
    useEffect(() => {
      BackendAPI.doctors.getAll().then((res) => setDoctorsList(res) )
      BackendAPI.patients.getAll().then((res) => setPatientsList(res) )
      BackendAPI.rooms.getAll().then((res) => setRoomsList(res))
      setCurrentDate(moment().format('DD/M/YYYY'))
    },[])

    const validationPatient = () => {
      if(Object.keys(values).length){
        let filterPatient = patientsList.find(f => f.ci === values.ci)
        if(typeof filterPatient !== 'undefined' ) {
            setValues({ingress_date: currentDate, ci: filterPatient.ci, name: filterPatient.name, age: filterPatient.age, gender: filterPatient.gender})
            setCheck(2)
        } else {
          setValues({...values, ingress_date: currentDate, name: '', age: '', gender: ''})
          setCheck(2)
        }
      }
    }


  	const handleValueChange = (target) => {
      setValues({...values, status: 1, [target.name]:target.value})
      if(check === 0 ) {
        setCheck(1)
      }
    }

    const handleOpen = () => {
      setOpenModal(true)
    }

    const handleClose = () => {
      setValues({})
      setValidation(false)
      setOpenModal(false)
      setCheck(0)
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
          setCheck(false)
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
              <TextField variant="outlined" error={validation} defaultValue="" helperText='Requerido' required label="Cedula" name="ci" value={values.ci} onChange={({target})=>handleValueChange(target)}/>
              <TextField variant="outlined" defaultValue={currentDate} label='Fecha de Ingreso' name="ingress_date" disabled />
              <Button disabled={ check === 1 || check === 2 ? false : true } onClick={validationPatient} variant="contained" startIcon={<CheckCircle />} >VALIDAR</Button>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField variant="outlined" disabled={ check === 2 ? false : true } error={validation} fullWidth defaultValue="" helperText='Requerido' required placeholder="Nombre y Apellido" name="name" value={values.name} onChange={({target})=>handleValueChange(target)}/>
              <TextField variant="outlined" disabled={ check === 2 ? false : true } error={validation} defaultValue="" helperText='Requerido' required placeholder="Edad" name="age" value={values.age}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth>
                <InputLabel>Genero</InputLabel>
                <Select variant="outlined" disabled={ check === 2 ? false : true } error={validation} required defaultValue="" placeholder="Genero" label="Genero" name='gender' value={values.gender}	onChange={({target})=>handleValueChange(target)}>
                  <MenuItem key="Masculino" value='Masculino'>Masculino</MenuItem>
                  <MenuItem key="Femenino" value='Femenino'>Femenino</MenuItem>
                  <MenuItem key="Otro" value='Otros'>Otros</MenuItem>
                </Select>
                <FormHelperText>Requerido</FormHelperText>
              </FormControl>
            </Stack>
            <Stack >
              <TextField variant="outlined" disabled={ check === 2 ? false : true } defaultValue="" sx={{ mb: 3}} fullWidth placeholder="Diagnostico" 	name="current_diagnostic" value={values.current_diagnostic}		onChange={({target})=>handleValueChange(target)}/>
              <TextField variant="outlined" disabled={ check === 2 ? false : true } defaultValue="" sx={{ mb: 3}} fullWidth placeholder="Plan" name="treatment" value={values.treatment}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth sx={{ mb: 3}}>
                <InputLabel>Medico Tratante</InputLabel>
                <Select variant="outlined" disabled={ check === 2 ? false : true } defaultValue="" placeholder="Medico Tratante" label="Medico Tratante" name="current_doctor" value={values.current_doctor} onChange={({target})=> handleValueChange(target)}>
                  {doctorsList.map(doctor=>(
                    <MenuItem key={doctor.id} value={doctor.name}>{doctor.name} -- {doctor.speciality} </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Ubicacion</InputLabel>
                <Select variant="outlined" error={validation} disabled={check === 2 ? false : true} defaultValue='' fullWidth label="Paciente" required name="id" value={roomSelected.id} onChange={({target}) => setRoomSelected(roomsList.find(r => r.id === target.value))} >
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