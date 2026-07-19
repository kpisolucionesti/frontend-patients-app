import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Chip, Button, Badge,
  CircularProgress, Alert, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  Autocomplete
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import ScienceIcon from '@mui/icons-material/Science';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { BackendAPI } from '../../services/BackendApi';
import PatientInfoPanel from '../Portal/PatientInfoPanel';
import VitalSignsHistoryTab from './VitalSignsHistoryTab';
import LabResultsPanel from '../Portal/LabResultsPanel';
import MedicalPlansDetail from '../Portal/MedicalPlansDetail';
import AllergiesSection from '../Portal/AllergiesSection';
import AntecedentsSection from '../Portal/AntecedentsSection';
import DailyProgressNotes from './DailyProgressNotes';
import FluidBalancePanel from './FluidBalancePanel';
import MedicationAdminPanel from './MedicationAdminPanel';
import LatestVitalSigns from './LatestVitalSigns';
import InterconsultationsTab from './InterconsultationsTab';
import ParaclinicalStudiesTab from './ParaclinicalStudiesTab';
import SurgeriesTab from './SurgeriesTab';
import NotesSection from './NotesSection';
import PatientAppointmentsSummary from '../Commons/PatientAppointmentsSummary';
import usePermissions from '../../hooks/usePermissions';

const TAB_PATIENT_INFO = 0;
const TAB_PROGRESS = 1;
const TAB_INTERCONSULT = 2;
const TAB_VITALS = 3;
const TAB_PARACLINICAL = 4;
const TAB_FLUID = 5;
const TAB_MEDICATION = 6;
const TAB_SURGERIES = 7;
const TAB_LAB = 8;

const TAB_LABELS = [
  'Resumen',
  'Evolución',
  'Interconsultas',
  'Signos Vitales',
  'Paraclínicos',
  'Balance Hídrico',
  'Medicamentos',
  'Cirugías',
  'Laboratorio',
];

