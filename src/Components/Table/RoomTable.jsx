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
        setTimeout(refresh,5000)
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
                    <Typography variant='h3' textAlign="center" sx={{ p: 1, bgcolor: 'darkblue' }}>EMERGENCIA ADULTO</Typography>
                </ThemeProvider>
            </Grid>
            <Grid lg={12}>
                <TableContainer>
                    <Table size='small'>
                        <TableHead sx={{ textAlign: "center", bgcolor: "darkblue" }} >
                            <TableRow>
                                <TableCell sx={{ borderColor: 'white', border: 1, textAlign: 'center', color: 'white', p: 1, pl: 2, fontSize: 20, maxWidth: 60, minWidth: 60 }} >UBICACIÓN</TableCell>
                                <TableCell sx={{ borderColor: 'white', border: 1, textAlign: 'center', color: 'white', p: 1, pl: 2, fontSize: 20, maxWidth: 60, minWidth: 60 }} >PACIENTE</TableCell>
                                <TableCell sx={{ borderColor: 'white', border: 1, textAlign: 'center', color: 'white', p: 1, pl: 2, fontSize: 20, maxWidth: 15, minWidth: 15 }} >EDAD</TableCell>
                                <TableCell sx={{ borderColor: 'white', border: 1, textAlign: 'center', color: 'white', p: 1, pl: 2, fontSize: 20, maxWidth: 150, minWidth: 150 }} >DIAGNÓSTICO</TableCell>
                                <TableCell sx={{ borderColor: 'white', border: 1, textAlign: 'center', color: 'white', p: 1, pl: 2, fontSize: 20, maxWidth: 100, minWidth: 100 }} >MÉDICO TRATANTE</TableCell>
                                <TableCell sx={{ borderColor: 'white', border: 1, textAlign: 'center', color: 'white', p: 1, pl: 2, fontSize: 20, maxWidth: 150, minWidth: 150 }}>PLAN</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ textTransform: "uppercase" }} >
                            {roomsList.filter(r => r.room_type === "adulto" && r.name === "Traumashock" ).sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 ).map((room) => (
                                <TableRow key={room.name} >
                                    <TableCell sx={{ borderColor: 'white', border: 2, textAlign: 'center', bgcolor: 'text.secondary', color: 'white', fontSize: 20, pt: 2, pb: 2, maxWidth: 60, minWidth: 60 }} >{room.name}</TableCell>
                                    {patientsList.filter(f => f.id === room.patient_id).map((p) => (
                                    <>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 60, minWidth: 60 }} >{p.name}</TableCell>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 15, minWidth: 15 }} >{p.age}</TableCell>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 150, minWidth: 150 }} >{p.current_diagnostic}</TableCell>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 100, minWidth: 100 }} >{p.current_doctor}</TableCell>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 150, minWidth: 150 }} >{p.treatment}</TableCell>
                                    </>
                                    ))}
                                </TableRow>
                            ))
                            }
                            
                            {roomsList.filter(r => r.room_type === "adulto" && r.name !== "Traumashock" ).sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1 ).map((room) => (
                                <TableRow key={room.name} >
                                    <TableCell sx={{ borderColor: 'white', border: 2, textAlign: 'center', bgcolor: 'text.secondary', color: 'white', fontSize: 20, pt: 2, pb: 2, maxWidth: 60, minWidth: 60 }} >{room.name}</TableCell>
                                    {patientsList.filter(f => f.id === room.patient_id).map((p) => (
                                    <>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 60, minWidth: 60 }} >{p.name}</TableCell>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 15, minWidth: 15 }} >{p.age}</TableCell>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 150, minWidth: 150 }} >{p.current_diagnostic}</TableCell>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 100, minWidth: 100 }} >{p.current_doctor}</TableCell>
                                        <TableCell sx={{ border: 2, borderColor: 'info.main', textAlign: 'center', fontSize: 20, maxWidth: 150, minWidth: 150 }} >{p.treatment}</TableCell>
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