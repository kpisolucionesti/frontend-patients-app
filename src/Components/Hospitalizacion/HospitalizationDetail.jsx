import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Button,
  CircularProgress, Alert, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Autocomplete
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { BackendAPI } from '../../services/BackendApi';
import { useDoctors, useRooms } from '../../hooks/useApiData';
import AsignRoom from '../../features/emergency/assign-room-modal';
import DeathDialogButton from '../../shared/ui/death-dialog-button';
import CancelDialogButton from '../../shared/ui/cancel-dialog-button';
import PatientInfoPanel from '../Portal/PatientInfoPanel';
import LabResultsPanel from '../Emergency/LabResultsPanel';
import MedicalPlansDetail from '../Emergency/MedicalPlansDetail';
import AllergiesSection from '../Emergency/AllergiesSection';
import AntecedentsSection from '../Emergency/AntecedentsSection';
import FamilyAntecedentsSection from '../Emergency/FamilyAntecedentsSection';
import GynecologicalHistorySection from '../Emergency/GynecologicalHistorySection';
import LifestyleHabitsSection from '../Emergency/LifestyleHabitsSection';
import EvaluationsTab from '../Emergency/EvaluationsTab';
import FluidBalancePanel from './FluidBalancePanel';
import LatestVitalSigns from './LatestVitalSigns';
import ClinicalStudiesPanel from '../../shared/ui/clinical-studies-panel';
import SurgeriesTab from './SurgeriesTab';
import IndicacionesTab from '../../features/clinical-studies/indicaciones-tab';
import NotesSection from './NotesSection';
import PatientAppointmentsSummary from '../Commons/PatientAppointmentsSummary';
import DocumentsPanel from '../Commons/DocumentsPanel';
import GroupedTabBar from '../Commons/GroupedTabBar';
import usePermissions from '../../hooks/usePermissions';
import { useSnackbar } from '../../hooks/useSnackbar';
import { medicalHistoryApi } from '../../services/medicalHistoryApi';
import { generateHospitalizationReport } from '../../services/medicalHistoryReport';

const STANDALONE_TABS = [
  { key: 'resumen', label: 'Resumen', icon: <InfoIcon /> },
  { key: 'antecedentes', label: 'Antecedentes', icon: <HistoryIcon /> },
  { key: 'evaluaciones', label: 'Evaluaciones', icon: <AssignmentIcon /> },
  { key: 'indicaciones', label: 'Indicaciones', icon: <DescriptionIcon /> },
  { key: 'balance_hidrico', label: 'Balance Hídrico', icon: <ScienceIcon /> },
  { key: 'estudios_clinicos', label: 'Estudios Clínicos', icon: <BiotechIcon /> },
  { key: 'cirugias', label: 'Cirugías', icon: <LocalHospitalIcon /> },
  { key: 'documentos', label: 'Documentos', icon: <DescriptionIcon /> },
];

