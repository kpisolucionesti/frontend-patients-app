import React, { useMemo } from 'react';
import { BackendAPI } from '../../services/BackendApi';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useFetch } from '../../hooks/useFetch';
import { usePolling } from '../../hooks/usePolling';

const CELL_STYLES = {
  header: { borderColor: 'white', border: 3, textAlign: 'center', color: 'white', p: 1, pl: 2, fontSize: 18 },
  data: { border: 3, borderColor: 'info.main', textAlign: 'center', fontSize: 18, p: 1 },
};

const ROOM_TABLE_HEADERS = ['NOMBRE Y APELLIDO', 'EDAD', 'MEDICO TRATANTE', 'INTERCONSULTAS', 'DIAGNOSTICO', 'PLAN'];

const EmergencyRow = React.memo(({ emergency }) => {
  const patient = emergency.patient || {};
  const consultingDoctors = (emergency.doctors || []).filter(
    (d) => d.id !== emergency.primary_doctor?.id,
  );

  return (
    <TableRow>
      <TableCell sx={CELL_STYLES.data}>
        {patient.name} {patient.lastname || ''}
      </TableCell>
      <TableCell sx={CELL_STYLES.data}>{patient.age}</TableCell>
      <TableCell sx={CELL_STYLES.data}>{emergency.primary_doctor?.name || '-'}</TableCell>
      <TableCell sx={CELL_STYLES.data}>
        {consultingDoctors.length > 0
          ? consultingDoctors.map((d) => d.name).join(', ')
          : '-'}
      </TableCell>
      <TableCell sx={CELL_STYLES.data}>{emergency.diagnostic}</TableCell>
      <TableCell sx={CELL_STYLES.data}>{emergency.treatment}</TableCell>
    </TableRow>
  );
});

const RoomTable = () => {
  const { data: emergencies, refetch } = useFetch(
    () => BackendAPI.emergencies.getAll(), [],
  );

  usePolling(refetch, 5000);

  const activeEmergencies = useMemo(
    () => (emergencies || []).filter((e) => e.status === 1),
    [emergencies],
  );

  return (
    <>
      <Typography variant="h3" textAlign="center" sx={{ p: 1, bgcolor: 'darkblue', color: 'white' }}>
        EMERGENCIA ADULTOS
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'darkblue' }}>
            <TableRow>
              {ROOM_TABLE_HEADERS.map((col) => (
                <TableCell key={col} sx={CELL_STYLES.header}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ textTransform: 'uppercase' }}>
            {activeEmergencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', fontSize: 18, py: 4 }}>
                  Sin emergencias activas
                </TableCell>
              </TableRow>
            ) : (
              activeEmergencies.map((emergency) => (
                <EmergencyRow key={emergency.id} emergency={emergency} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default RoomTable;
