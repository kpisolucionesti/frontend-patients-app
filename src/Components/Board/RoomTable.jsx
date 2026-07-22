import React, { useMemo } from 'react';
import { BackendAPI } from '../../services/BackendApi';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useFetch } from '../../hooks/useFetch';
import { useRooms } from '../../hooks/useApiData';
import { usePolling } from '../../hooks/usePolling';

const COLUMNS = [
  { label: 'UBICACION', width: '12%' },
  { label: 'NOMBRE Y APELLIDO', width: '22%' },
  { label: 'EDAD', width: '8%' },
  { label: 'MEDICO TRATANTE', width: '16%' },
  { label: 'INTERCONSULTAS', width: '16%' },
  { label: 'DIAGNOSTICO', width: '14%' },
  { label: 'PLAN', width: '12%' },
];

const CELL_STYLES = {
  header: { borderColor: 'white', border: 3, textAlign: 'center', color: 'white', fontSize: 'clamp(14px, 2.8vh, 52px)', p: '0.6vh 0.5vw' },
  data: { border: 3, borderColor: 'info.main', textAlign: 'center', fontSize: 'clamp(12px, 2.4vh, 48px)', p: '0.4vh 0.3vw' },
};

const EmergencyRow = React.memo(({ emergency, patientRoom }) => {
  const patient = emergency.patient || {};
  const consultingDoctors = (emergency.doctors || []).filter(
    (d) => d.id !== emergency.primary_doctor?.id,
  );
  const location = patientRoom
    ? patientRoom.name
    : '-';

  const locationBgColor = patientRoom ? 'rgba(25, 118, 210, 0.08)' : 'inherit';

  return (
    <TableRow>
      <TableCell sx={{ ...CELL_STYLES.data, width: COLUMNS[0].width, bgcolor: locationBgColor, fontWeight: 'bold' }}>
        {location}
      </TableCell>
      <TableCell sx={{ ...CELL_STYLES.data, width: COLUMNS[1].width }}>
        {patient.name} {patient.lastname || ''}
      </TableCell>
      <TableCell sx={{ ...CELL_STYLES.data, width: COLUMNS[2].width }}>{patient.age}</TableCell>
      <TableCell sx={{ ...CELL_STYLES.data, width: COLUMNS[3].width }}>{emergency.primary_doctor?.name || '-'}</TableCell>
      <TableCell sx={{ ...CELL_STYLES.data, width: COLUMNS[4].width }}>
        {consultingDoctors.length > 0
          ? consultingDoctors.map((d) => d.name).join(', ')
          : '-'}
      </TableCell>
      <TableCell sx={{ ...CELL_STYLES.data, width: COLUMNS[5].width }}>{emergency.diagnostic}</TableCell>
      <TableCell sx={{ ...CELL_STYLES.data, width: COLUMNS[6].width }}>{emergency.treatment}</TableCell>
    </TableRow>
  );
});

const RoomTable = ({ screenRoute }) => {
  const { data: emergencies, refetch } = useFetch(
    () => BackendAPI.emergencies.getAll(), [],
  );

  const { data: rooms } = useRooms();

  usePolling(refetch, 5000);

  const activeEmergencies = useMemo(
    () => (emergencies?.data || []).filter((e) => e.status === 1),
    [emergencies],
  );

  const roomByPatientId = useMemo(() => {
    const map = {};
    (rooms || []).forEach((room) => {
      if (room.patient_id) {
        map[room.patient_id] = room;
      }
    });
    return map;
  }, [rooms]);

  const filteredEmergencies = useMemo(() => {
    return activeEmergencies.filter((e) => {
      const room = roomByPatientId[e.patient_id];
      if (!room?.room_type) return true;
      if (screenRoute === 'adulto') return room.room_type === 'adulto';
      if (screenRoute === 'pediatria') return room.room_type === 'pediatria';
      return true;
    });
  }, [activeEmergencies, roomByPatientId, screenRoute]);

  const title = screenRoute === 'pediatria' ? 'EMERGENCIA PEDIATRICA' : 'EMERGENCIA ADULTOS';

  return (
    <>
      <Typography textAlign="center" sx={{ p: '0.8vh 1vw', bgcolor: 'darkblue', color: 'white', fontSize: 'clamp(20px, 4vh, 72px)', fontWeight: 'bold' }}>
        {title}
      </Typography>
      <TableContainer>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead sx={{ bgcolor: 'darkblue' }}>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col.label} sx={{ ...CELL_STYLES.header, width: col.width }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ textTransform: 'uppercase' }}>
            {filteredEmergencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', fontSize: 'clamp(14px, 2.8vh, 48px)', py: '3vh' }}>
                  Sin emergencias activas
                </TableCell>
              </TableRow>
            ) : (
              filteredEmergencies.map((emergency) => (
                <EmergencyRow
                  key={emergency.id}
                  emergency={emergency}
                  patientRoom={roomByPatientId[emergency.patient_id]}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default RoomTable;
