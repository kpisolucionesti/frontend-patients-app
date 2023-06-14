import React, { useEffect, useState } from 'react';
import { BackendAPI } from '../../services/BackendApi';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';


export const RoomTable = () => {
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
        <>
            <Typography variant='h3' textAlign="center" sx={{ p: 2, bgcolor: 'primary.main' }}>EMERGENCIA ADULTO</Typography>
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
                        {roomsList.filter(r => r.room_type === "adulto").map((room) => (
                            <TableRow key={room.id} >
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
            <Typography variant='h3' textAlign="center" sx={{ mt: 3, p: 2, bgcolor: 'info.main' }} >EMERGENCIA PEDIATRICA</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>UBICACION</TableCell>
                            <TableCell>PACIENTE</TableCell>
                            <TableCell>EDAD</TableCell>
                            <TableCell>SEXO</TableCell>
                            <TableCell>DIAGNOSTICO</TableCell>
                            <TableCell>MEDICO TRATANTE</TableCell>
                            <TableCell>PLAN</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roomsList.filter(r => r.room_type === "pediatria").map((room) => (
                            <TableRow key={room.id} >
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
        </>
    )
}
