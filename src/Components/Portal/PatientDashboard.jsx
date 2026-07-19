import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Divider, Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SubjectIcon from '@mui/icons-material/Subject';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ScienceIcon from '@mui/icons-material/Science';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import VitalSignsPanel from './VitalSignsPanel';
import LabResultsQuickModal from './LabResultsQuickModal';
import HistoryDetailModal from '../History/HistoryDetailModal';
import AllergiesSection from './AllergiesSection';
import AntecedentsSection from './AntecedentsSection';
import MedicalPlansDetail from './MedicalPlansDetail';
import InterconsultationsDetail from './InterconsultationsDetail';
import ParaclinicalStudiesDetail from './ParaclinicalStudiesDetail';
import NoteItem from '../Emergency/NoteItem';
import PatientAppointmentsSummary from '../Commons/PatientAppointmentsSummary';

const PatientDashboard = ({ patient, stats, emergencyId, vitalSigns = [], onVitalSignsCreated, onOpenLabPanel, readOnly }) => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAllCases, setShowAllCases] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [labQuickOpen, setLabQuickOpen] = useState(false);

  const isDeceased = patient?.disabled;
  const effectiveReadOnly = readOnly || isDeceased;

  const { data: notesData, refetch: refetchNotes } = useFetch(
    () => emergencyId ? BackendAPI.notes.getAll({ emergency_id: emergencyId }) : Promise.resolve([]),
    [emergencyId],
  );
  const patientNotes = useMemo(() => notesData || [], [notesData]);

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      await BackendAPI.notes.create({ note: noteText, patient_id: patient.id, emergency_id: emergencyId });
      setNoteText('');
      setNoteDialogOpen(false);
      refetchNotes();
    } catch {
      alert('Error al agregar nota');
    }
    setNoteSaving(false);
  }, [noteText, patient?.id, emergencyId, refetchNotes]);

  useEffect(() => {
    if (!patient) return;
    BackendAPI.emergencies.getAll({ patient_id: patient.id, per_page: 20 })
      .then((res) => {
        const all = res.data || [];
        setCases(all.filter((c) => c.status === 2 || c.status === 3 || c.status === 4 || c.status === 5));
      })
      .catch(() => {});
  }, [patient]);

  const displayCases = showAllCases ? cases : cases.slice(0, 3);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {emergencyId && (
        <>
          <VitalSignsPanel
            emergencyId={emergencyId}
            vitalSigns={vitalSigns}
            onCreated={onVitalSignsCreated}
            readOnly={effectiveReadOnly}
          />
          <Paper sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ScienceIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0' }}>
                  LABORATORIOS
                </Typography>
              </Box>
              <Button size="small" sx={{ fontSize: '0.7rem', minWidth: 'auto' }} onClick={() => setLabQuickOpen(true)}>
                Ver resultados
              </Button>
            </Box>
          </Paper>

          <MedicalPlansDetail emergencyId={emergencyId} readOnly={effectiveReadOnly} />
          <InterconsultationsDetail emergencyId={emergencyId} readOnly={effectiveReadOnly} />
          <ParaclinicalStudiesDetail emergencyId={emergencyId} readOnly={effectiveReadOnly} />
        </>
      )}

      {emergencyId && (
        <Paper sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SubjectIcon sx={{ fontSize: 18, color: '#7b1fa2' }} />
              <Typography variant="caption" fontWeight={600} sx={{ color: '#7b1fa2' }}>
                NOTAS
              </Typography>
            </Box>
            {!effectiveReadOnly && (
              <Tooltip title="Agregar nota" arrow>
                <IconButton size="small" onClick={() => setNoteDialogOpen(true)} sx={{ p: 0.25 }}>
                  <AddCircleOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {patientNotes.length === 0 ? (
            <Typography variant="caption" color="text.secondary">Sin notas</Typography>
          ) : effectiveReadOnly ? (
            patientNotes.map((note) => (
              <Box key={note.id} sx={{ mb: 0.5, p: 0.75, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{note.note}</Typography>
              </Box>
            ))
          ) : (
            patientNotes.map((note) => (
              <NoteItem key={note.id} note={note} onRefresh={refetchNotes} canEdit canDelete />
            ))
          )}

          <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontSize: '0.85rem', bgcolor: '#7b1fa2', color: 'white' }}>Agregar Nota</DialogTitle>
            <DialogContent style={{ paddingTop: 24 }}>
              <TextField variant="standard" size="small" label="Nota" value={noteText} onChange={(e) => setNoteText(e.target.value)} multiline rows={3} required fullWidth />
            </DialogContent>
            <DialogActions>
              <Button size="small" variant="outlined" onClick={() => setNoteDialogOpen(false)}>Cancelar</Button>
              <Button size="small" variant="outlined" onClick={handleAddNote} disabled={noteSaving || !noteText.trim()}>
                {noteSaving ? <CircularProgress size={14} /> : 'Guardar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      )}

      <PatientAppointmentsSummary patientId={patient?.id} />
      <AllergiesSection patientId={patient?.id} readOnly={effectiveReadOnly} />
      <AntecedentsSection patientId={patient?.id} readOnly={effectiveReadOnly} />

      {selectedCase && (
        <HistoryDetailModal
          emergencyId={selectedCase.id}
          open={!!selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}

      {emergencyId && (
        <LabResultsQuickModal
          open={labQuickOpen}
          onClose={() => setLabQuickOpen(false)}
          emergencyId={emergencyId}
          patientGender={patient?.gender}
          onGoToFullPanel={() => { setLabQuickOpen(false); onOpenLabPanel?.(); }}
        />
      )}
    </Box>
  );
};

export default PatientDashboard;
