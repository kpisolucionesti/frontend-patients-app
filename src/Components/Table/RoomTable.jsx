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
                <Typography variant='h1' textAlign="center" sx={{ p: 2, bgcolor: 'primary.main' }}>EMERGENCIA ADULTO</Typography>
            </Grid>
            <Grid lg={12}>
                <TableContainer component={Paper} sx={{ width: 'auto', height: 'auto' }} xl="auto" >
                    <Table>
                        <TableHead sx={{ textAlign: "center", bgcolor: "info.main" }} >
                            <TableRow>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 80, minWidth: 80 }} >UBICACION</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 100, minWidth: 100 }} >PACIENTE</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 15, minWidth: 15 }} >EDAD</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 180, minWidth: 180 }} >DIAGNOSTICO</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 100, minWidth: 100 }} >MEDICO TRATANTE</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold' }} >PLAN</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ textTransform: "uppercase" }} >
                            {roomsList.filter(r => r.room_type === "adulto").sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 ).map((room) => (
                                <TableRow key={room.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                    <TableCell sx={{ p: 2, fontSize: 40, maxWidth: 80, minWidth: 80  }} component="th" scope='row' >{room.name}</TableCell>
                                    {patientsList.filter(f => f.id === room.patient_id).map((p) => (
                                    <>
                                        <TableCell sx={{ fontSize: 35, maxWidth: 100, minWidth: 100 }} >{p.name}</TableCell>
                                        <TableCell sx={{ fontSize: 35, maxWidth: 10, minWidth: 10 }} >{p.age}</TableCell>
                                        <TableCell sx={{ fontSize: 35, maxWidth: 180, minWidth: 180 }} >{p.current_diagnostic}</TableCell>
                                        <TableCell sx={{ fontSize: 35, maxWidth: 100, minWidth: 100 }} >{p.current_doctor}</TableCell>
                                        <TableCell sx={{ fontSize: 35 }} >{p.treatment}</TableCell>
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
                <Typography variant='h1' textAlign="center" sx={{ p: 2, bgcolor: 'primary.main' }}>EMERGENCIA PEDIATRIA</Typography>
            </Grid>
            <Grid lg={12} >
                <TableContainer>
                    <Table  >
                        <TableHead sx={{ textAlign: "center", bgcolor: "info.main" }} >
                            <TableRow>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 80, minWidth: 80 }} >UBICACION</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 100, minWidth: 100 }} >PACIENTE</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 15, minWidth: 15 }} >EDAD</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 180, minWidth: 180 }} >DIAGNOSTICO</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold', maxWidth: 100, minWidth: 100 }} >MEDICO TRATANTE</TableCell>
                                <TableCell sx={{ p: 5, fontSize: 45, fontWeight: 'bold' }} >PLAN</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ textTransform: "uppercase" }} >
                            {roomsList.filter(r => r.room_type === "pediatria").sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 ).map((room) => (
                                <TableRow key={room.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                    <TableCell sx={{ p: 2, fontSize: 40, maxWidth: 80, minWidth: 80  }} component="th" scope='row' >{room.name}</TableCell>
                                    {patientsList.filter(f => f.id === room.patient_id).map((p) => (
                                    <>
                                        <TableCell sx={{ fontSize: 35, maxWidth: 100, minWidth: 100 }} >{p.name}</TableCell>
                                        <TableCell sx={{ fontSize: 35, maxWidth: 10, minWidth: 10 }} >{p.age}</TableCell>
                                        <TableCell sx={{ fontSize: 35, maxWidth: 180, minWidth: 180 }} >{p.current_diagnostic}</TableCell>
                                        <TableCell sx={{ fontSize: 35, maxWidth: 100, minWidth: 100 }} >{p.current_doctor}</TableCell>
                                        <TableCell sx={{ fontSize: 35 }} >{p.treatment}</TableCell>
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