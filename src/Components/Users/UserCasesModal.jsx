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

const UserCasesModal = ({ open, user, onClose }) => {
  const { data: emergencies } = useFetch(
    () => BackendAPI.users.getEmergencies(user.id),
    [user.id],
  );

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        CASOS CREADOS POR {user.name?.toUpperCase()}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, px: 3 }}>
        <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 2, mb: 3, mt: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
            {user.name} — {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Perfil: {user.profile_name || 'Sin perfil'}
          </Typography>
        </Box>

        {!emergencies || emergencies.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            El usuario no ha creado casos.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'darkblue' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Paciente</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>F. Ingreso</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Medico Tratante</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diagnostico</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estatus</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emergencies.map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>
                      {e.patient?.name || ''} {e.patient?.lastname || ''}
                    </TableCell>
                    <TableCell>
                      {moment(e.ingress_date).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>{e.primary_doctor?.name || ''}</TableCell>
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
        <Button onClick={onClose} variant="contained" color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserCasesModal;