const HospitalizationDetail = ({ emergencyId: propEmergencyId, onBack }) => {
  const emergencyId = propEmergencyId;
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [tab, setTab] = useState(0);
  const [emergency, setEmergency] = useState(null);
  const [hospitalization, setHospitalization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [dischargeForm, setDischargeForm] = useState({ discharge_diagnosis: '', discharge_summary: '' });
  const [discharging, setDischarging] = useState(false);
  const [allRooms, setAllRooms] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [savingRoom, setSavingRoom] = useState(false);
  const [editingHospData, setEditingHospData] = useState(false);
  const [originalRoomId, setOriginalRoomId] = useState(null);
  const [originalDoctorId, setOriginalDoctorId] = useState(null);

  const canEdit = permissions.includes('hospitalizacion.edit');

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
      [TAB_PROGRESS]: isRecent(hUpdated) || isRecent(eUpdated),
      [TAB_VITALS]: isRecent(eUpdated),
      [TAB_INTERCONSULT]: isRecent(eUpdated),
      [TAB_PARACLINICAL]: isRecent(eUpdated),
      [TAB_FLUID]: isRecent(hUpdated),
      [TAB_MEDICATION]: isRecent(hUpdated),
      [TAB_SURGERIES]: isRecent(hUpdated),
      [TAB_LAB]: isRecent(eUpdated),
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
      }
    } catch {
      setError('Error al cargar datos del paciente');
    } finally {
      setLoading(false);
    }
  }, [emergencyId]);

  useEffect(() => {
    loadData();
    BackendAPI.rooms.getAll().then((r) => setAllRooms(r || [])).catch(() => {});
    BackendAPI.doctors.getAll().then((d) => setDoctors(d || [])).catch(() => {});
  }, [loadData]);

  const hospRooms = useMemo(() =>
    (allRooms || []).filter((r) => !r.patient_id || r.patient_id === emergency?.patient?.id),
    [allRooms, emergency],
  );

  const handleStartEdit = () => {
    setOriginalRoomId(selectedRoomId);
    setOriginalDoctorId(selectedDoctorId);
    setEditingHospData(true);
  };

  const handleSaveHospData = async () => {
    if (!hospitalization) return;
    setSavingRoom(true);
    try {
      const changes = {};
      if (selectedRoomId !== (hospitalization.room_id || '')) {
        changes.room_id = selectedRoomId || null;
      }
      if (selectedDoctorId !== (hospitalization.attending_doctor_id || hospitalization.admitting_doctor_id || '')) {
        changes.attending_doctor_id = selectedDoctorId || null;
      }
      if (Object.keys(changes).length > 0) {
        const updated = await BackendAPI.hospitalizations.update(emergencyId, changes);
        setHospitalization(updated);
      }
      if (changes.room_id !== undefined && hospitalization.room_id) {
        const oldRoom = allRooms.find((r) => r.id === hospitalization.room_id);
        if (oldRoom) await BackendAPI.rooms.update({ ...oldRoom, patient_id: null }).catch(() => {});
      }
      if (selectedRoomId) {
        const newRoom = allRooms.find((r) => r.id === selectedRoomId);
        if (newRoom) await BackendAPI.rooms.update({ ...newRoom, patient_id: emergency?.patient?.id }).catch(() => {});
      }
      setEditingHospData(false);
    } catch {
      setError('Error al guardar cambios');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedRoomId(originalRoomId);
    setSelectedDoctorId(originalDoctorId);
    setEditingHospData(false);
  };

  const handleDischarge = async () => {
    setDischarging(true);
    try {
      await BackendAPI.hospitalizations.discharge(emergencyId, dischargeForm);
      const updatedHosp = await BackendAPI.hospitalizations.getByEmergency(emergencyId);
      setHospitalization(updatedHosp);
      setDischargeDialogOpen(false);
    } catch {
      setError('Error al dar de alta');
    } finally {
      setDischarging(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f0f4ff', minHeight: 'calc(100vh - 64px)' }}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mt: 2 }}>
          Volver al censo
        </Button>
      </Box>
    );
  }

  if (!emergency) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f0f4ff', minHeight: 'calc(100vh - 64px)' }}>
        <Alert severity="warning">Paciente no encontrado</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mt: 2 }}>
          Volver al censo
        </Button>
      </Box>
    );
  }

  const p = emergency.patient || {};

  return (
    <Box sx={{ bgcolor: '#f0f4ff', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <Box sx={{ px: 3, pt: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={goBack}
          sx={{ mb: 1.5, fontSize: '0.8rem' }}
        >
          Volver al censo
        </Button>

        <Paper sx={{ p: 1.5, bgcolor: '#e3f2fd', borderLeft: '4px solid #1565c0', mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <PersonIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                <Typography variant="body1" fontWeight={700} sx={{ color: '#1565c0' }}>
                  {p.name || ''} {p.lastname || ''}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                CI: {p.ci || '-'} | Edad: {p.age || '-'} | Género: {p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : '-'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.75 }}>
                <Chip icon={<LocalHospitalIcon />} label={'Emergencia #' + emergency.id} size="small" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                {hospitalization && (
                  <>
                    <Chip icon={<MeetingRoomIcon />} label={'Cama: ' + (hospitalization.room?.name || 'Sin asignar')} size="small" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                    <Chip icon={<CalendarTodayIcon />} label={'Ingreso: ' + (hospitalization.admission_date ? new Date(hospitalization.admission_date).toLocaleDateString() : '-')} size="small" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                    <Chip
                      label={hospitalization.status === 'active' ? 'Hospitalizado' : 'Dado de Alta'}
                      variant="outlined"
                      color={hospitalization.status === 'active' ? 'primary' : 'default'}
                      size="small"
                      sx={{ height: 24, fontSize: '0.7rem' }}
                    />
                    {hospitalization.length_of_stay_days > 0 && (
                      <Chip label={`${hospitalization.length_of_stay_days} días de estancia`} size="small" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                    )}
                  </>
                )}
              </Box>
            </Box>
            {hospitalization?.status === 'active' && canEdit && (
              <Button variant="contained" color="warning" onClick={() => setDischargeDialogOpen(true)} sx={{ fontSize: '0.75rem', py: 0.5 }}>
                Dar de Alta
              </Button>
            )}
          </Box>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', px: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', minHeight: 36 },
              '& .Mui-selected': { color: '#1565c0', fontWeight: 700 },
              '& .MuiTabs-indicator': { bgcolor: '#1565c0', height: 3 },
            }}
          >
            {TAB_LABELS.map((label, idx) => (
              <Tab
                key={idx}
                label={
                  tabHasRecentActivity[idx] ? (
                    <Badge color="error" variant="dot" sx={{ '& .MuiBadge-badge': { top: 8, right: -8 } }}>
                      {label}
                    </Badge>
                  ) : (
                    label
                  )
                }
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 3, pb: 3, pt: 1.5 }}>
        {tab === TAB_PATIENT_INFO && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <PatientInfoPanel patient={p} emergency={emergency} readOnly={!canEdit} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {hospitalization && (
                <Paper sx={{ p: 1.5, borderLeft: '4px solid #1565c0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <InfoIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                      <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0', fontSize: '0.8rem' }}>
                        DATOS DE HOSPITALIZACIÓN
                      </Typography>
                    </Box>
                    {canEdit && (
                      editingHospData ? (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button size="small" variant="outlined" onClick={handleCancelEdit} disabled={savingRoom} sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}>
                            Cancelar
                          </Button>
                          <Button size="small" variant="outlined" startIcon={<SaveIcon />} onClick={handleSaveHospData} disabled={savingRoom} sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}>
                            {savingRoom ? 'Guardando...' : 'Guardar'}
                          </Button>
                        </Box>
                      ) : (
                        <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={handleStartEdit} sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}>
                          Editar
                        </Button>
                      )
                    )}
                  </Box>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Diagnóstico de Ingreso</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{hospitalization.admission_diagnosis || emergency.diagnostic || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Médico de Cabecera</Typography>
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
                      <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Fecha de Ingreso</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{hospitalization.admission_date ? new Date(hospitalization.admission_date).toLocaleString() : '-'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Cama</Typography>
                      {editingHospData ? (
                        <FormControl variant="standard" size="small" sx={{ mt: 0.5, minWidth: 120 }}>
                          <Select
                            value={selectedRoomId || ''}
                            onChange={(e) => setSelectedRoomId(e.target.value || '')}
                            sx={{ fontSize: '0.75rem' }}
                          >
                            <MenuItem value=""><em>Sin asignar</em></MenuItem>
                            {hospRooms.map((r) => (
                              <MenuItem key={r.id} value={r.id}>{r.name} {r.area_name ? `(${r.area_name})` : ''}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>
                          {hospitalization.room?.name || 'Sin asignar'}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Días de Estancia</Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{hospitalization.length_of_stay_days || 0} días</Typography>
                    </Grid>
                    {hospitalization.discharge_date && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Fecha de Alta</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{new Date(hospitalization.discharge_date).toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Diagnóstico de Alta</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{hospitalization.discharge_diagnosis || '-'}</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>
              )}
              <LatestVitalSigns emergencyId={emergency.id} />
              <Paper sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScienceIcon sx={{ fontSize: 18, color: '#1565c0' }} />
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0', fontSize: '0.8rem' }}>
                      LABORATORIOS
                    </Typography>
                  </Box>
                  <Button size="small" sx={{ fontSize: '0.7rem', minWidth: 'auto' }} onClick={() => setTab(TAB_LAB)}>
                    Ver resultados
                  </Button>
                </Box>
              </Paper>
              <MedicalPlansDetail emergencyId={emergency.id} readOnly={!canEdit} />
              {emergencyId && (
                <NotesSection emergencyId={emergency.id} readOnly={!canEdit} />
              )}
              <PatientAppointmentsSummary patientId={p.id} />
              <AllergiesSection patientId={p.id} readOnly={!canEdit} />
              <AntecedentsSection patientId={p.id} readOnly={!canEdit} />
            </Box>
          </Box>
        )}

        {tab === TAB_PROGRESS && hospitalization && (
          <DailyProgressNotes hospitalizationId={hospitalization.id} />
        )}

        {tab === TAB_INTERCONSULT && (
          <InterconsultationsTab emergencyId={emergency.id} />
        )}

        {tab === TAB_VITALS && (
          <VitalSignsHistoryTab emergencyId={emergency.id} readOnly={!canEdit} />
        )}

        {tab === TAB_PARACLINICAL && (
          <ParaclinicalStudiesTab emergencyId={emergency.id} />
        )}

        {tab === TAB_FLUID && hospitalization && (
          <FluidBalancePanel hospitalizationId={hospitalization.id} />
        )}

        {tab === TAB_MEDICATION && hospitalization && (
          <MedicationAdminPanel hospitalizationId={hospitalization.id} />
        )}

        {tab === TAB_SURGERIES && hospitalization && (
          <SurgeriesTab hospitalizationId={hospitalization.id} />
        )}

        {tab === TAB_LAB && (
          <Paper sx={{ p: 1.5, borderLeft: '4px solid #1565c0' }}>
            <LabResultsPanel emergencyId={emergency.id} patientGender={p.gender} />
          </Paper>
        )}
      </Box>

      <Dialog open={dischargeDialogOpen} onClose={() => setDischargeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#e65100', color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>
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
