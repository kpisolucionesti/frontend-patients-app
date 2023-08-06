import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Select, MenuItem, FormControl, InputLabel, Button, FormHelperText } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AddCircleOutlineRounded, CheckCircle } from '@mui/icons-material'
import moment from 'moment';
import { useOpenModal } from "../Hooks/useOpenModal";
import { useCallList } from "../Hooks/useCallsList";
import { useActions } from "../Hooks/useActions";


export const CreatePatients = ({ row, patientsList }) => {

    const [values, setValues] = useState({});
    const [currentDate, setCurrentDate] = useState("")
    const [roomSelected, setRoomSelected] = useState({})
    const [validation, setValidation] = useState(false)
    const { rooms, doctors, callDoctorsList, callRoomsList } = useCallList()
    const { open, handleOpen, handleClose } = useOpenModal()
    const { handleCreate } = useActions(row, rooms)
    
    useEffect(() => {
      callDoctorsList()
      callRoomsList()
      setValues({})
      setRoomSelected({})
      setCurrentDate(moment().format('DD/M/YYYY'))
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[open])
    
    const handleValueChange = (target) => {
      setValues({...values, status: 1, [target.name]:target.value})
    } 

    const handleValidationPatient = () => {
      if(Object.keys(values).length){
        let filterPatient = patientsList.find(f => f.ci === values.ci)
        if(typeof filterPatient !== 'undefined' ) {
          setValues({ingress_date: currentDate, ci: filterPatient.ci, name: filterPatient.name, age: filterPatient.age, gender: filterPatient.gender})
        } else {
          setValues({...values, ingress_date: currentDate, name: '', age: '', gender: ''})
        }
      }
      else {
        alert("INGRESE UNA CEDULA PARA VALIDAR")
      }
    }

    const handleSubmit= (event) => {
      event.preventDefault()
      if(!Object.keys(values).length){
        alert("POR FAVOR LLENAR EL FORMULARIO")
      } else {
        if( !values.ci || !values.name || !values.age || !values.gender || !roomSelected.id) {
          setValidation(true)
          alert("FALTAN DATOS POR LLENAR")
        } else {
          handleCreate(values, roomSelected)
          handleClose();
          setValidation(false)
        }
      }
    }
  
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
      <Dialog fullWidth maxWidth='sm' open={open} onClose={handleClose} >
        <DialogTitle textAlign="center" sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 'bold' }}>AGREGAR PACIENTE</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack useFlexGap direction="row" spacing={1} sx={{ mb: 2, mt: 3 }}>	
              <TextField variant="outlined" label='Cedula' error={validation} helperText='Requerido' required name="ci" value={values.ci} onChange={({target})=>handleValueChange(target)}/>
              <TextField variant="outlined" defaultValue={currentDate} label='Fecha de Ingreso' name="ingress_date" disabled />
              <Button  onClick={handleValidationPatient} variant="contained" startIcon={<CheckCircle />} >VALIDAR</Button>
            </Stack>
            { values.hasOwnProperty('ingress_date')
              ? 
              <>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField variant="outlined" label='Nombre y Apellido' error={validation} fullWidth helperText='Requerido' required name="name" value={values.name || ''} onChange={({target})=>handleValueChange(target)}/>
                  <TextField variant="outlined" label='Edad' inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} error={validation} helperText='Requerido' required name="age" value={values.age || ''}	onChange={({target})=>handleValueChange(target)}/>
                  <FormControl fullWidth>
                    <InputLabel>Genero</InputLabel>
                    <Select variant="outlined" error={validation} required label="Genero" name='gender' value={values.gender || ''}	onChange={({target})=>handleValueChange(target)}>
                      <MenuItem key="Masculino" value='Masculino'>Masculino</MenuItem>
                      <MenuItem key="Femenino" value='Femenino'>Femenino</MenuItem>
                      <MenuItem key="Otro" value='Otros'>Otros</MenuItem>
                    </Select>
                    <FormHelperText>Requerido</FormHelperText>
                  </FormControl>
                </Stack>
                <Stack >
                  <TextField variant="outlined" sx={{ mb: 3}} fullWidth placeholder="Diagnostico" 	name="current_diagnostic" value={values.current_diagnostic || ''}		onChange={({target})=>handleValueChange(target)}/>
                  <TextField variant="outlined" sx={{ mb: 3}} fullWidth placeholder="Plan" name="treatment" value={values.treatment || ''}	onChange={({target})=>handleValueChange(target)}/>
                  <FormControl fullWidth sx={{ mb: 3}}>
                    <InputLabel>Medico Tratante</InputLabel>
                    <Select variant="outlined" placeholder="Medico Tratante" label="Medico Tratante" name="current_doctor" value={values.current_doctor || ''} onChange={({target})=> handleValueChange(target)}>
                      {doctors.map(doctor=>(
                        <MenuItem key={doctor.id} value={doctor.name}>{doctor.name} -- {doctor.speciality} </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>Ubicacion</InputLabel>
                    <Select variant="outlined" error={validation} fullWidth label="Paciente" required name="id" value={roomSelected.id || ''} onChange={({target}) => setRoomSelected(rooms.find(r => r.id === target.value))} >
                      {rooms.filter(f => values.age < 12 ? f.room_type === 'pediatria' : f.room_type === 'adulto' && !f.patient_id ).map(r => (
                      <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                    ))}
                    </Select>
                    <FormHelperText>Requerido</FormHelperText>
                  </FormControl>
                </Stack>
                </>
              :
              <></>
            }
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