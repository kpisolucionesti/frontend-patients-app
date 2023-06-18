import React, { useEffect, useState } from 'react';
import { BackendAPI } from '../../services/BackendApi';
import { Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';


const RoomTable = () => {
    const [roomsList, setRoomsList] = useState([])
    const [patientsList, setPatientsList] = useState([])

    useEffect(() => {
        refresh()
    },[])

    const refresh = () => {
        console.log("Voy a actualizar")
        BackendAPI.rooms.getAll().then(room => setRoomsList(room))
        BackendAPI.patients.getAll().then(patient => setPatientsList(patient))
        setTimeout(refresh,10000)
    }

    return (
        <Grid container  sx={{ maxHeight: '100%' }} >
            <Grid lg={12}>
                <Typography variant='h3' textAlign="center" sx={{ p: 2, bgcolor: 'primary.main' }}>EMERGENCIA ADULTO</Typography>
            </Grid>
            <Grid lg={12}>
                <TableContainer component={Paper} sx={{ width: 'auto', height: 'auto' }} xl="auto" >
                    <Table>
                        <TableHead sx={{ textAlign: "center", bgcolor: "info.main" }} >
                            <TableRow >
                                <TableCell sx={{ width: '20px', fontSize: 20, color: "text.primary" }} >UBICACION</TableCell>
                                <TableCell sx={{ width: '150px', fontSize: 20 }} >PACIENTE</TableCell>
                                <TableCell sx={{ width: '30px', fontSize: 20 }} >EDAD</TableCell>
                                <TableCell sx={{ width: '50px', fontSize: 20 }} >SEXO</TableCell>
                                <TableCell sx={{ width: '200px', fontSize: 20 }} >DIAGNOSTICO</TableCell>
                                <TableCell sx={{ width: '80px', fontSize: 20 }} >MEDICO TRATANTE</TableCell>
                                <TableCell sx={{ width: '200px', fontSize: 20 }} >PLAN</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ textTransform: "uppercase" }} >
                            {roomsList.filter(r => r.room_type === "adulto").sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 ).map((room) => (
                                <TableRow key={room.name} >
                                    <TableCell component="th" scope='row' >{room.name}</TableCell>
                                    {patientsList.filter(f => f.id === room.patient_id).map((p) => (
                                    <>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>{p.age}</TableCell>
                                        <TableCell>{p.gender}</TableCell>
                                        <TableCell>{p.current_diagnostic}</TableCell>
                                        <TableCell>{p.current_doctor}</TableCell>
                                        <TableCell>{p.treatment}</TableCell>
                                    </>
                                    ))}
                                </TableRow>
                            ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid lg={12}>
                <Typography variant='h3' textAlign="center" sx={{ p: 2, bgcolor: 'primary.main' }}>EMERGENCIA PEDIATRIA</Typography>
            </Grid>
            <Grid lg={12} >
                <TableContainer>
                    <Table>
                        <TableHead sx={{ textAlign: "center", bgcolor: "info.main" }} >
                            <TableRow >
                                <TableCell sx={{ width: '20px', fontSize: 20, color: "text.primary" }} >UBICACION</TableCell>
                                <TableCell sx={{ width: '150px', fontSize: 20 }} >PACIENTE</TableCell>
                                <TableCell sx={{ width: '30px', fontSize: 20 }} >EDAD</TableCell>
                                <TableCell sx={{ width: '50px', fontSize: 20 }} >SEXO</TableCell>
                                <TableCell sx={{ width: '200px', fontSize: 20 }} >DIAGNOSTICO</TableCell>
                                <TableCell sx={{ width: '80px', fontSize: 20 }} >MEDICO TRATANTE</TableCell>
                                <TableCell sx={{ width: '200px', fontSize: 20 }} >PLAN</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ textTransform: "uppercase" }} >
                            {roomsList.filter(r => r.room_type === "pediatria").sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 ).map((room) => (
                                <TableRow>
                                    <TableCell>{room.name}</TableCell>
                                    {patientsList.filter(f => f.id === room.patient_id).map((p) => (
                                    <>
                                        <TableCell>{p.name}</TableCell>
                                        <TableCell>{p.age}</TableCell>
                                        <TableCell>{p.gender}</TableCell>
                                        <TableCell>{p.current_diagnostic}</TableCell>
                                        <TableCell>{p.current_doctor}</TableCell>
                                        <TableCell>{p.treatment}</TableCell>
                                    </>
                                    ))}
                                </TableRow>
                            ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    )
}

export default RoomTable