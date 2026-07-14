import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import React from "react";

const DetailsPatients = ({ row }) => {
    const extraInfo = row.medical_exit
      ? `CAUSA DE ALTA MEDICA: ${row.medical_exit}`
      : row.transfer
        ? `AREA DE INGRESO: ${row.transfer}`
        : null;

    return (
        <Card variant="outlined" sx={{ m: 2 }}>
            <CardHeader
                title='DETALLES DE LA EMERGENCIA'
                sx={{ bgcolor: 'darkblue', color: 'white', p: 2 }}
            />
            <CardContent>
                <Typography>DIAGNOSTICO: {row.diagnostic}</Typography>
                <Typography>MEDICO PRINCIPAL: {row.primary_doctor?.name || ''}</Typography>
                {row.doctors?.length > 1 && (
                  <Typography>INTERCONSULTAS: {row.doctors.filter((d) => d.id !== row.primary_doctor?.id).map((d) => d.name).join(', ')}</Typography>
                )}
                {extraInfo && <Typography>{extraInfo}</Typography>}
                {row.medical_exit && (
                  <Typography>OBSERVACIONES: {row.observations}</Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default DetailsPatients;
