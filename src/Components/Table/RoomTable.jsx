import React, { useEffect, useState } from 'react';
import { BackendAPI } from '../../services/BackendApi';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ThemeProvider, Typography, createTheme } from '@mui/material';


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

    const theme = createTheme({
        typography: {
            h3: {
                color: 'white'
            }
        }
    })


    return (
        <Grid container sx={{ minHeight: '100%' }} >
            <Grid lg={12}>
                <ThemeProvider theme={theme}>
                    <Typography variant='h3' textAlign="center" sx={{ pb: 1, bgcolor: 'primary.main' }}>EMERGENCIA ADULTO</Typography>
                </ThemeProvider>
            </Grid>
            <Grid lg={12}>
                <TableContainer>
                    <Table size='small'>
                        <TableHead sx={{ textAlign: "center", bgcolor: "primary.main" }} >
                            <TableRow sx={{ fontSize: 30 }}>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 60, minWidth: 60 }} >UBICACION</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 60, minWidth: 60 }} >PACIENTE</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 15, minWidth: 15 }} >EDAD</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 150, minWidth: 150 }} >DIAGNOSTICO</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 100, minWidth: 100 }} >MEDICO TRATANTE</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 150, minWidth: 150 }}>PLAN</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ textTransform: "uppercase" }} >
                            {roomsList.filter(r => r.room_type === "adulto").sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 ).map((room) => (
                                <TableRow key={room.name} sx={{ fontSize: 25, '&:last-child td, &:last-child th': { border: 0 } }} >
                                    <TableCell sx={{ fontSize: 20, pb: 1, maxWidth: 60, minWidth: 60 }} >{room.name}</TableCell>
                                    {patientsList.filter(f => f.id === room.patient_id).map((p) => (
                                    <>
                                        <TableCell sx={{ maxWidth: 60, minWidth: 60 }} >{p.name}</TableCell>
                                        <TableCell sx={{ maxWidth: 15, minWidth: 15 }} >{p.age}</TableCell>
                                        <TableCell sx={{ maxWidth: 150, minWidth: 150 }} >{p.current_diagnostic}</TableCell>
                                        <TableCell sx={{ maxWidth: 100, minWidth: 100 }} >{p.current_doctor}</TableCell>
                                        <TableCell sx={{ maxWidth: 150, minWidth: 150 }} >{p.treatment}</TableCell>
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
                <ThemeProvider theme={theme}>
                    <Typography variant='h3' textAlign="center" sx={{ pb: 1, bgcolor: 'primary.main' }}>EMERGENCIA PEDIATRIA</Typography>
                </ThemeProvider>
            </Grid>
            <Grid lg={12} >
                <TableContainer>
                    <Table size='small' >
                        <TableHead sx={{ textAlign: "center", bgcolor: "primary.main" }} >
                        <TableRow sx={{ fontSize: 30 }}>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 60, minWidth: 60 }} >UBICACION</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 60, minWidth: 60 }} >PACIENTE</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 15, minWidth: 15 }} >EDAD</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 150, minWidth: 150 }} >DIAGNOSTICO</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 100, minWidth: 100 }} >MEDICO TRATANTE</TableCell>
                                <TableCell sx={{ color: 'white', p: 1, fontSize: 20, maxWidth: 150, minWidth: 150 }}>PLAN</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ textTransform: "uppercase" }} >
                            {roomsList.filter(r => r.room_type === "pediatria").sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 ).map((room) => (
                                <TableRow key={room.name} sx={{ fontSize: 25, '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ fontSize: 20, pb: 1, maxWidth: 80, minWidth: 80  }} >{room.name}</TableCell>
                                    {patientsList.filter(f => f.id === room.patient_id).map((p) => (
                                    <>
                                        <TableCell sx={{ maxWidth: 100, minWidth: 100 }} >{p.name}</TableCell>
                                        <TableCell sx={{ maxWidth: 10, minWidth: 10 }} >{p.age}</TableCell>
                                        <TableCell sx={{ maxWidth: 150, minWidth: 150 }} >{p.current_diagnostic}</TableCell>
                                        <TableCell sx={{ maxWidth: 100, minWidth: 100 }} >{p.current_doctor}</TableCell>
                                        <TableCell sx={{ maxWidth: 150, minWidth: 150 }} >{p.treatment}</TableCell>
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