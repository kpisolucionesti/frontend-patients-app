import { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, TextField, CircularProgress, IconButton,
  InputAdornment, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DescriptionIcon from '@mui/icons-material/Description';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
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
import { CLASSIFICATION_OPTIONS } from '../../../constants';
import { toFrontendKey } from '../../../entities/emergency/config';
import { sanitizeNumber } from '../../../utils/sanitize';
import { useSnackbar } from '../../../hooks/useSnackbar';

const EMPTY_VITAL_FORM = {
  systolic_bp: '', diastolic_bp: '', heart_rate: '', respiratory_rate: '',
  temperature: '', oxygen_saturation: '', glucose: '', height: '', weight: '', bmi: '',
};

const NursingDetail = ({ emergencyId, hospitalizationId, patient, onBack }) => {
  const { user } = useAuth();
  const { show: showSnackbar } = useSnackbar();

  const { data: emergency } = useFetch(
    () => emergencyId ? BackendAPI.emergencies.getById(emergencyId) : Promise.resolve(null),
    [emergencyId],
  );

  const { data: notesData, refetch: refetchNursingNotes } = useFetch(
    () => emergencyId ? BackendAPI.notes.getAll({ emergency_id: emergencyId }) : Promise.resolve([]),
    [emergencyId],
  );
  const nursingNotes = useMemo(() => (notesData || []).filter((n) => n.note_type === 'nursing'), [notesData]);
  const currentUserId = user?.id;

  const { data: vitalSigns = [], refetch: refetchVitalSigns } = useFetch(
    () => emergencyId ? BackendAPI.vitalSigns.getAll(emergencyId) : Promise.resolve([]),
    [emergencyId],
  );

  const p = patient || emergency?.patient || {};

  // ── Note state ──
  const [nursingNoteOpen, setNursingNoteOpen] = useState(false);
  const [nursingNoteText, setNursingNoteText] = useState('');
  const [savingNursingNote, setSavingNursingNote] = useState(false);
  const [editingNursingNote, setEditingNursingNote] = useState(null);
  const [editingNursingNoteText, setEditingNursingNoteText] = useState('');
  const [deleteNoteTarget, setDeleteNoteTarget] = useState(null);
  const [deletingNote, setDeletingNote] = useState(false);

  // ── Vital signs modal ──
  const [vitalSignsOpen, setVitalSignsOpen] = useState(false);
  const [vitalForm, setVitalForm] = useState({ ...EMPTY_VITAL_FORM });
  const [savingVitals, setSavingVitals] = useState(false);
  const [vitalRefreshKey, setVitalRefreshKey] = useState(0);

  // ── Handlers: notes ──
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

  // ── Handlers: vital signs ──
  const handleVitalFieldChange = (field, value) => {
    const sanitized = sanitizeNumber(value);
    const updated = { ...vitalForm, [field]: sanitized };
    const h = parseFloat(updated.height);
    const w = parseFloat(updated.weight);
    if (h > 0 && w > 0) { const hm = h / 100; updated.bmi = (w / (hm ** 2)).toFixed(1); }
    else { updated.bmi = ''; }
    setVitalForm(updated);
  };

  const handleSaveVitals = async () => {
    if (Object.values(vitalForm).every((v) => v === '')) { showSnackbar('Debe ingresar al menos un signo vital', 'warning'); return; }
    setSavingVitals(true);
    try {
      const data = {};
      Object.entries(vitalForm).forEach(([k, v]) => { if (v !== '') data[k] = Number(v); });
      await BackendAPI.vitalSigns.create(emergencyId, data);
      showSnackbar('Signos vitales registrados', 'success');
      setVitalForm({ ...EMPTY_VITAL_FORM });
      setVitalSignsOpen(false);
      setVitalRefreshKey((k) => k + 1);
      refetchVitalSigns();
    } catch { showSnackbar('Error al guardar signos vitales', 'error'); }
    finally { setSavingVitals(false); }
  };

  const handleOpenVitalModal = () => { setVitalForm({ ...EMPTY_VITAL_FORM }); setVitalSignsOpen(true); };

  // ── Handlers: medication ──

  const classificationKey = toFrontendKey(emergency?.classification);
  const classificationOpt = CLASSIFICATION_OPTIONS.find((c) => c.key === classificationKey);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
      {/* ── Back button ── */}
      <Box sx={{ px: 2, pt: 1.5, flexShrink: 0 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ fontSize: '0.8rem' }}>
          Volver al Dashboard
        </Button>
      </Box>

      {/* ── Patient header ── */}
      <Box sx={{ flexShrink: 0, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', px: 2, mt: 0.5, py: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <PersonIcon sx={{ color: 'primary.main', fontSize: 18, flexShrink: 0 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.name || ''} {p.lastname || ''}
            </Typography>
          </Box>
          <Chip label={`CI: ${p.ci || '—'}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }} />
          <Chip label={`HC: ${p.medical_history_number || '—'}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
            {p.age || '?'}a · {p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : '—'}
          </Typography>
          {classificationOpt && (
            <Chip label={classificationOpt.label} size="small"
              sx={{ bgcolor: classificationOpt.color, color: ['yellow', 'green'].includes(classificationKey) ? '#212121' : 'white', fontWeight: 600, height: 20, fontSize: '0.65rem', ml: 'auto', flexShrink: 0 }} />
          )}
        </Box>
      </Box>

      {/* ── Unified action bar ── */}
      <Box sx={{ flexShrink: 0, display: 'flex', gap: 0.75, px: 2, py: 0.75, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
        <Button variant="outlined" size="small" color="error" startIcon={<FavoriteIcon sx={{ fontSize: 16 }} />}
          onClick={handleOpenVitalModal} sx={{ fontSize: '0.7rem', py: 0.25, flexShrink: 0 }}>
          Registrar Signos Vitales
        </Button>
        <Button variant="outlined" size="small" color="success" startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
          onClick={() => setNursingNoteOpen(true)} sx={{ fontSize: '0.7rem', py: 0.25, flexShrink: 0 }}>
          Nueva Nota
        </Button>
        <Box sx={{ flex: 1 }} />
      </Box>

      {/* ── Main content: 2 columns ── */}
      <Box sx={{ flex: 1, minHeight: 0, display: { xs: 'block', md: 'flex' }, gap: 1.5, p: 2, overflow: 'auto' }}>
        {/* Left column: Context */}
        <Box sx={{ width: { xs: '100%', md: '31%' }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5, mb: { xs: 1.5, md: 0 } }}>
          <Paper sx={{ p: 1.5, bgcolor: 'primary.light', borderLeft: 3, borderColor: 'primary.main' }}>
            <SectionHeader icon={<LocalHospitalIcon sx={{ fontSize: 16 }} />} label={hospitalizationId ? 'DATOS DE HOSPITALIZACIÓN' : 'DATOS DE LA EMERGENCIA'} color="primary.main" />
            <Box sx={{ mt: 0.5 }}>
              <FieldRow label="Diagnóstico" value={emergency?.diagnostic} />
              <FieldRow label="Plan" value={emergency?.treatment} />
              <FieldRow label="Médico" value={emergency?.primary_doctor?.name} />
              <FieldRow label="Ingreso" value={emergency?.ingress_date ? moment(emergency.ingress_date).format('DD/MM/YYYY HH:mm') : ''} />
              {emergency?.observations && (
                <Box sx={{ mt: 0.5, p: 0.75, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>Observaciones</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.73rem', mt: 0.25 }}>{emergency.observations}</Typography>
                </Box>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 1.5 }}>
            <MedicalPlanSection emergencyId={emergencyId} readOnly={true} />
          </Paper>

          <Paper sx={{ p: 1.5 }}>
            <SectionHeader icon={<DescriptionIcon sx={{ fontSize: 16 }} />} label="NOTAS DE ENFERMERÍA" color="success.main" />
            {nursingNotes.length === 0 ? (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', mt: 0.5, display: 'block' }}>Sin notas registradas</Typography>
            ) : (
              nursingNotes.map((note) => (
                <Box key={note.id} sx={{ mt: 0.5, p: 0.75, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                        {note.created_at ? new Date(note.created_at).toLocaleDateString() + ' ' + new Date(note.created_at).toLocaleTimeString() : '—'}
                        {note.created_by?.name ? ' · ' + note.created_by.name : ''}
                      </Typography>
                      {editingNursingNote?.id === note.id ? (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                          <TextField variant="standard" size="small" value={editingNursingNoteText}
                            onChange={(e) => setEditingNursingNoteText(e.target.value)} multiline rows={2} fullWidth autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUpdateNursingNote(note.id, note.patient_id); }
                              if (e.key === 'Escape') { setEditingNursingNote(null); setEditingNursingNoteText(''); }
                            }}
                            InputProps={{ endAdornment: (
                              <InputAdornment position="end">
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => { setEditingNursingNote(null); setEditingNursingNoteText(''); }} sx={{ p: 0.25 }}><CloseIcon fontSize="small" /></IconButton>
                                  <IconButton size="small" color="primary" onClick={() => handleUpdateNursingNote(note.id, note.patient_id)} sx={{ p: 0.25 }}><SendIcon fontSize="small" /></IconButton>
                                </Box>
                              </InputAdornment>
                            )}}
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
                            <IconButton size="small" color="primary" onClick={() => { setEditingNursingNote(note); setEditingNursingNoteText(note.note); }}><EditOutlinedIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => setDeleteNoteTarget(note)}><DeleteOutlinedIcon fontSize="small" /></IconButton>
                          </>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))
            )}
            <DeleteConfirmModal open={!!deleteNoteTarget} onClose={() => setDeleteNoteTarget(null)}
              onConfirm={async () => {
                if (!deleteNoteTarget) return; setDeletingNote(true);
                try { await BackendAPI.notes.delete(deleteNoteTarget.id); } catch { /* ignore */ }
                setDeletingNote(false); setDeleteNoteTarget(null); refetchNursingNotes();
              }} loading={deletingNote} message="¿Eliminar esta nota de enfermería?" />
          </Paper>
        </Box>

        {/* Right column: Data tables */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Vital signs table */}
          {emergencyId && (
            <Box>
              <VitalSignsHistoryTab emergencyId={emergencyId} readOnly key={vitalRefreshKey} />
            </Box>
          )}

          {/* Medications table */}
          {emergencyId && (
            <Box>
              <MedicationAdminPanel hospitalizationId={hospitalizationId} emergencyId={emergencyId} />
            </Box>
          )}

          {/* Fluid balance */}
          {hospitalizationId && (
            <Box>
              <FluidBalancePanel hospitalizationId={hospitalizationId} />
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Vital signs modal ── */}
      <Dialog open={vitalSignsOpen} onClose={() => setVitalSignsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
          NUEVO REGISTRO DE SIGNOS VITALES
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid item xs={4}><TextField variant="standard" size="small" label="PA Sist" type="number" fullWidth value={vitalForm.systolic_bp} onChange={(e) => handleVitalFieldChange('systolic_bp', e.target.value)} inputProps={{ style: { fontSize: '0.75rem' } }} /></Grid>
            <Grid item xs={4}><TextField variant="standard" size="small" label="PA Diast" type="number" fullWidth value={vitalForm.diastolic_bp} onChange={(e) => handleVitalFieldChange('diastolic_bp', e.target.value)} inputProps={{ style: { fontSize: '0.75rem' } }} /></Grid>
            <Grid item xs={4}><TextField variant="standard" size="small" label="FC (lpm)" type="number" fullWidth value={vitalForm.heart_rate} onChange={(e) => handleVitalFieldChange('heart_rate', e.target.value)} inputProps={{ style: { fontSize: '0.75rem' } }} /></Grid>
            <Grid item xs={4}><TextField variant="standard" size="small" label="FR (rpm)" type="number" fullWidth value={vitalForm.respiratory_rate} onChange={(e) => handleVitalFieldChange('respiratory_rate', e.target.value)} inputProps={{ style: { fontSize: '0.75rem' } }} /></Grid>
            <Grid item xs={4}><TextField variant="standard" size="small" label="Temp (°C)" type="number" fullWidth value={vitalForm.temperature} onChange={(e) => handleVitalFieldChange('temperature', e.target.value)} inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} /></Grid>
            <Grid item xs={4}><TextField variant="standard" size="small" label="SpO2 (%)" type="number" fullWidth value={vitalForm.oxygen_saturation} onChange={(e) => handleVitalFieldChange('oxygen_saturation', e.target.value)} inputProps={{ style: { fontSize: '0.75rem' } }} /></Grid>
            <Grid item xs={4}><TextField variant="standard" size="small" label="GLC (mg/dL)" type="number" fullWidth value={vitalForm.glucose} onChange={(e) => handleVitalFieldChange('glucose', e.target.value)} inputProps={{ style: { fontSize: '0.75rem' } }} /></Grid>
            <Grid item xs={4}><TextField variant="standard" size="small" label="Talla (cm)" type="number" fullWidth value={vitalForm.height} onChange={(e) => handleVitalFieldChange('height', e.target.value)} inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} /></Grid>
            <Grid item xs={4}><TextField variant="standard" size="small" label="Peso (kg)" type="number" fullWidth value={vitalForm.weight} onChange={(e) => handleVitalFieldChange('weight', e.target.value)} inputProps={{ step: 0.1, style: { fontSize: '0.75rem' } }} /></Grid>
            <Grid item xs={4}><TextField variant="standard" size="small" label="IMC" disabled fullWidth value={vitalForm.bmi} inputProps={{ style: { fontSize: '0.75rem' } }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVitalSignsOpen(false)} variant="outlined" color="error">Cancelar</Button>
          <Button onClick={handleSaveVitals} variant="outlined" color="success" disabled={savingVitals}>
            {savingVitals ? 'Guardando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Note modal ── */}
      <Dialog open={nursingNoteOpen} onClose={() => { setNursingNoteOpen(false); setNursingNoteText(''); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
          NUEVA NOTA DE ENFERMERÍA
        </DialogTitle>
        <DialogContent>
          <TextField variant="standard" size="small" placeholder="Escribir nota de enfermería..."
            value={nursingNoteText} onChange={(e) => setNursingNoteText(e.target.value)}
            multiline rows={4} fullWidth autoFocus
            inputProps={{ style: { fontSize: '0.75rem' } }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setNursingNoteOpen(false); setNursingNoteText(''); }} variant="outlined" color="error">Cancelar</Button>
          <Button onClick={handleSaveNursingNote} variant="outlined" color="success" disabled={savingNursingNote || !nursingNoteText.trim()}>
            {savingNursingNote ? 'Guardando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NursingDetail;
