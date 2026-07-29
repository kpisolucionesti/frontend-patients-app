import { useMemo, useState, useCallback } from 'react';
import {
  Box, Paper, Typography, Chip, Grid, Button, TextField, MenuItem,
  Autocomplete, Menu
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import AsignRoom from '../../features/emergency/assign-room-modal';
import DeathDialogButton from '../../shared/ui/death-dialog-button';
import CancelDialogButton from '../../shared/ui/cancel-dialog-button';
import { BackendAPI } from '../../services/BackendApi';
import { useDoctors, useRooms } from '../../hooks/useApiData';
import usePermissions from '../../hooks/usePermissions';
import { CLASSIFICATION_OPTIONS, STATUS_CONFIG } from '../../constants';
import { useSnackbar } from '../../hooks/useSnackbar';
import { medicalHistoryApi } from '../../services/medicalHistoryApi';
import { generateEmergencyReport } from '../../services/medicalHistoryReport';
import { sanitizeInput } from '../../utils/sanitize';
import { toFrontendKey, TO_BACKEND } from '../../entities/emergency/config';
import FieldRow from '../../shared/ui/field-row';
import SectionHeader from '../../shared/ui/section-header';
import EvolutiveDialog from '../../features/emergency/evolutive-dialog';
import EvaluationsListSection from '../../features/emergency/evaluations-list-section';

const PatientInfoPanel = ({ patient, emergency, onStartEmergency, readOnly, onDataChange }) => {
  const [finalDiagnostic, setFinalDiagnostic] = useState(emergency?.final_diagnostic || '');
  const [diagnostic, setDiagnostic] = useState(emergency?.diagnostic || '');
  const [treatment, setTreatment] = useState(emergency?.treatment || '');
  const [observations, setObservations] = useState(emergency?.observations || '');
  const [status, setStatus] = useState(emergency?.status || 1);
  const [classification, setClassification] = useState(toFrontendKey(emergency?.classification));
  const [reasonForConsultation, setReasonForConsultation] = useState(emergency?.reason_for_consultation || '');
  const [currentIllness, setCurrentIllness] = useState(emergency?.current_illness || '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(emergency?.primary_doctor?.id || null);
  const [evolutiveDialogOpen, setEvolutiveDialogOpen] = useState(false);
  const [evolutiveType, setEvolutiveType] = useState(null);
  const [evolutiveNote, setEvolutiveNote] = useState('');
  const [dischargeNote, setDischargeNote] = useState(emergency?.discharge_note || '');
  const [admissionNote, setAdmissionNote] = useState(emergency?.admission_note || '');
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const permissions = usePermissions();
  const { show: showSnackbar } = useSnackbar();

  const { data: doctors } = useDoctors();

  const isDeceased = patient?.disabled;
  const effectiveReadOnly = readOnly || isDeceased;

  const { data: rooms, refetch: refetchRooms } = useRooms();
  const patientRoom = useMemo(
    () => (rooms || []).find((r) => r.patient_id === patient?.id),
    [rooms, patient?.id],
  );

  const fieldDisabled = effectiveReadOnly || (!editing && !!emergency?.id && emergency.status !== 0);

  const classificationLabel = useMemo(() => {
    const key = toFrontendKey(classification || emergency?.classification);
    const opt = CLASSIFICATION_OPTIONS.find((c) => c.key === key);
    return opt ? opt.label : (key || '');
  }, [classification, emergency]);

  const handleSave = useCallback(async (extraPayload) => {
    if (!emergency) return;
    setSaving(true);
    try {
      const payload = {
        id: emergency.id, diagnostic, treatment, observations, status,
        classification: TO_BACKEND[classification] || classification,
        reason_for_consultation: reasonForConsultation,
        current_illness: currentIllness,
        final_diagnostic: finalDiagnostic,
        ...extraPayload,
      };
      if (currentDoctor) payload.doctors = [{ id: currentDoctor }];
      await BackendAPI.emergencies.update(payload);
      showSnackbar('Emergencia actualizada', 'success');
      setEditing(false);
    } catch {
      showSnackbar('Error al guardar', 'error');
    } finally { setSaving(false); }
  }, [emergency, diagnostic, treatment, observations, status, classification, reasonForConsultation, currentIllness, finalDiagnostic, currentDoctor, showSnackbar]);

  const handleStatusChange = useCallback((newStatus) => {
    setStatus(Number(newStatus));
    if (Number(newStatus) === 2) { setEvolutiveType('discharge'); setEvolutiveNote(dischargeNote || ''); setEvolutiveDialogOpen(true); }
    else if (Number(newStatus) === 3) { setEvolutiveType('admission'); setEvolutiveNote(admissionNote || ''); setEvolutiveDialogOpen(true); }
  }, [dischargeNote, admissionNote]);

  const handleEvolutiveSave = useCallback(async () => {
    const extraPayload = evolutiveType === 'discharge'
      ? { status: 2, discharge_note: evolutiveNote }
      : { status: 3, transfer: 'Hospitalizacion', admission_note: evolutiveNote };
    setSaving(true);
    try {
      await handleSave(extraPayload);
      if (evolutiveType === 'discharge') setDischargeNote(evolutiveNote);
      else setAdmissionNote(evolutiveNote);
      setEvolutiveDialogOpen(false);
    } catch { showSnackbar('Error al guardar', 'error'); }
    finally { setSaving(false); }
  }, [evolutiveType, evolutiveNote, handleSave, showSnackbar]);

  const handleCloseEvolutive = useCallback(() => {
    setEvolutiveDialogOpen(false);
    setStatus(emergency.status);
  }, [emergency.status]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

      {/* ── Emergencia actual ── */}
      {emergency && (
        <Paper sx={{ p: 1.5 }}>
          {/* header: chips + edit button */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip
                label={STATUS_CONFIG[emergency.status]?.label || 'Desconocido'}
                color={STATUS_CONFIG[emergency.status]?.chipColor || 'default'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              {(classification || emergency.classification) && (
                <Chip
                  label={classificationLabel}
                  size="small"
                  sx={{
                    bgcolor: CLASSIFICATION_OPTIONS.find((c) => c.key === toFrontendKey(classification || emergency.classification))?.color || 'text.disabled',
                    color: ['yellow', 'green'].includes(classification) ? '#212121' : 'white', fontWeight: 600,
                  }}
                />
              )}
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {emergency.ingress_date}
              </Typography>
            </Box>
            {!effectiveReadOnly && emergency.status === 1 && (
              <Button size="small" variant="outlined"
                startIcon={editing ? <SaveIcon /> : <EditIcon />}
                onClick={editing ? () => handleSave() : () => setEditing(true)}
                disabled={saving}
                sx={{ fontSize: '0.7rem', py: 0.25, px: 1, flexShrink: 0 }}>
                {editing ? (saving ? 'Guardando...' : 'Guardar') : 'Editar'}
              </Button>
            )}
          </Box>

          {effectiveReadOnly || !editing ? (
            <Box>
              {/* metadata row: date / doctor / room */}
              <Box sx={{ display: 'flex', gap: 2, mb: 0.75, pb: 0.75, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>Médico</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{emergency.primary_doctor?.name || 'No asignado'}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>Ubicación</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{patientRoom?.name || 'No asignada'}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>Clasificación</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{classificationLabel || '—'}</Typography>
                </Box>
              </Box>
              {/* clinical content */}
              <FieldRow label="Diagnóstico" value={diagnostic} />
              <FieldRow label="Plan" value={treatment} />
              <FieldRow label="Observaciones" value={observations} />
              <FieldRow label="Diag. Final" value={finalDiagnostic} />

              {/* evolutive notes */}
              {dischargeNote && emergency.status === 2 && (
                <Box sx={{ mt: 1, p: 1, borderLeft: 3, borderColor: 'success.main', bgcolor: 'success.light', borderRadius: '0 4px 4px 0' }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: 'success.main' }}>NOTA DE EGRESO</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.25 }}>{dischargeNote}</Typography>
                </Box>
              )}
              {admissionNote && emergency.status === 3 && (
                <Box sx={{ mt: 1, p: 1, borderLeft: 3, borderColor: 'primary.main', bgcolor: 'primary.light', borderRadius: '0 4px 4px 0' }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main' }}>NOTA DE INGRESO</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', mt: 0.25 }}>{admissionNote}</Typography>
                </Box>
              )}

              {emergency.status === 2 && (
                <Box sx={{ mt: 1 }}>
                  <Button variant="contained" size="small" color="success" startIcon={<DownloadIcon />}
                    onClick={async () => { const data = await medicalHistoryApi.getForEmergency(emergency.id); generateEmergencyReport(data); }}
                    sx={{ fontSize: '0.7rem' }}>
                    Descargar Historia Clínica (PDF)
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            /* edit mode */
            <Box>
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid item xs={4}>
                  <TextField variant="standard" size="small" label="F. Ingreso" value={emergency.ingress_date}
                    disabled InputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
                </Grid>
                <Grid item xs={4}>
                  <Autocomplete size="small" options={doctors || []} getOptionLabel={(o) => o.name}
                    value={(doctors || []).find((d) => d.id === currentDoctor) || null}
                    onChange={(_e, v) => setCurrentDoctor(v ? v.id : null)}
                    disableClearable disablePortal
                    renderInput={(p) => <TextField variant="standard" {...p} size="small" label="Médico" sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />} />
                </Grid>
                <Grid item xs={4}>
                  <TextField variant="standard" size="small" label="Clasificación" value={classificationLabel} disabled
                    InputProps={{ readOnly: true }} sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
                </Grid>
              </Grid>
              <TextField variant="standard" fullWidth size="small" label="Diagnóstico" value={diagnostic}
                onChange={(e) => setDiagnostic(sanitizeInput(e.target.value, { maxLength: 2000 }))}
                inputProps={{ maxLength: 2000 }} sx={{ mt: 0.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
              <TextField variant="standard" fullWidth size="small" label="Plan" value={treatment}
                onChange={(e) => setTreatment(sanitizeInput(e.target.value, { maxLength: 2000 }))}
                inputProps={{ maxLength: 2000 }} sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
              <TextField variant="standard" fullWidth size="small" label="Observaciones" value={observations}
                onChange={(e) => setObservations(sanitizeInput(e.target.value, { maxLength: 2000 }))} multiline rows={2}
                inputProps={{ maxLength: 2000 }} sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
              <TextField select variant="standard" fullWidth size="small" label="Clasificación" value={classification}
                onChange={(e) => setClassification(e.target.value)} sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}>
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
              <TextField variant="standard" fullWidth size="small" label="Diagnóstico Final" value={finalDiagnostic}
                onChange={(e) => setFinalDiagnostic(sanitizeInput(e.target.value, { maxLength: 2000 }))}
                multiline rows={2} inputProps={{ maxLength: 2000 }} sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
            </Box>
          )}

          {/* actions bar */}
          {!effectiveReadOnly && (
            <Box sx={{ mt: 1.5, pt: 1, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 0.5, flex: 1, flexWrap: 'wrap' }}>
                {emergency?.status === 1 && <AsignRoom row={{ ...emergency, patient }} onStatusChange={() => refetchRooms()} />}
                {emergency?.status === 1 && (
                  <Button variant="outlined" size="small" onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
                    aria-haspopup="menu" aria-expanded={Boolean(statusMenuAnchor)} sx={{ fontSize: '0.7rem' }}>
                    Cambiar Estado
                  </Button>
                )}
                <Menu anchorEl={statusMenuAnchor} open={Boolean(statusMenuAnchor)} onClose={() => setStatusMenuAnchor(null)} id="status-menu">
                  <MenuItem onClick={() => { setStatusMenuAnchor(null); handleStatusChange(2); }}>Alta Médica</MenuItem>
                  <MenuItem onClick={() => { setStatusMenuAnchor(null); handleStatusChange(3); }}>Ingreso a Hospitalización</MenuItem>
                </Menu>
              </Box>
              {emergency?.id && emergency.status === 1 && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <CancelDialogButton emergencyId={emergency.id}
                    patientName={`${patient?.name || ''} ${patient?.lastname || ''}`} patientCi={patient?.ci}
                    dialogTitle="ANULAR EMERGENCIA" successMessage="Emergencia anulada"
                    onSuccess={() => onDataChange?.()} />
                  <DeathDialogButton emergencyId={emergency.id} patientId={patient.id}
                    patientName={`${patient?.name || ''} ${patient?.lastname || ''}`} patientCi={patient?.ci}
                    buttonLabel="Fallecido" onSuccess={() => onDataChange?.()} />
                </Box>
              )}
            </Box>
          )}
        </Paper>
      )}

      {/* ── Motivo de consulta ── */}
      {emergency && (
        <Paper sx={{ p: 1.5 }}>
          <SectionHeader icon={<DescriptionIcon sx={{ fontSize: 16 }} />} label="MOTIVO DE CONSULTA" color="primary.main" />
          {effectiveReadOnly ? (
            <Box>
              <FieldRow label="Motivo de consulta" value={reasonForConsultation} />
              <FieldRow label="Enfermedad actual" value={currentIllness} />
            </Box>
          ) : (
            <>
              <TextField variant="standard" fullWidth size="small" label="Motivo de consulta" value={reasonForConsultation}
                onChange={(e) => setReasonForConsultation(sanitizeInput(e.target.value, { maxLength: 2000 }))}
                disabled={fieldDisabled} inputProps={{ maxLength: 2000 }}
                sx={{ mt: 0.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
              <TextField variant="standard" fullWidth size="small" label="Enfermedad actual" value={currentIllness}
                onChange={(e) => setCurrentIllness(sanitizeInput(e.target.value, { maxLength: 2000 }))} multiline rows={2}
                inputProps={{ maxLength: 2000 }} disabled={fieldDisabled}
                sx={{ mt: 0.75, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
            </>
          )}
        </Paper>
      )}

      {/* ── Evaluaciones ── */}
      <EvaluationsListSection emergency={emergency} />

      {/* ── Evolutive dialog ── */}
      <EvolutiveDialog
        open={evolutiveDialogOpen}
        onClose={handleCloseEvolutive}
        patientName={`${patient?.name || ''} ${patient?.lastname || ''}`}
        patientCi={patient?.ci || '—'}
        evolutiveType={evolutiveType}
        evolutiveNote={evolutiveNote}
        onNoteChange={setEvolutiveNote}
        onConfirm={handleEvolutiveSave}
        saving={saving}
      />
    </Box>
  );
};

export default PatientInfoPanel;
