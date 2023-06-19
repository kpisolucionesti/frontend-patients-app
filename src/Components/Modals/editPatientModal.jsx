import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Edit } from '@mui/icons-material';
import { BackendAPI } from "../../services/BackendApi";


export const EditPatients = ({ onSubmit, row }) => {

    const [values, setValues] = useState(row);
    const [openModal, setOpenModal] = useState(false)
    const [doctorsList, setDoctorsList] = useState([])
    const [validation, setValidation] = useState(false)

    useEffect(() => {
      BackendAPI.doctors.getAll().then((res) => setDoctorsList(res) )
    },[values])

  	const handleValueChange = (target)=>{
      setValues({...values, [target.name]:target.value})
    }

    const handleOpen = () => {
      setOpenModal(true)
    }

    const handleClose = () => {
      setOpenModal(false)
    }    

    const handleSubmit = (event) => {
      event.preventDefault()
      if(!Object.keys(values).length){
        alert("POR FAVOR LLENAR EL FORMULARIO")
      } else {
        if( !values.ci || !values.name || !values.age || !values.gender) {
          alert("FALTAN DATOS POR LLENAR")
          setValidation(true)
        } else {
          onSubmit(values)
          setValidation(false)
          handleClose();
        }
      }
    };
  
    return (
      <>
      <Button
        color="success"
        onClick={handleOpen}
        variant="contained"
        startIcon={<Edit />}
        disabled={row.status !== 1 ? true : false}
      />
      <Dialog open={openModal} onClose={handleClose} >
        <DialogTitle textAlign="center" sx={{ bgcolor: 'success.main', color: 'text.primary', fontWeight: 'bold' }}>EDITAR PACIENTE</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 3 }}>	
              <TextField error={validation} fullWidth helperText='Campo requerido' required label="Cedula" name="ci" value={values.ci} onChange={({target})=>handleValueChange(target)}/>
              <TextField error={validation} fullWidth helperText='Campo requerido' required label="Nombre y Apellido" name="name"	value={values.name} onChange={({target})=>handleValueChange(target)}/>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField error={validation} fullWidth helperText='Campo requerido' required label="Edad" name="age" value={values.age}	onChange={({target})=>handleValueChange(target)}/>
              <FormControl fullWidth>
                <InputLabel>Genero</InputLabel>
                <Select error={validation} label="Genero" helperText='Campo requerido' required name='gender' value={values.gender}	onChange={({target})=>handleValueChange(target)}>
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
                <Select label="Medico Tratante" name="current_doctor" value={values.current_doctor} onChange={({target})=> setValues({...values,[target.name]:target.value})}>
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
          <Button onClick={handleSubmit} variant="contained" color='success'>Guardar</Button>
        </DialogActions>
      </Dialog>
      </>
    );
};

export default EditPatients