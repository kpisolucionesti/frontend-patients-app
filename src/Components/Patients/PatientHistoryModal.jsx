import React, { useMemo, useState } from 'react';
import {
  Box, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, Paper, IconButton, Tooltip,
} from '@mui/material';
import { NoteAlt } from '@mui/icons-material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import moment from 'moment';
import StatusChip from '../Commons/StatusChip';
import HistoryDetailModal from '../History/HistoryDetailModal';

const NotesModal = ({ open, onClose, emergencyId }) => {
  const { data: notes } = useFetch(
    () => emergencyId ? BackendAPI.notes.getAll({ emergency_id: emergencyId }) : Promise.resolve([]),
    [emergencyId],
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        NOTAS DEL CASO
      </DialogTitle>
      <DialogContent sx={{ pt: 5, px: 3 }}>
        {!notes || notes.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Sin notas registradas para este caso.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {notes.map((n) => (
              <Paper key={n.id} variant="outlined" sx={{ p: 1.5, bgcolor: '#f3e5f5' }}>
                <Typography variant="body2">{n.note}</Typography>
                {n.created_at && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {new Date(n.created_at).toLocaleString('es-PY')}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

const PatientHistoryModal = ({ open, patient, onClose }) => {
  const [notesCase, setNotesCase] = useState(null);
  const [detailEmergencyId, setDetailEmergencyId] = useState(null);

  const { data: emergencies } = useFetch(
    () => BackendAPI.emergencies.getAll({ patient_id: patient.id, per_page: 10000 }),
    [patient.id],
  );

  const patientEmergencies = useMemo(
    () => emergencies?.data || [],
    [emergencies],
  );

  return (
    <>
      <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          HISTORIAL DEL PACIENTE
        </DialogTitle>
        <DialogContent sx={{ pt: 3, px: 3 }}>
          <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 2, mb: 3, mt: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
              {patient.name} {patient.lastname || ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              CI: {patient.ci} &nbsp;|&nbsp; Edad: {patient.age} &nbsp;|&nbsp; Genero: {patient.gender}
            </Typography>
          </Box>

          {patientEmergencies.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              El paciente no tiene casos registrados.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'darkblue' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>F. Ingreso</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Medico Tratante</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diagnostico</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Plan</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estatus</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Notas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patientEmergencies.map((e) => (
                    <TableRow
                      key={e.id}
                      hover
                      onClick={() => setDetailEmergencyId(e.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        {moment(e.ingress_date).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell>{e.primary_doctor?.name || ''}</TableCell>
                      <TableCell>{e.diagnostic}</TableCell>
                      <TableCell>{e.treatment}</TableCell>
                      <TableCell><StatusChip status={e.status} /></TableCell>
                      <TableCell align="center" onClick={(ev) => ev.stopPropagation()}>
                        <Tooltip title="Ver notas del caso" arrow>
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => setNotesCase(e.id)}
                          >
                            <NoteAlt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
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

      {notesCase && (
        <NotesModal
          open={!!notesCase}
          onClose={() => setNotesCase(null)}
          emergencyId={notesCase}
        />
      )}

      {detailEmergencyId && (
        <HistoryDetailModal
          open={!!detailEmergencyId}
          emergencyId={detailEmergencyId}
          onClose={() => setDetailEmergencyId(null)}
        />
      )}
    </>
  );
};

export default PatientHistoryModal;
