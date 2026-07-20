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
  create_physical_exam: 'Registró examen físico',
  update_physical_exam: 'Actualizó examen físico',
  create_laboratory_result: 'Registró resultado de laboratorio',
  update_laboratory_result: 'Actualizó resultado de laboratorio',
  delete_laboratory_result: 'Eliminó resultado de laboratorio',
  create_lab_parameter: 'Creó parámetro de laboratorio',
  update_lab_parameter: 'Actualizó parámetro de laboratorio',
  delete_lab_parameter: 'Eliminó parámetro de laboratorio',
  import_lab_parameters: 'Importó parámetros desde Excel',
  create_lab_parameter_group: 'Creó grupo de parámetros',
  update_lab_parameter_group: 'Actualizó grupo de parámetros',
  delete_lab_parameter_group: 'Eliminó grupo de parámetros',
  sign_in: 'Inició sesión',
  sign_out: 'Cerró sesión',
  create_area: 'Creó área',
  update_area: 'Actualizó área',
  delete_area: 'Eliminó área',
  create_doctor: 'Creó médico',
  update_doctor: 'Actualizó médico',
  delete_doctor: 'Eliminó médico',
  update_email_settings: 'Actualizó config. de correo',
  test_email_settings: 'Probó config. de correo',
  create_interconsultation: 'Creó interconsulta',
  update_interconsultation: 'Actualizó interconsulta',
  delete_interconsultation: 'Eliminó interconsulta',
  create_paraclinical_study: 'Creó estudio paraclínico',
  update_paraclinical_study: 'Actualizó estudio paraclínico',
  delete_paraclinical_study: 'Eliminó estudio paraclínico',
  create_profile: 'Creó perfil',
  update_profile: 'Actualizó perfil',
  delete_profile: 'Eliminó perfil',
  create_room: 'Creó sala',
  update_room: 'Actualizó sala',
  delete_room: 'Eliminó sala',
  create_tv_screen: 'Creó pantalla TV',
  update_tv_screen: 'Actualizó pantalla TV',
  delete_tv_screen: 'Eliminó pantalla TV',
  regenerate_tv_pin: 'Regeneró PIN de pantalla TV',
  revoke_tv_sessions: 'Revocó sesiones de pantalla TV',
  create_user: 'Creó usuario',
  update_user: 'Actualizó usuario',
  delete_user: 'Eliminó usuario',
  change_password: 'Cambió contraseña',
  update_user_permissions: 'Actualizó permisos de usuario',
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
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, maxHeight: '50vh', minHeight: 200 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
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
        <Button onClick={onClose} variant="outlined" color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserActivityLogModal;
