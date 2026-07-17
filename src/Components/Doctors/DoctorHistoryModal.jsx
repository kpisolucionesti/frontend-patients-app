import React, { useMemo, useState } from 'react';
import {
  Box, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import moment from 'moment';
import StatusChip from '../Commons/StatusChip';
import ExportModal from '../Commons/ExportModal';
import CaseDetailModal from '../Emergency/CaseDetailModal';

const DoctorHistoryModal = ({ open, doctor, onClose }) => {
  const { data: emergencies } = useFetch(
    () => BackendAPI.emergencies.getAll({ per_page: 10000, q: doctor.name }),
    [doctor.id],
  );
  const [selectedEmergencyId, setSelectedEmergencyId] = useState(null);
  const [selectedYear, setSelectedYear] = useState('todos');

  const attendedPatients = useMemo(
    () => (emergencies?.data || [])
      .filter((e) => e.primary_doctor?.id === doctor.id)
      .sort((a, b) => moment(b.ingress_date).valueOf() - moment(a.ingress_date).valueOf()),
    [emergencies, doctor.id],
  );

  const yearOptions = useMemo(() => {
    const years = [...new Set(attendedPatients.map((e) => moment(e.ingress_date).format('YYYY')))];
    return years.sort((a, b) => b - a);
  }, [attendedPatients]);

  const filteredPatients = useMemo(() => {
    if (selectedYear === 'todos') return attendedPatients;
    return attendedPatients.filter((e) => moment(e.ingress_date).format('YYYY') === selectedYear);
  }, [attendedPatients, selectedYear]);

  return (
    <>
      <Dialog fullWidth maxWidth="md" open={open && !selectedEmergencyId} onClose={onClose}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          PACIENTES ATENDIDOS - {doctor.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 2, mb: 3, mt: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
              {doctor.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Especialidad: {doctor.speciality}
            </Typography>
          </Box>

          {yearOptions.length > 0 && (
            <FormControl size="small" sx={{ mb: 2, minWidth: 150 }}>
              <InputLabel>Año</InputLabel>
              <Select
                value={selectedYear}
                label="Año"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                {yearOptions.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {filteredPatients.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No ha atendido pacientes como medico principal.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'darkblue' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>F. Ingreso</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Paciente</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cedula</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diagnostico</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estatus</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPatients.map((e) => (
                    <TableRow
                      key={e.id}
                      hover
                      onClick={() => setSelectedEmergencyId(e.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {moment(e.ingress_date).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell>
                        {e.patient?.name || ''} {e.patient?.lastname || ''}
                      </TableCell>
                      <TableCell>{e.patient?.ci || ''}</TableCell>
                      <TableCell>{e.diagnostic}</TableCell>
                      <TableCell><StatusChip status={e.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ExportModal data={filteredPatients} filename={`Historial_${doctor.name}`} />
          <Button onClick={onClose} variant="outlined" color="error">Cerrar</Button>
        </DialogActions>
      </Dialog>

      {selectedEmergencyId && (
        <CaseDetailModal
          open={!!selectedEmergencyId}
          emergencyId={selectedEmergencyId}
          onClose={() => setSelectedEmergencyId(null)}
          readOnly
          hideHistory
        />
      )}
    </>
  );
};

export default DoctorHistoryModal;
