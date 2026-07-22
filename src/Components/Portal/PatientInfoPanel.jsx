import { useMemo, useState, useCallback } from 'react';
import {
  Box, Paper, Typography, Chip, Grid, Button, TextField, MenuItem, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PhysicalExamTable from './PhysicalExamTable';
import InformeMedicoPreview from '../Commons/InformeMedicoPreview';
import HistoriaMedicaPreview from '../Commons/HistoriaMedicaPreview';
import AsignRoom from '../Board/asignRoomModal';
import { BackendAPI } from '../../services/BackendApi';
import { useDoctors, useRooms } from '../../hooks/useApiData';
import { useFetch } from '../../hooks/useFetch';
import usePermissions from '../../hooks/usePermissions';
import { CLASSIFICATION_OPTIONS } from '../../constants';
import { useSnackbar } from '../../hooks/useSnackbar';
import { medicalHistoryApi } from '../../services/medicalHistoryApi';
import { generateEmergencyReport } from '../../services/medicalHistoryReport';
import { sanitizeInput } from '../../utils/sanitize';

const STATUS_MAP = {
  0: { label: 'Esperando', color: 'warning' },
  1: { label: 'Atendido', color: 'info' },
  2: { label: 'Alta Médica', color: 'success' },
  3: { label: 'Ingreso a Hospitalización', color: 'secondary' },
  4: { label: 'Anulada', color: 'default' },
  5: { label: 'Fallecido', color: 'default' },
};

const STATUS_LABELS = {
  0: 'Esperando', 1: 'Atendido', 2: 'Alta', 3: 'Ingresado', 4: 'Anulada', 5: 'Fallecido',
};

const FieldRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, py: 0.4 }}>
    <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, minWidth: 140, fontSize: '0.72rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontSize: '0.78rem', color: value ? 'text.primary' : 'text.disabled' }}>
      {value || '—'}
    </Typography>
  </Box>
);

