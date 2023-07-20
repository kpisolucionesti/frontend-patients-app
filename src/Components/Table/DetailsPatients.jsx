import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import React from "react";

const DetailsPatients = ({ row }) => {

    return (
        <Card variant="outlined" sx={{ m: 2 }} >
            <CardHeader
                title='DETALLES DE LA EMERGENCIA'
                sx={{ bgcolor: 'darkblue', color: 'white', p: 2 }}
            />
            <CardContent>
                <Typography>DIAGNOSTICO: {row.current_diagnostic}</Typography>
                <Typography>{row.medical_exit ? "CAUSA DE ALTA MEDICA: " : row.transfer ? 'AREA DE INGRESO' : "" } {row.medical_exit ? row.medical_exit : row.transfer}</Typography>
                <Typography>{row.medical_exit ? "OBSERVACIONES: " : "" } {row.medical_exit ? row.observations : ""}</Typography>
            </CardContent>
        </Card>
    )
}

export default DetailsPatients