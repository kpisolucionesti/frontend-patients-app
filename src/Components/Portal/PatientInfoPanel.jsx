import { useMemo, useState, useCallback } from 'react';
import {
  Box, Paper, Typography, Chip, Grid, Button, TextField, MenuItem, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import SubjectIcon from '@mui/icons-material/Subject';
import VitalSignsPanel from './VitalSignsPanel';
import AsignRoom from '../Board/asignRoomModal';
import NoteItem from '../Emergency/NoteItem';
import AddNoteInline from '../Emergency/AddNoteInline';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { CLASSIFICATION_OPTIONS } from '../../constants';
import { useSnackbar } from '../../hooks/useSnackbar';

const STATUS_MAP = {
  0: { label: 'Esperando', color: 'warning' },
  1: { label: 'Atendido', color: 'info' },
  2: { label: 'Alta', color: 'success' },
  3: { label: 'Ingresado', color: 'secondary' },
  4: { label: 'Anulada', color: 'default' },
  5: { label: 'Fallecido', color: 'default' },
};

const GENDER_MAP = { M: 'Masculino', F: 'Femenino' };

const PatientInfoPanel = ({ patient, emergency, vitalSigns, onVitalSignsCreated }) => {
  const [diagnostic, setDiagnostic] = useState(emergency?.diagnostic || '');
  const [treatment, setTreatment] = useState(emergency?.treatment || '');
  const [observations, setObservations] = useState(emergency?.observations || '');
  const [status, setStatus] = useState(emergency?.status || 1);
  const [classification, setClassification] = useState(emergency?.classification || '');
  const [saving, setSaving] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [deathDialogOpen, setDeathDialogOpen] = useState(false);
  const [deathCause, setDeathCause] = useState('');
  const [deathDateTime, setDeathDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [deathObservations, setDeathObservations] = useState('');
  const [currentDoctor, setCurrentDoctor] = useState(emergency?.primary_doctor?.id || null);
  const { show: showSnackbar } = useSnackbar();

  const { data: doctors } = useFetch(() => BackendAPI.doctors.getAll(), []);

  const isDeceased = patient?.disabled;

  const { data: rooms } = useFetch(() => BackendAPI.rooms.getAll(), []);
  const patientRoom = useMemo(
    () => (rooms || []).find((r) => r.patient_id === patient?.id),
    [rooms, patient?.id],
  );

  const { data: notesData, refetch: refetchNotes } = useFetch(
    () => emergency?.id ? BackendAPI.notes.getAll({ emergency_id: emergency.id }) : Promise.resolve([]),
    [emergency?.id],
  );
  const patientNotes = useMemo(() => notesData || [], [notesData]);

  const handleSave = async () => {
    if (!emergency) return;
    setSaving(true);
    try {
      const payload = {
        id: emergency.id,
        diagnostic,
        treatment,
        observations,
        status,
        classification,
      };
      if (currentDoctor) payload.doctors = [{ id: currentDoctor }];
      await BackendAPI.emergencies.update(payload);
      showSnackbar('Emergencia actualizada', 'success');
    } catch {
      showSnackbar('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEmergency = async () => {
    if (!emergency || !cancelReason) return;
    setSaving(true);
    try {
      await BackendAPI.emergencies.update({
        id: emergency.id,
        status: 4,
        medical_exit: cancelReason,
      });
      showSnackbar('Emergencia anulada', 'success');
      setCancelDialogOpen(false);
      setCancelReason('');
      window.location.reload();
    } catch {
      showSnackbar('Error al anular emergencia', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeath = async () => {
    if (!emergency || !deathCause) return;
    setSaving(true);
    try {
      await BackendAPI.emergencies.update({
        id: emergency.id,
        status: 5,
        cause_of_death: deathCause,
        egress_at: new Date(deathDateTime).toISOString(),
        observations: deathObservations,
      });
      await BackendAPI.patients.update(patient.id, { disabled: true });
      showSnackbar('Fallecimiento registrado', 'success');
      setDeathDialogOpen(false);
      window.location.reload();
    } catch {
      showSnackbar('Error al registrar fallecimiento', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEmergency = async () => {
    if (!patient) return;
    if (!diagnostic || !treatment) {
      showSnackbar('Debe completar diagnóstico y tratamiento', 'error');
      return;
    }
    setSaving(true);
    try {
      const doctorsPayload = currentDoctor ? [{ id: currentDoctor }] : [];
      await BackendAPI.emergencies.create({
        patient_id: patient.id,
        ingress_date: new Date().toISOString().split('T')[0],
        diagnostic,
        treatment,
        observations,
        classification,
        status: 1,
        doctors: doctorsPayload,
      });
      showSnackbar('Emergencia iniciada', 'success');
      onVitalSignsCreated();
      window.location.reload();
    } catch {
      showSnackbar('Error al iniciar emergencia', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {isDeceased && (
        <Paper sx={{ p: 1, bgcolor: '#212121', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" fontWeight={700}>PACIENTE FALLECIDO — Solo lectura</Typography>
        </Paper>
      )}

      <Paper sx={{ p: 1.5 }}>
        <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block', color: '#1565c0' }}>
          DATOS DEL PACIENTE
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Nombre</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.name} {patient.lastname}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" color="text.secondary">CI</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.ci || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" color="text.secondary">Edad</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.age || '?'} años</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Sexo</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{GENDER_MAP[patient.gender] || patient.gender || 'N/A'}</Typography>
          </Grid>
          {patient.representante && (
            <>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Representante</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.representante}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">CI Representante</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.representante_ci || 'N/A'}</Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {emergency && (
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block', color: '#e65100' }}>
            EMERGENCIA ACTUAL
          </Typography>
          <Box sx={{ mb: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={STATUS_MAP[emergency.status]?.label || 'Desconocido'}
              color={STATUS_MAP[emergency.status]?.color || 'default'}
              size="small"
            />
            {(classification || emergency.classification) && (
              <Chip
                label={CLASSIFICATION_OPTIONS.find((c) => c.key === (classification || emergency.classification))?.label || classification || emergency.classification}
                size="small"
                sx={{
                  bgcolor: CLASSIFICATION_OPTIONS.find((c) => c.key === (classification || emergency.classification))?.color || '#999',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Grid container spacing={0.5}>
            <Grid item xs={3}>
              <Typography variant="caption" color="text.secondary">F. Ingreso</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{emergency.ingress_date}</Typography>
            </Grid>
            <Grid item xs={5}>
              <Typography variant="caption" color="text.secondary">Médico</Typography>
              {isDeceased ? (
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{emergency.primary_doctor?.name || 'No asignado'}</Typography>
              ) : (
                <Autocomplete
                  size="small"
                  options={doctors || []}
                  getOptionLabel={(option) => option.name}
                  value={(doctors || []).find((d) => d.id === currentDoctor) || null}
                  onChange={(_e, newValue) => setCurrentDoctor(newValue ? newValue.id : null)}
                  renderInput={(params) => (
                    <TextField variant="standard" {...params} size="small"
                      sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
                  )}
                  disableClearable
                  disablePortal
                  sx={{ width: '100%' }}
                />
              )}
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">Cama</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patientRoom?.name || 'No asignada'}</Typography>
            </Grid>
          </Grid>

          <TextField variant="standard" fullWidth size="small" label="Diagnóstico" value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
            disabled={isDeceased}
            sx={{ mt: 0.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
          <TextField variant="standard" fullWidth size="small" label="Plan" value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            disabled={isDeceased}
            sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
          <TextField variant="standard" fullWidth size="small" label="Observaciones" value={observations}
            onChange={(e) => setObservations(e.target.value)} multiline rows={2}
            disabled={isDeceased}
            sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
          {!isDeceased && (
            <TextField select variant="standard" fullWidth size="small" label="Clasificación" value={classification}
              onChange={(e) => setClassification(e.target.value)}
              sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}>
              <MenuItem value=""><em>Sin clasificación</em></MenuItem>
              {CLASSIFICATION_OPTIONS.map((opt) => (
                <MenuItem key={opt.key} value={opt.key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: opt.color }} />
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          )}
          {!isDeceased && emergency.status === 1 && (
            <TextField select variant="standard" fullWidth size="small" label="Cambiar Estado" value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}>
              <MenuItem value={1}>Atendido</MenuItem>
              <MenuItem value={2}>Alta</MenuItem>
              <MenuItem value={3}>Ingresado</MenuItem>
            </TextField>
          )}

          {!isDeceased && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}
                onClick={emergency?.id ? handleSave : handleStartEmergency}
                disabled={saving}
              >
                {emergency?.id ? 'Guardar' : 'Iniciar Emergencia'}
              </Button>
              {emergency?.status === 1 && <AsignRoom row={{ ...emergency, patient }} onStatusChange={() => {}} />}
              {emergency?.id && emergency.status === 1 && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={saving}
                  >
                    Anular
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<WarningIcon />}
                    onClick={() => setDeathDialogOpen(true)}
                    disabled={saving}
                    sx={{ borderColor: '#212121', color: '#212121', '&:hover': { borderColor: '#212121', bgcolor: '#f5f5f5' } }}
                  >
                    Fallecido
                  </Button>
                </>
              )}
            </Box>
          )}

          <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#616161', color: 'white', fontSize: '0.85rem' }}>
              ANULAR EMERGENCIA
            </DialogTitle>
            <DialogContent style={{ paddingTop: 24 }}>
              <TextField variant="standard" fullWidth size="small" required multiline rows={3}
                label="Motivo de anulación" value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                error={!cancelReason}
                helperText={!cancelReason ? 'Requerido' : ''}
              />
            </DialogContent>
            <DialogActions>
              <Button size="small" onClick={() => setCancelDialogOpen(false)}>Cancelar</Button>
              <Button size="small" variant="contained" color="error" onClick={handleCancelEmergency}
                disabled={saving || !cancelReason}>
                {saving ? 'Anulando...' : 'Anular Emergencia'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deathDialogOpen} onClose={() => setDeathDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: '#212121', color: 'white', fontSize: '0.85rem' }}>
              REGISTRAR FALLECIMIENTO
            </DialogTitle>
            <DialogContent style={{ paddingTop: 24 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField variant="standard" fullWidth size="small" required label="Causa de Muerte"
                  value={deathCause} onChange={(e) => setDeathCause(e.target.value)}
                  error={!deathCause} helperText={!deathCause ? 'Requerido' : ''} />
                <TextField variant="standard" fullWidth size="small" label="Fecha y Hora de Muerte"
                  type="datetime-local" value={deathDateTime}
                  onChange={(e) => setDeathDateTime(e.target.value)}
                  InputLabelProps={{ shrink: true }} />
                <TextField variant="standard" fullWidth size="small" label="Observaciones"
                  value={deathObservations} onChange={(e) => setDeathObservations(e.target.value)}
                  multiline rows={2} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button size="small" onClick={() => setDeathDialogOpen(false)}>Cancelar</Button>
              <Button size="small" variant="contained" color="error" onClick={handleDeath}
                disabled={saving || !deathCause}>
                {saving ? 'Guardando...' : 'Confirmar Fallecimiento'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      )}

      {!emergency && !isDeceased && (
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block', color: '#e65100' }}>
            NUEVA EMERGENCIA
          </Typography>
          <TextField variant="standard" fullWidth size="small" label="Diagnóstico" value={diagnostic}
            onChange={(e) => setDiagnostic(e.target.value)}
            sx={{ mt: 0.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
          <TextField variant="standard" fullWidth size="small" label="Plan" value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
          <Autocomplete
            size="small" fullWidth
            options={doctors || []}
            getOptionLabel={(option) => option.name}
            value={(doctors || []).find((d) => d.id === currentDoctor) || null}
            onChange={(_e, newValue) => setCurrentDoctor(newValue ? newValue.id : null)}
            renderInput={(params) => (
              <TextField variant="standard" {...params} size="small" label="Médico Principal"
                sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
            )}
            sx={{ mt: 0.75 }}
          />
          <Box sx={{ mt: 1 }}>
              <Button variant="contained" size="small" startIcon={saving ? <CircularProgress size={14} /> : <MedicalServicesIcon />}
                onClick={handleStartEmergency} disabled={saving || !diagnostic || !treatment}>
                Iniciar Emergencia
              </Button>
          </Box>
        </Paper>
      )}

      {emergency && (
        <Paper sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <SubjectIcon sx={{ fontSize: 18, color: '#7b1fa2' }} />
            <Typography variant="caption" fontWeight={600} sx={{ color: '#7b1fa2' }}>
              NOTAS
            </Typography>
          </Box>
          {patientNotes.length === 0 ? (
            <Typography variant="caption" color="text.secondary">Sin notas</Typography>
          ) : isDeceased ? (
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
          {!isDeceased && (
            <Box sx={{ mt: 1 }}>
              <AddNoteInline emergencyId={emergency.id} patientId={patient.id} onAdded={refetchNotes} />
            </Box>
          )}
        </Paper>
      )}

      {emergency && (
        <VitalSignsPanel
          emergencyId={emergency.id}
          vitalSigns={vitalSigns}
          onCreated={onVitalSignsCreated}
          readOnly={isDeceased}
        />
      )}
    </Box>
  );
};

export default PatientInfoPanel;
