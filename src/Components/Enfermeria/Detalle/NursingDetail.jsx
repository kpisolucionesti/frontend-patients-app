import { useState, useMemo, useCallback } from 'react';
import { Box, Paper, Typography, Grid, Button, TextField, CircularProgress, IconButton, Tooltip, InputAdornment } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DescriptionIcon from '@mui/icons-material/Description';
import MedicationIcon from '@mui/icons-material/Medication';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import moment from 'moment';
import { BackendAPI } from '../../../services/BackendApi';
import { useFetch } from '../../../hooks/useFetch';
import { useAuth } from '../../../hooks/useAuth';
import FieldRow from '../../../shared/ui/field-row';
import SectionHeader from '../../../shared/ui/section-header';
import VitalSignsHistoryTab from '../../Hospitalizacion/VitalSignsHistoryTab';
import MedicalPlanSection from '../../Emergency/MedicalPlanSection';
import MedicationAdminPanel from '../../Hospitalizacion/MedicationAdminPanel';
import DeleteConfirmModal from '../../../shared/ui/delete-confirm-modal';
import FluidBalancePanel from '../../Hospitalizacion/FluidBalancePanel';

const NursingDetail = ({ emergencyId, hospitalizationId, patient, onBack }) => {
  const { user } = useAuth();

  const { data: emergency } = useFetch(
    () => emergencyId ? BackendAPI.emergencies.getById(emergencyId) : Promise.resolve(null),
    [emergencyId],
  );
  const [nursingNoteOpen, setNursingNoteOpen] = useState(false);
  const [nursingNoteText, setNursingNoteText] = useState('');
  const [savingNursingNote, setSavingNursingNote] = useState(false);
  const [editingNursingNote, setEditingNursingNote] = useState(null);
  const [editingNursingNoteText, setEditingNursingNoteText] = useState('');
  const [deleteNoteTarget, setDeleteNoteTarget] = useState(null);
  const [deletingNote, setDeletingNote] = useState(false);

  const { data: notesData, refetch: refetchNursingNotes } = useFetch(
    () => emergencyId ? BackendAPI.notes.getAll({ emergency_id: emergencyId }) : Promise.resolve([]),
    [emergencyId],
  );
  const nursingNotes = useMemo(() => (notesData || []).filter((n) => n.note_type === 'nursing'), [notesData]);
  const currentUserId = user?.id;

  const p = patient || emergency?.patient || {};

  const handleSaveNursingNote = async () => {
    if (!nursingNoteText.trim() || !emergencyId) return;
    setSavingNursingNote(true);
    try {
      await BackendAPI.notes.create({ note: nursingNoteText, emergency_id: emergencyId, patient_id: p.id, note_type: 'nursing' });
      setNursingNoteText('');
      setNursingNoteOpen(false);
      refetchNursingNotes();
    } catch { /* ignore */ }
    setSavingNursingNote(false);
  };

  const handleUpdateNursingNote = useCallback(async (noteId, patientId) => {
    if (!editingNursingNoteText.trim()) return;
    try {
      await BackendAPI.notes.update({ id: noteId, note: editingNursingNoteText, patient_id: patientId, note_type: 'nursing' });
      setEditingNursingNote(null);
      setEditingNursingNoteText('');
      refetchNursingNotes();
    } catch { /* ignore */ }
  }, [editingNursingNoteText, refetchNursingNotes]);

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', flex: 1, bgcolor: 'background.default' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ alignSelf: 'flex-start', fontSize: '0.8rem' }}>
        Volver al Dashboard
      </Button>

      <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', color: 'secondary.main' }}>
        Detalle de Enfermería
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Paper sx={{ p: 1.5, bgcolor: 'primary.light', borderLeft: 3, borderColor: 'primary.main', flex: 1 }}>
          <SectionHeader icon={<InfoIcon sx={{ fontSize: 16 }} />} label="DATOS DEL PACIENTE" color="primary.main" />
          <Grid container spacing={0}>
            <Grid item xs={6}><FieldRow label="Nombre" value={`${p.name || ''} ${p.lastname || ''}`} /></Grid>
            <Grid item xs={6}><FieldRow label="CI" value={p.ci} /></Grid>
            <Grid item xs={6}><FieldRow label="Edad" value={p.age ? `${p.age} años` : ''} /></Grid>
            <Grid item xs={6}><FieldRow label="Género" value={p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : ''} /></Grid>
          </Grid>
        </Paper>

        {emergency && (
          <Paper sx={{ p: 1.5, bgcolor: 'warning.light', borderLeft: 3, borderColor: 'warning.dark', flex: 1 }}>
            <SectionHeader
              icon={<LocalHospitalIcon sx={{ fontSize: 16 }} />}
              label={hospitalizationId ? 'DATOS DE HOSPITALIZACIÓN' : 'DATOS DE LA EMERGENCIA'}
              color="warning.dark"
            />
            <Grid container spacing={0}>
              <Grid item xs={6}><FieldRow label="Diagnóstico" value={emergency.diagnostic} /></Grid>
              <Grid item xs={6}><FieldRow label="Plan" value={emergency.treatment} /></Grid>
              <Grid item xs={6}><FieldRow label="Médico" value={emergency.primary_doctor?.name} /></Grid>
              <Grid item xs={6}><FieldRow label="Ingreso" value={emergency.ingress_date ? moment(emergency.ingress_date).format('DD/MM/YYYY HH:mm') : ''} /></Grid>
              {emergency.observations && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 0.5, p: 0.75, bgcolor: 'warning.light', borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight={600} sx={{ color: 'warning.dark', fontSize: '0.65rem' }}>Observaciones</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.73rem', mt: 0.25 }}>{emergency.observations}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}
      </Box>

      {emergencyId ? (
        <Paper sx={{ p: 1.5 }}>
          <SectionHeader icon={<FavoriteIcon sx={{ fontSize: 16 }} />} label="SIGNOS VITALES" color="error.main" />
          <VitalSignsHistoryTab emergencyId={emergencyId} readOnly={false} />
        </Paper>
      ) : (
        <Typography variant="caption" color="text.secondary">Sin emergencia asociada</Typography>
      )}

      {emergencyId && (
        <Paper sx={{ p: 1.5 }}>
          <SectionHeader
            icon={<MedicationIcon sx={{ fontSize: 16 }} />}
            label="MEDICAMENTOS"
            color="secondary.main"
          />
          <MedicationAdminPanel hospitalizationId={hospitalizationId} emergencyId={emergencyId} />
        </Paper>
      )}

      {emergencyId && (
        <Paper sx={{ p: 1.5 }}>
          <MedicalPlanSection emergencyId={emergencyId} readOnly={true} />
        </Paper>
      )}

      {hospitalizationId && (
        <FluidBalancePanel hospitalizationId={hospitalizationId} />
      )}

      {emergency && (
        <Paper sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <SectionHeader icon={<DescriptionIcon sx={{ fontSize: 16 }} />} label="NOTAS DE ENFERMERÍA" color="success.main" />
            <Tooltip title="Agregar nota de enfermería" arrow>
              <IconButton size="small" onClick={() => setNursingNoteOpen(true)} sx={{ p: 0.25 }}>
                <AddCircleOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {nursingNoteOpen && (
            <Box sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1, border: 1, borderColor: 'primary.main' }}>
              <TextField
                variant="standard"
                size="small"
                placeholder="Escribir nota de enfermería..."
                value={nursingNoteText}
                onChange={(e) => setNursingNoteText(e.target.value)}
                multiline
                rows={2}
                fullWidth
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveNursingNote();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => { setNursingNoteOpen(false); setNursingNoteText(''); }} sx={{ p: 0.25 }}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleSaveNursingNote}
                          disabled={savingNursingNote || !nursingNoteText.trim()}
                          sx={{ p: 0.25 }}
                        >
                          {savingNursingNote ? <CircularProgress size={14} /> : <SendIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {nursingNotes.length === 0 && !nursingNoteOpen ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Sin notas de enfermería registradas</Typography>
          ) : (
            nursingNotes.map((note) => (
              <Box key={note.id} sx={{ mb: 0.5, p: 0.75, bgcolor: 'white', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                      {note.created_at ? new Date(note.created_at).toLocaleDateString() + ' ' + new Date(note.created_at).toLocaleTimeString() : '—'}
                      {note.created_by?.name ? ' · ' + note.created_by.name : ''}
                    </Typography>
                    {editingNursingNote?.id === note.id ? (
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                        <TextField
                          variant="standard"
                          size="small"
                          value={editingNursingNoteText}
                          onChange={(e) => setEditingNursingNoteText(e.target.value)}
                          multiline
                          rows={2}
                          fullWidth
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleUpdateNursingNote(note.id, note.patient_id);
                            }
                            if (e.key === 'Escape') {
                              setEditingNursingNote(null);
                              setEditingNursingNoteText('');
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => { setEditingNursingNote(null); setEditingNursingNoteText(''); }} sx={{ p: 0.25 }}>
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleUpdateNursingNote(note.id, note.patient_id)}
                                    sx={{ p: 0.25 }}
                                  >
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ fontSize: '0.73rem', mt: 0.25 }}>{note.note}</Typography>
                    )}
                  </Box>
                  {editingNursingNote?.id !== note.id && (
                    <Box sx={{ display: 'flex', gap: 0.25, ml: 1 }}>
                      {note.created_by?.id === currentUserId && (
                        <>
                          <IconButton size="small" color="primary" onClick={() => {
                            setEditingNursingNote(note);
                            setEditingNursingNoteText(note.note);
                          }}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteNoteTarget(note)}>
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            ))
          )}

          <DeleteConfirmModal
            open={!!deleteNoteTarget}
            onClose={() => setDeleteNoteTarget(null)}
            onConfirm={async () => {
              if (!deleteNoteTarget) return;
              setDeletingNote(true);
              try {
                await BackendAPI.notes.delete(deleteNoteTarget.id);
              } catch { /* ignore */ }
              setDeletingNote(false);
              setDeleteNoteTarget(null);
              refetchNursingNotes();
            }}
            loading={deletingNote}
            message="¿Eliminar esta nota de enfermería?"
          />
        </Paper>
      )}
    </Box>
  );
};

export default NursingDetail;
