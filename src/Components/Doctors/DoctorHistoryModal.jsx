import React, { useMemo } from 'react';
import {
  Box, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, Paper,
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import moment from 'moment';
import StatusChip from '../Commons/StatusChip';
import ExportModal from '../Commons/ExportModal';

const DoctorHistoryModal = ({ open, doctor, onClose }) => {
  const { data: emergencies } = useFetch(
    () => BackendAPI.emergencies.getAll({ per_page: 10000, q: doctor.name }),
    [doctor.id],
  );

  const attendedPatients = useMemo(
    () => (emergencies?.data || [])
      .filter((e) => e.primary_doctor?.id === doctor.id)
      .sort((a, b) => moment(b.ingress_date).valueOf() - moment(a.ingress_date).valueOf()),
    [emergencies, doctor.id],
  );

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
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

        {attendedPatients.length === 0 ? (
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
                {attendedPatients.map((e) => (
                  <TableRow key={e.id} hover>
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
        <ExportModal data={attendedPatients} />
        <Button onClick={onClose} variant="contained" color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorHistoryModal;