const HospitalizationDetail = ({ emergencyId: propEmergencyId, onBack }) => {
  const emergencyId = propEmergencyId;
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [tab, setTab] = useState('resumen');
  const [emergency, setEmergency] = useState(null);
  const [hospitalization, setHospitalization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [dischargeForm, setDischargeForm] = useState({ discharge_diagnosis: '', discharge_summary: '' });
  const [discharging, setDischarging] = useState(false);
  const { data: allRooms = [] } = useRooms();
  const { data: doctors = [] } = useDoctors();
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [savingRoom, setSavingRoom] = useState(false);
  const [editingHospData, setEditingHospData] = useState(false);
  const [originalRoomId, setOriginalRoomId] = useState(null);
  const [originalDoctorId, setOriginalDoctorId] = useState(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [originalCurrentDiagnosis, setOriginalCurrentDiagnosis] = useState('');
  const [originalFinalDiagnosis, setOriginalFinalDiagnosis] = useState('');

  const [saving, setSaving] = useState(false);

  const canEdit = permissions.includes('hospitalizacion.edit');
  const { show: showSnackbar } = useSnackbar();

  const goBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/patients/hospitalizacion');
    }
  };

  const isRecent = (dateStr) => {
    if (!dateStr) return false;
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 3600000; // 1 hour
  };

  const tabHasRecentActivity = useMemo(() => {
    const eUpdated = emergency?.updated_at;
    const hUpdated = hospitalization?.updated_at;
    return {
      paraclinicos: isRecent(eUpdated),
      balance_hidrico: isRecent(hUpdated),
      cirugias: isRecent(hUpdated),
      laboratorio: isRecent(eUpdated),
    };
  }, [emergency?.updated_at, hospitalization?.updated_at]);

  const loadData = useCallback(async () => {
    if (!emergencyId) return;
    setLoading(true);
    setError(null);
    try {
      const [emergencyData, hospData] = await Promise.all([
        BackendAPI.emergencies.getById(emergencyId),
        BackendAPI.hospitalizations.getByEmergency(emergencyId).catch(() => null),
      ]);
      setEmergency(emergencyData);
      setHospitalization(hospData);
      if (hospData) {
        setSelectedRoomId(hospData.room_id || '');
        setSelectedDoctorId(hospData.attending_doctor_id || hospData.admitting_doctor_id || '');
        setCurrentDiagnosis(hospData.current_diagnosis || '');
        setFinalDiagnosis(hospData.final_diagnosis || '');
      }
    } catch {
      setError('Error al cargar datos del paciente');
    } finally {
      setLoading(false);
    }
  }, [emergencyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartEdit = () => {
    setOriginalRoomId(selectedRoomId);
    setOriginalDoctorId(selectedDoctorId);
    setOriginalCurrentDiagnosis(currentDiagnosis);
    setOriginalFinalDiagnosis(finalDiagnosis);
    setEditingHospData(true);
  };

  const handleSaveHospData = async () => {
    if (!hospitalization || saving) return;
    setSaving(true);
    setSavingRoom(true);
    try {
      const changes = {};
      if (selectedRoomId !== (hospitalization.room_id || '')) {
        changes.room_id = selectedRoomId || null;
      }
      if (selectedDoctorId !== (hospitalization.attending_doctor_id || hospitalization.admitting_doctor_id || '')) {
        changes.attending_doctor_id = selectedDoctorId || null;
      }
      if (currentDiagnosis !== (hospitalization.current_diagnosis || '')) {
        changes.current_diagnosis = currentDiagnosis;
      }
      if (finalDiagnosis !== (hospitalization.final_diagnosis || '')) {
        changes.final_diagnosis = finalDiagnosis;
      }
      if (Object.keys(changes).length > 0) {
        const updated = await BackendAPI.hospitalizations.update(emergencyId, changes);
        setHospitalization(updated);
      }
      if (changes.room_id !== undefined) {
        const currentPatientRoom = allRooms.find((r) => r.patient_id === emergency?.patient?.id);
        if (currentPatientRoom && currentPatientRoom.id !== (selectedRoomId || null)) {
          await BackendAPI.rooms.update({ ...currentPatientRoom, patient_id: null }).catch(() => {});
        }
      }
      if (selectedRoomId) {
        const newRoom = allRooms.find((r) => r.id === selectedRoomId);
        if (newRoom) await BackendAPI.rooms.update({ ...newRoom, patient_id: emergency?.patient?.id }).catch(() => {});
      }
      setEditingHospData(false);
      showSnackbar('Datos de hospitalización actualizados', 'success');
    } catch {
      showSnackbar('Error al guardar cambios', 'error');
    } finally {
      setSavingRoom(false);
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedRoomId(originalRoomId);
    setSelectedDoctorId(originalDoctorId);
    setCurrentDiagnosis(originalCurrentDiagnosis);
    setFinalDiagnosis(originalFinalDiagnosis);
    setEditingHospData(false);
  };

  const handleDischarge = async () => {
    if (!dischargeForm.discharge_diagnosis.trim()) {
      showSnackbar('El diagnóstico de alta es requerido', 'warning');
      return;
    }
    setDischarging(true);
    try {
      await BackendAPI.hospitalizations.discharge(emergencyId, dischargeForm);
      const updatedHosp = await BackendAPI.hospitalizations.getByEmergency(emergencyId);
      setHospitalization(updatedHosp);
      setDischargeDialogOpen(false);
      showSnackbar('Alta hospitalaria registrada', 'success');
    } catch {
      showSnackbar('Error al dar de alta', 'error');
    } finally {
      setDischarging(false);
    }
  };

  const isDirectAdmission = emergency?.transfer === 'Hospitalizacion';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100%' }}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mt: 2 }}>
          Volver al censo
        </Button>
      </Box>
    );
  }

  if (!emergency) {
    return (
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100%' }}>
        <Alert severity="warning">Paciente no encontrado</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mt: 2 }}>
          Volver al censo
        </Button>
      </Box>
    );
  }

  const p = emergency.patient || {};

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <Box sx={{ px: 3, pt: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={goBack}
          sx={{ mb: 1.5, fontSize: '0.8rem' }}
        >
          Volver al censo
        </Button>

        <Box sx={{ bgcolor: 'background.paper', borderRadius: '8px 8px 0 0', borderBottom: 1, borderColor: 'divider', px: 1.5, pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <PersonIcon sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.name || ''} {p.lastname || ''}
              </Typography>
              <Chip label={`CI: ${p.ci || '—'}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
                {p.age || '?'}a · {p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.75, ml: 'auto', flexShrink: 0, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Chip icon={<LocalHospitalIcon />} label={'Emergencia #' + emergency.id} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
              {hospitalization && (
                <>
                  <Chip icon={<MeetingRoomIcon />} label={hospitalization.room?.name || 'Sin asignar'} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                  <Chip
                    label={hospitalization.status === 'active' ? 'Hospitalizado' : 'Dado de Alta'}
                    variant="outlined"
                    color={hospitalization.status === 'active' ? 'primary' : 'default'}
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                </>
              )}
              {hospitalization?.status === 'active' && canEdit && (
                <Button variant="contained" color="warning" onClick={() => setDischargeDialogOpen(true)} sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}>
                  Dar de Alta
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <GroupedTabBar
          standaloneTabs={STANDALONE_TABS}
          activeTab={tab}
          onTabChange={setTab}
          sectionBadges={tabHasRecentActivity}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 3, pb: 3, pt: 1.5 }} role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'resumen' && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <PatientInfoPanel patient={p} emergency={emergency} readOnly={!canEdit} reportPermission="hospitalizacion.reportes" />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {hospitalization && (
                <Paper sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <InfoIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="caption" fontWeight={600} sx={{ color: 'primary.main', fontSize: '0.8rem' }}>
                        DATOS DE HOSPITALIZACIÓN
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {hospitalization?.status === 'active' && canEdit && (
                        <>
                          <AsignRoom row={{ ...emergency, patient: p }} onStatusChange={loadData} />
                          <DeathDialogButton emergencyId={emergencyId} patientId={p.id} onSuccess={goBack} />
                          {isDirectAdmission && (
                            <CancelDialogButton
                              emergencyId={emergencyId}
                              dialogTitle="ANULAR HOSPITALIZACIÓN"
                              successMessage="Hospitalización anulada"
                              onSuccess={goBack}
                              extraAction={async () => {
                                if (hospitalization) {
                                  await BackendAPI.hospitalizations.update(emergencyId, { status: 'discharged', discharge_date: new Date().toISOString() });
                                }
                              }}
                            />
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={editingHospData ? <SaveIcon /> : <EditIcon />}
                            onClick={editingHospData ? handleSaveHospData : handleStartEdit}
                            disabled={savingRoom}
                            sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}
                          >
                            {editingHospData ? (savingRoom ? 'Guardando...' : 'Guardar') : 'Editar'}
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                  <Grid container spacing={1.5}>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Fecha y Hora de Ingreso</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{hospitalization.admission_date ? new Date(hospitalization.admission_date).toLocaleString() : '-'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Fecha y Hora de Egreso</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{hospitalization.discharge_date ? new Date(hospitalization.discharge_date).toLocaleString() : '—'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Días de Estancia</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{hospitalization.length_of_stay_days || 0} días</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Médico de Cabecera</Typography>
                      {editingHospData ? (
                        <Autocomplete
                          size="small"
                          options={doctors}
                          getOptionLabel={(opt) => opt.name}
                          value={doctors.find((d) => d.id === selectedDoctorId) || null}
                          onChange={(_e, v) => setSelectedDoctorId(v ? v.id : null)}
                          renderInput={(params) => (
                            <TextField variant="standard" {...params} size="small"
                              sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
                          )}
                          disableClearable
                          sx={{ mt: 0.5 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                          {hospitalization.attending_doctor?.name || hospitalization.admitting_doctor?.name || '-'}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Cama</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                        {hospitalization.room?.name || 'Sin asignar'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Diagnóstico de Ingreso</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{hospitalization.admission_diagnosis || emergency.diagnostic || '-'}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Diagnóstico Actual</Typography>
                      {editingHospData ? (
                        <TextField variant="standard" size="small" fullWidth multiline rows={2}
                          value={currentDiagnosis}
                          onChange={(e) => setCurrentDiagnosis(e.target.value)}
                          inputProps={{ maxLength: 2000 }}
                          sx={{ mt: 0.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
                      ) : (
                        <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{currentDiagnosis || hospitalization.current_diagnosis || '-'}</Typography>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Diagnóstico Final</Typography>
                      {editingHospData ? (
                        <TextField variant="standard" size="small" fullWidth multiline rows={2}
                          value={finalDiagnosis}
                          onChange={(e) => setFinalDiagnosis(e.target.value)}
                          inputProps={{ maxLength: 2000 }}
                          sx={{ mt: 0.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
                      ) : (
                        <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{finalDiagnosis || hospitalization.final_diagnosis || '-'}</Typography>
                      )}
                    </Grid>

                    {hospitalization.discharge_date && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Fecha de Alta</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{new Date(hospitalization.discharge_date).toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.7rem' }}>Diagnóstico de Alta</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{hospitalization.discharge_diagnosis || '-'}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
              )}
              <LatestVitalSigns emergencyId={emergency.id} />
              <MedicalPlansDetail emergencyId={emergency.id} readOnly={!canEdit} />
              {emergencyId && (
                <NotesSection emergencyId={emergency.id} readOnly={!canEdit} />
              )}
              <PatientAppointmentsSummary patientId={p.id} />
            </Box>
          </Box>
        )}

        {tab === 'balance_hidrico' && hospitalization && (
          <FluidBalancePanel hospitalizationId={hospitalization.id} readOnly={true} />
        )}

        {tab === 'paraclinicos' && (
          <ClinicalStudiesPanel emergencyId={emergency.id} hospitalizationId={hospitalization?.id} patient={p} />
        )}

        {tab === 'estudios_clinicos' && (
          <ClinicalStudiesPanel emergencyId={emergency.id} hospitalizationId={hospitalization?.id} patient={p} />
        )}

        {tab === 'cirugias' && hospitalization && (
          <SurgeriesTab hospitalizationId={hospitalization.id} />
        )}

        {tab === 'documentos' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Paper sx={{ p: 1.5, borderLeft: 3, borderColor: 'primary.main' }}>
              <DocumentsPanel
                attachableType="Hospitalization"
                attachableId={hospitalization?.id}
                managePermission="hospitalizacion.documentos"
              />
            </Paper>
            {hospitalization?.status !== 'active' && (
              <Paper sx={{ p: 1.5, borderLeft: 3, borderColor: 'success.main' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={async () => {
                    const data = await medicalHistoryApi.getForHospitalization(hospitalization.id);
                    generateHospitalizationReport(data);
                  }}
                  sx={{ fontSize: '0.8rem' }}
                >
                  Descargar Historia Clínica (PDF)
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {tab === 'antecedentes' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <AllergiesSection patientId={p.id} readOnly={!canEdit} />
            <AntecedentsSection patientId={p.id} readOnly={!canEdit} />
            <FamilyAntecedentsSection patientId={p.id} readOnly={!canEdit} />
            <GynecologicalHistorySection patientId={p.id} readOnly={!canEdit} patientGender={p.gender} />
            <LifestyleHabitsSection patientId={p.id} readOnly={!canEdit} />
          </Box>
        )}

        {tab === 'evaluaciones' && (
          <EvaluationsTab emergency={emergency} readOnly={!canEdit} onDataChange={() => {}} />
        )}

        {tab === 'indicaciones' && (
          <IndicacionesTab emergencyId={emergency.id} hospitalizationId={hospitalization?.id} patient={p} />
        )}
      </Box>

      <Dialog open={dischargeDialogOpen} onClose={() => setDischargeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>
          ALTA HOSPITALARIA
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Diagnóstico de Alta"
              multiline
              rows={2}
              value={dischargeForm.discharge_diagnosis}
              onChange={(e) => setDischargeForm({ ...dischargeForm, discharge_diagnosis: e.target.value })}
            />
            <TextField
              fullWidth
              label="Resumen de Alta"
              multiline
              rows={4}
              value={dischargeForm.discharge_summary}
              onChange={(e) => setDischargeForm({ ...dischargeForm, discharge_summary: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDischargeDialogOpen(false)} variant="outlined">Cancelar</Button>
          <Button variant="contained" color="warning" onClick={handleDischarge} disabled={discharging}>
            {discharging ? 'Procesando...' : 'Confirmar Alta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HospitalizationDetail;
