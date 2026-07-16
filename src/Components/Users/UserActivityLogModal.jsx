import React, { useMemo } from 'react';
import {
  Box, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, Paper,
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import moment from 'moment';

const ACTION_LABELS = {
  create_allergy: 'Creó alergia',
  edit_allergy: 'Editó alergia',
  delete_allergy: 'Eliminó alergia',
  create_antecedent: 'Creó antecedente',
  edit_antecedent: 'Editó antecedente',
  delete_antecedent: 'Eliminó antecedente',
  create_medical_plan: 'Creó plan médico',
  edit_medical_plan: 'Editó plan médico',
  delete_medical_plan: 'Eliminó plan médico',
  create_note: 'Creó nota',
  edit_note: 'Editó nota',
  delete_note: 'Eliminó nota',
  create_vital_signs: 'Registró signos vitales',
  create_emergency: 'Creó emergencia',
  update_emergency: 'Editó emergencia',
  update_emergency_status: 'Cambió estado de emergencia',
  update_patient: 'Editó paciente',
  search_patient: 'Buscó paciente',
};

const UserActivityLogModal = ({ open, user, onClose }) => {
  const { data: logs, loading } = useFetch(
    () => BackendAPI.userActivityLogs.getByUser(user.id),
    [user.id],
  );

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        LOG DE ACTIVIDAD - {user.name?.toUpperCase()}
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

        {loading ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Cargando...
          </Typography>
        ) : !logs || logs.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No hay actividad registrada para este usuario.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'darkblue' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha / Hora</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acción</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Detalle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {moment(log.created_at).format('DD/MM/YYYY HH:mm')}
                    </TableCell>
                    <TableCell>
                      {ACTION_LABELS[log.action] || log.action}
                    </TableCell>
                    <TableCell>{log.description}</TableCell>
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

export default UserActivityLogModal;