const PatientInfoPanel = ({ patient, emergency, onStartEmergency, readOnly, reportPermission }) => {
  const [informePreviewOpen, setInformePreviewOpen] = useState(false);
  const [historiaMedicaOpen, setHistoriaMedicaOpen] = useState(false);
  const [diagnostic, setDiagnostic] = useState(emergency?.diagnostic || '');
  const [treatment, setTreatment] = useState(emergency?.treatment || '');
  const [observations, setObservations] = useState(emergency?.observations || '');
  const [status, setStatus] = useState(emergency?.status || 1);
  const [classification, setClassification] = useState(emergency?.classification || '');
  const [reasonForConsultation, setReasonForConsultation] = useState(emergency?.reason_for_consultation || '');
  const [currentIllness, setCurrentIllness] = useState(emergency?.current_illness || '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [deathDialogOpen, setDeathDialogOpen] = useState(false);
  const [deathCause, setDeathCause] = useState('');
  const [deathDateTime, setDeathDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [deathObservations, setDeathObservations] = useState('');
  const [currentDoctor, setCurrentDoctor] = useState(emergency?.primary_doctor?.id || null);
  const [evolutiveDialogOpen, setEvolutiveDialogOpen] = useState(false);
  const [evolutiveType, setEvolutiveType] = useState(null);
  const [evolutiveNote, setEvolutiveNote] = useState('');
  const [dischargeNote, setDischargeNote] = useState(emergency?.discharge_note || '');
  const [admissionNote, setAdmissionNote] = useState(emergency?.admission_note || '');
  const permissions = usePermissions();
  const { show: showSnackbar } = useSnackbar();

  const { data: doctors } = useDoctors();

  const isDeceased = patient?.disabled;
  const effectiveReadOnly = readOnly || isDeceased;

  const { data: rooms } = useRooms();
  const patientRoom = useMemo(
    () => (rooms || []).find((r) => r.patient_id === patient?.id),
    [rooms, patient?.id],
  );

  const { data: emergencyHistory } = useFetch(
    () => patient?.id ? BackendAPI.emergencies.getAll({ patient_id: patient.id, per_page: 50 }) : Promise.resolve({ data: [] }),
    [patient?.id],
  );

  const fieldDisabled = effectiveReadOnly || (!editing && !!emergency?.id && emergency.status !== 0);

  const classificationLabel = useMemo(() => {
    const opt = CLASSIFICATION_OPTIONS.find((c) => c.key === (classification || emergency?.classification));
    return opt ? `${opt.label}` : (classification || emergency?.classification || '');
  }, [classification, emergency]);

  const handleSave = async (extraPayload) => {
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
        reason_for_consultation: reasonForConsultation,
        current_illness: currentIllness,
        ...extraPayload,
      };
      if (currentDoctor) payload.doctors = [{ id: currentDoctor }];
      await BackendAPI.emergencies.update(payload);
      showSnackbar('Emergencia actualizada', 'success');
      setEditing(false);
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

  const handleStatusChange = (newStatus) => {
    setStatus(Number(newStatus));
    if (Number(newStatus) === 2) {
      setEvolutiveType('discharge');
      setEvolutiveNote(dischargeNote || '');
      setEvolutiveDialogOpen(true);
    } else if (Number(newStatus) === 3) {
      setEvolutiveType('admission');
      setEvolutiveNote(admissionNote || '');
      setEvolutiveDialogOpen(true);
    }
  };

  const handleEvolutiveSave = async () => {
    const extraPayload = evolutiveType === 'discharge'
      ? { status: 2, discharge_note: evolutiveNote }
      : { status: 3, transfer: 'Hospitalizacion', admission_note: evolutiveNote };
    setSaving(true);
    try {
      await handleSave(extraPayload);
      if (evolutiveType === 'discharge') setDischargeNote(evolutiveNote);
      else setAdmissionNote(evolutiveNote);
      setEvolutiveDialogOpen(false);
    } catch {
      showSnackbar('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

      {emergency && (
        <Paper sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MedicalServicesIcon sx={{ fontSize: 18, color: '#e65100' }} />
              <Typography variant="caption" fontWeight={600} sx={{ color: '#e65100' }}>
                DATOS DE LA EMERGENCIA
              </Typography>
            </Box>
            {!effectiveReadOnly && emergency.status === 1 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={editing ? <SaveIcon /> : <EditIcon />}
                onClick={editing ? () => handleSave() : () => setEditing(true)}
                disabled={saving}
                sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}
              >
                {editing ? (saving ? 'Guardando...' : 'Guardar') : 'Editar'}
              </Button>
            )}
          </Box>
          <Box sx={{ mb: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={STATUS_MAP[emergency.status]?.label || 'Desconocido'}
              color={STATUS_MAP[emergency.status]?.color || 'default'}
              size="small"
            />
            {(classification || emergency.classification) && (
              <Chip
                label={classificationLabel}
                size="small"
                sx={{
                  bgcolor: CLASSIFICATION_OPTIONS.find((c) => c.key === (classification || emergency.classification))?.color || '#999',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          {effectiveReadOnly || !editing ? (
            <Box>
              <FieldRow label="Fecha de Ingreso" value={emergency.ingress_date} />
              <FieldRow
                label="Médico"
                value={emergency.primary_doctor?.name || 'No asignado'}
              />
              <FieldRow label="Cama" value={patientRoom?.name || 'No asignada'} />
              <FieldRow label="Diagnóstico" value={diagnostic} />
              <FieldRow label="Plan" value={treatment} />
              <FieldRow label="Observaciones" value={observations} />
              <FieldRow label="Clasificación" value={classificationLabel || '—'} />
              {dischargeNote && emergency.status === 2 && (
                <Box sx={{ mt: 1, p: 1, bgcolor: '#f1f8e9', borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: '#2e7d32' }}>
                    NOTA EVOLUTIVA DE EGRESO
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.25 }}>{dischargeNote}</Typography>
                </Box>
              )}
              {emergency.status === 2 && (
                <Box sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={async () => {
                      const data = await medicalHistoryApi.getForEmergency(emergency.id);
                      generateEmergencyReport(data);
                    }}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Descargar Historia Clínica (PDF)
                  </Button>
                </Box>
              )}
              {admissionNote && emergency.status === 3 && (
                <Box sx={{ mt: 1, p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0' }}>
                    NOTA EVOLUTIVA DE INGRESO
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.25 }}>{admissionNote}</Typography>
                </Box>
              )}
              {reportPermission && permissions.includes(reportPermission) && (
                <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => setInformePreviewOpen(true)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Informe Médico
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={() => setHistoriaMedicaOpen(true)}
                    sx={{ fontSize: '0.7rem' }}
                  >
                    Historia Médica
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Grid container spacing={0.5}>
                <Grid item xs={3}>
                  <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>F. Ingreso</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{emergency.ingress_date}</Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>Médico</Typography>
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
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600 }}>Cama</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patientRoom?.name || 'No asignada'}</Typography>
                </Grid>
              </Grid>

              <TextField variant="standard" fullWidth size="small" label="Diagnóstico" value={diagnostic}
                onChange={(e) => setDiagnostic(sanitizeInput(e.target.value, { maxLength: 2000 }))}
                inputProps={{ maxLength: 2000 }}
                sx={{ mt: 0.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
              <TextField variant="standard" fullWidth size="small" label="Plan" value={treatment}
                onChange={(e) => setTreatment(sanitizeInput(e.target.value, { maxLength: 2000 }))}
                inputProps={{ maxLength: 2000 }}
                sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
              <TextField variant="standard" fullWidth size="small" label="Observaciones" value={observations}
                onChange={(e) => setObservations(sanitizeInput(e.target.value, { maxLength: 2000 }))} multiline rows={2}
                inputProps={{ maxLength: 2000 }}
                sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
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
              <TextField select variant="standard" fullWidth size="small" label="Cambiar Estado" value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}>
                <MenuItem value={1}>Atendido</MenuItem>
                <MenuItem value={2}>Alta Médica</MenuItem>
                <MenuItem value={3}>Ingreso a Hospitalización</MenuItem>
              </TextField>
            </Box>
          )}

          {!effectiveReadOnly && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
              <Button size="small" variant="outlined" color="error" onClick={() => setCancelDialogOpen(false)}>Cancelar</Button>
              <Button size="small" variant="outlined" color="error" onClick={handleCancelEmergency}
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
                  value={deathCause} onChange={(e) => setDeathCause(sanitizeInput(e.target.value, { maxLength: 2000 }))} inputProps={{ maxLength: 2000 }}
                  error={!deathCause} helperText={!deathCause ? 'Requerido' : ''} />
                <TextField variant="standard" fullWidth size="small" label="Fecha y Hora de Muerte"
                  type="datetime-local" value={deathDateTime}
                  onChange={(e) => setDeathDateTime(e.target.value)}
                  InputLabelProps={{ shrink: true }} />
                <TextField variant="standard" fullWidth size="small" label="Observaciones"
                  value={deathObservations} onChange={(e) => setDeathObservations(sanitizeInput(e.target.value, { maxLength: 2000 }))} inputProps={{ maxLength: 2000 }}
                  multiline rows={2} />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button size="small" variant="outlined" color="error" onClick={() => setDeathDialogOpen(false)}>Cancelar</Button>
              <Button size="small" variant="outlined" color="error" onClick={handleDeath}
                disabled={saving || !deathCause}>
                {saving ? 'Guardando...' : 'Confirmar Fallecimiento'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={evolutiveDialogOpen} onClose={() => { setEvolutiveDialogOpen(false); setStatus(emergency.status); }} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: evolutiveType === 'discharge' ? 'success.main' : 'primary.main', fontSize: '0.85rem' }}>
              {evolutiveType === 'discharge' ? 'NOTA EVOLUTIVA DE EGRESO' : 'NOTA EVOLUTIVA DE INGRESO'}
            </DialogTitle>
            <DialogContent style={{ paddingTop: 24 }}>
              <TextField variant="standard" fullWidth size="small" required multiline rows={4}
                label={evolutiveType === 'discharge' ? 'Motivo de Alta Médica' : 'Causa de Ingreso a Hospitalización'}
                value={evolutiveNote}
                onChange={(e) => setEvolutiveNote(e.target.value)}
                error={!evolutiveNote}
                helperText={!evolutiveNote ? 'Requerido' : ''}
              />
            </DialogContent>
            <DialogActions>
              <Button size="small" variant="outlined" color="error" onClick={() => { setEvolutiveDialogOpen(false); setStatus(emergency.status); }}>Cancelar</Button>
              <Button size="small" variant="outlined" color="success" onClick={handleEvolutiveSave}
                disabled={saving || !evolutiveNote}>
                {saving ? 'Guardando...' : 'Confirmar'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      )}

      {!emergency && !isDeceased && (
        <Paper sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MedicalServicesIcon sx={{ fontSize: 18, color: '#e65100' }} />
              <Typography variant="caption" fontWeight={600} sx={{ color: '#e65100' }}>
                EMERGENCIAS ANTERIORES
              </Typography>
            </Box>
            <Button
              variant="outlined" size="small" color="success"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => onStartEmergency?.(patient)}
            >
              Nueva Emergencia
            </Button>
          </Box>
          {emergencyHistory?.data?.length > 0 ? (
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Fecha</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Diagnóstico</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emergencyHistory.data.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>{e.ingress_date}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>{e.diagnostic}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>
                        <Chip label={STATUS_LABELS[e.status] || e.status} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center', py: 2 }}>
              Este paciente no tiene emergencias registradas
            </Typography>
          )}
        </Paper>
      )}

      {emergency && (
        <>
          <Paper sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <DescriptionIcon sx={{ fontSize: 18, color: '#1565c0' }} />
              <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0' }}>
                MOTIVO DE CONSULTA
              </Typography>
            </Box>
            {effectiveReadOnly ? (
              <Box>
                <FieldRow label="Motivo de consulta" value={reasonForConsultation} />
                <FieldRow label="Enfermedad actual" value={currentIllness} />
              </Box>
            ) : (
              <>
                <TextField variant="standard" fullWidth size="small" label="Motivo de consulta" value={reasonForConsultation}
                  onChange={(e) => setReasonForConsultation(sanitizeInput(e.target.value, { maxLength: 2000 }))}
                  disabled={fieldDisabled}
                  inputProps={{ maxLength: 2000 }}
                  sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
                <TextField variant="standard" fullWidth size="small" label="Enfermedad actual" value={currentIllness}
                  onChange={(e) => setCurrentIllness(sanitizeInput(e.target.value, { maxLength: 2000 }))} multiline rows={2}
                  inputProps={{ maxLength: 2000 }}
                  disabled={fieldDisabled}
                  sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
              </>
            )}
          </Paper>

          <PhysicalExamTable emergencyId={emergency.id} readOnly={effectiveReadOnly} />
        </> 
      )}

      <InformeMedicoPreview
        open={informePreviewOpen}
        onClose={() => setInformePreviewOpen(false)}
        emergency={emergency}
        patient={patient}
        attachableType="Emergency"
        attachableId={emergency?.id}
      />
      <HistoriaMedicaPreview
        open={historiaMedicaOpen}
        onClose={() => setHistoriaMedicaOpen(false)}
        patientId={patient?.id}
        emergencyId={emergency?.id}
        attachableType="Emergency"
        attachableId={emergency?.id}
      />
    </Box>
  );
};

export default PatientInfoPanel;
