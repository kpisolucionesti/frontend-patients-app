import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Chip, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, CircularProgress, Alert, Divider,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RepeatIcon from '@mui/icons-material/Repeat';
import EmergencyIcon from '@mui/icons-material/LocalHospital';
import HotelIcon from '@mui/icons-material/Hotel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScienceIcon from '@mui/icons-material/Science';
import SubjectIcon from '@mui/icons-material/Subject';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import RestoreIcon from '@mui/icons-material/Restore';
import DownloadIcon from '@mui/icons-material/Download';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import moment from 'moment';
import { medicalHistoryApi } from '../../services/medicalHistoryApi';
import { generateEmergencyReport, generateHospitalizationReport } from '../../services/medicalHistoryReport';
import AllergiesSection from '../Emergency/AllergiesSection';
import AntecedentsSection from '../Emergency/AntecedentsSection';
import PatientAppointmentsSummary from '../Commons/PatientAppointmentsSummary';
import EditPatientData from './editPatientDataModal';
import HistoryDetailModal from '../History/HistoryDetailModal';
import HospitalizationDetailModal from '../Hospitalizacion/HospitalizationDetailModal';
import DocumentsPanel from '../Commons/DocumentsPanel';
import HistoricalCasePanel from '../Emergency/HistoricalCasePanel';
import GroupedTabBar from '../Commons/GroupedTabBar';
import SurgeryDetailModal from './SurgeryDetailModal';
import { SURGERY_TYPES } from '../Hospitalizacion/SurgeriesTab';
import { generateSurgeryReport } from '../../services/surgeryReport';

const GENDER_MAP = { M: 'Masculino', F: 'Femenino' };

const PATIENT_CATEGORY_CHIP = {
  recien_nacido: { label: 'Recién Nacido', bg: '#e0f7fa', color: '#006064', border: '#00bcd4' },
  pediatrico:    { label: 'Pediátrico',    bg: '#fff3e0', color: '#e65100', border: '#ff9800' },
};

const STATUS_LABELS = {
  1: { label: 'Atendido', color: '#1976d2' },
  2: { label: 'Alta', color: '#2e7d32' },
  3: { label: 'Ingresado', color: '#e65100' },
  4: { label: 'Anulada', color: '#757575' },
  5: { label: 'Fallecido', color: '#c62828' },
};

const TAB_GROUPS = [
  {
    key: 'episodios',
    label: 'Episodios',
    icon: <EmergencyIcon />,
    sections: [
      { key: 'emergencias', label: 'Emergencias', icon: <EmergencyIcon /> },
      { key: 'hospitalizaciones', label: 'Hospitalizaciones', icon: <HotelIcon /> },
      { key: 'citas', label: 'Citas', icon: <CalendarMonthIcon /> },
      { key: 'cirugias', label: 'Cirugías', icon: <ScienceIcon /> },
    ],
  },
  {
    key: 'clinico',
    label: 'Clínico',
    icon: <ScienceIcon />,
    sections: [
      { key: 'laboratorios', label: 'Laboratorios', icon: <ScienceIcon /> },
      { key: 'notas', label: 'Notas', icon: <SubjectIcon /> },
      { key: 'alergias', label: 'Alergias', icon: <WarningIcon /> },
      { key: 'antecedentes', label: 'Antecedentes', icon: <HistoryIcon /> },
    ],
  },
];

const PatientProfile = ({ patient, onBack, onViewPatient }) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [stats, setStats] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(false);
  const [emergenciesPage, setEmergenciesPage] = useState(0);
  const [emergenciesTotal, setEmergenciesTotal] = useState(0);
  const [labData, setLabData] = useState([]);
  const [loadingLab, setLoadingLab] = useState(false);
  const [notesData, setNotesData] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [hospitalizations, setHospitalizations] = useState([]);
  const [loadingHospitalizations, setLoadingHospitalizations] = useState(false);
  const [hospitalizationsPage, setHospitalizationsPage] = useState(0);
  const [hospitalizationsTotal, setHospitalizationsTotal] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [detailEmerg, setDetailEmerg] = useState(null);
  const [detailHosp, setDetailHosp] = useState(null);
  const [detailSurg, setDetailSurg] = useState(null);
  const [surgeries, setSurgeries] = useState([]);
  const [loadingSurgeries, setLoadingSurgeries] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [childrenData, setChildrenData] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const { show: showSnackbar } = useSnackbar();

  const PER_PAGE = 5;

  useEffect(() => {
    BackendAPI.patients.getStats(patient.id).then(setStats).catch(() => {});
  }, [patient.id]);

  const fetchEmergencies = useCallback(async (page = 0) => {
    setLoadingEmergencies(true);
    try {
      const res = await BackendAPI.emergencies.getAll({ patient_id: patient.id, page: page + 1, per_page: PER_PAGE });
      const data = res.data || [];
      setEmergencies(data);
      setEmergenciesTotal(res.total || data.length);
    } catch { setEmergencies([]); }
    setLoadingEmergencies(false);
  }, [patient.id]);

  useEffect(() => {
    if (activeTab === 'emergencias') fetchEmergencies(emergenciesPage);
  }, [activeTab, emergenciesPage, fetchEmergencies]);

  useEffect(() => {
    if (activeTab === 'laboratorios' && labData.length === 0 && !loadingLab) {
      fetchLabData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'notas' && notesData.length === 0 && !loadingNotes) {
      fetchNotesData();
    }
  }, [activeTab]);

  const fetchSurgeries = useCallback(async () => {
    setLoadingSurgeries(true);
    try {
      const res = await BackendAPI.patients.getSurgeries(patient.id);
      setSurgeries(res.data || []);
    } catch { setSurgeries([]); }
    setLoadingSurgeries(false);
  }, [patient.id]);

  const fetchHospitalizations = useCallback(async (page = 0) => {
    setLoadingHospitalizations(true);
    try {
      const res = await BackendAPI.hospitalizations.historical({ patient_id: patient.id, page: page + 1, per_page: 10 });
      setHospitalizations(res.data || []);
      setHospitalizationsTotal(res.total || 0);
    } catch { setHospitalizations([]); }
    setLoadingHospitalizations(false);
  }, [patient.id]);

  useEffect(() => {
    if (activeTab === 'hospitalizaciones') fetchHospitalizations(hospitalizationsPage);
  }, [activeTab, hospitalizationsPage, fetchHospitalizations]);

  useEffect(() => {
    if (activeTab === 'cirugias') fetchSurgeries();
  }, [activeTab, fetchSurgeries]);

  const fetchChildren = async () => {
    setLoadingChildren(true);
    try {
      const data = await BackendAPI.patients.getChildren(patient.id);
      setChildrenData(data || []);
    } catch { setChildrenData([]); }
    setLoadingChildren(false);
  };

  useEffect(() => {
    if (activeTab === 'hijos' && childrenData.length === 0 && !loadingChildren) {
      fetchChildren();
    }
  }, [activeTab]);

  const fetchLabData = async () => {
    setLoadingLab(true);
    try {
      const res = await BackendAPI.emergencies.getAll({ patient_id: patient.id, per_page: 5 });
      const recent = res.data || [];
      const results = [];
      for (const e of recent) {
        try {
          const labs = await BackendAPI.laboratoryResults.getAll(e.id);
          if (labs && labs.length > 0) {
            results.push({ emergency: e, labs });
          }
        } catch {}
      }
      setLabData(results);
    } catch { setLabData([]); }
    setLoadingLab(false);
  };

  const fetchNotesData = async () => {
    setLoadingNotes(true);
    try {
      const res = await BackendAPI.emergencies.getAll({ patient_id: patient.id, per_page: 5 });
      const recent = res.data || [];
      const allNotes = [];
      for (const e of recent) {
        try {
          const notes = await BackendAPI.notes.getAll({ emergency_id: e.id });
          if (notes && notes.length > 0) {
            notes.forEach((n) => allNotes.push({ ...n, emergency_date: e.ingress_date, emergency_diagnostic: e.diagnostic }));
          }
        } catch {}
      }
      allNotes.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setNotesData(allNotes);
    } catch { setNotesData([]); }
    setLoadingNotes(false);
  };

  const handleEditSaved = () => {
    setEditOpen(false);
    showSnackbar('Paciente actualizado', 'success');
  };

  const standaloneTabs = useMemo(() => {
    const tabs = [
      { key: 'resumen', label: 'Resumen', icon: <SummarizeIcon /> },
      { key: 'documentos', label: 'Documentos', icon: <DescriptionIcon /> },
    ];
    if (patient?.gender === 'F') {
      tabs.push({ key: 'hijos', label: 'Hijos', icon: <ChildCareIcon /> });
    }
    return tabs;
  }, [patient?.gender]);

  const handleEmergenciesPageChange = (_e, newPage) => setEmergenciesPage(newPage);
  const handleHospitalizationsPageChange = (_e, newPage) => setHospitalizationsPage(newPage);

  const recentEmergency = emergencies[0];
  const isDeceased = patient?.disabled;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 2, pt: 1, pb: 0 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} size="small" sx={{ mb: 1 }}>
          Volver a resultados
        </Button>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1, px: 2, pb: 2 }}>
        {isDeceased && (
          <Alert severity="error" sx={{ mb: 1 }}>PACIENTE FALLECIDO — Solo lectura</Alert>
        )}

        <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd', borderTop: 1, borderColor: 'primary.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
                {patient.name} {patient.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CI: {patient.ci || 'N/A'} &nbsp;|&nbsp; Nro. Historia: {patient.medical_history_number || 'N/A'} &nbsp;|&nbsp; {patient.age || '?'} años &nbsp;|&nbsp; {GENDER_MAP[patient.gender] || patient.gender || 'N/A'}
                {PATIENT_CATEGORY_CHIP[patient.patient_category] && (
                  <Chip component="span" label={PATIENT_CATEGORY_CHIP[patient.patient_category].label} size="small"
                    sx={{
                      ml: 1, bgcolor: PATIENT_CATEGORY_CHIP[patient.patient_category].bg,
                      color: PATIENT_CATEGORY_CHIP[patient.patient_category].color,
                      border: 1, borderColor: PATIENT_CATEGORY_CHIP[patient.patient_category].border,
                      fontWeight: 700, height: 20, fontSize: '0.6rem', verticalAlign: 'middle',
                    }} />
                )}
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="caption">Última visita: <strong>{stats?.last_visit_date || 'N/A'}</strong></Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <RepeatIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                  <Typography variant="caption">Total visitas: <strong>{stats?.total_visits ?? '0'}</strong></Typography>
                </Box>
              </Box>
            </Box>
            {!isDeceased && (
              <Button size="small" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                Editar
              </Button>
            )}
          </Box>
        </Paper>

        <GroupedTabBar
          groups={TAB_GROUPS}
          standaloneTabs={standaloneTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'resumen' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="caption" color="text.secondary">Emergencias</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>{stats?.total_visits || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#fce4ec' }}>
                  <Typography variant="caption" color="text.secondary">Hospitalizaciones</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>{stats?.hospitalizations || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                  <Typography variant="caption" color="text.secondary">Citas</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>{stats?.appointments || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e8eaf6' }}>
                  <Typography variant="caption" color="text.secondary">Cirugías</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>{stats?.surgeries || 0}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {recentEmergency && (
              <Paper sx={{ p: 1.5, borderTop: 1, borderColor: 'primary.main' }}>
                <Typography variant="caption" fontWeight={600} sx={{ color: '#1976d2' }}>
                  ÚLTIMA EMERGENCIA
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {moment(recentEmergency.ingress_date).format('DD/MM/YYYY')} — {recentEmergency.diagnostic}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Médico: {recentEmergency.doctors?.map((d) => d.name).join(', ') || 'N/A'}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={STATUS_LABELS[recentEmergency.status]?.label || 'Desconocido'}
                    size="small"
                    sx={{ bgcolor: STATUS_LABELS[recentEmergency.status]?.color, color: 'white', fontSize: '0.7rem' }}
                  />
                </Box>
              </Paper>
            )}

            <Paper sx={{ p: 1.5 }}>
              <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0' }}>
                PRÓXIMA CITA
              </Typography>
              <PatientAppointmentsSummary patientId={patient.id} />
            </Paper>
          </Box>
        )}

        {activeTab === 'emergencias' && (
          <Paper>
            {loadingEmergencies ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : emergencies.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">Sin emergencias registradas</Typography></Box>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>F. Ingreso</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Diagnóstico</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Médico</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {emergencies.map((e) => (
                        <TableRow key={e.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDetailEmerg(e.id)}>
                          <TableCell>{e.ingress_date ? moment(e.ingress_date).format('DD/MM/YYYY') : '-'}</TableCell>
                          <TableCell>{e.diagnostic || '-'}</TableCell>
                          <TableCell>{e.doctors?.map((d) => d.name).join(', ') || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={STATUS_LABELS[e.status]?.label || '?'}
                              size="small"
                              color={e.status === 2 ? 'success' : e.status === 3 ? 'warning' : e.status === 4 ? 'default' : e.status === 5 ? 'error' : 'primary'}
                              sx={{ height: 18, '& .MuiChip-label': { fontSize: '0.6rem', px: 0.5 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Button size="small" onClick={(ev) => { ev.stopPropagation(); setDetailEmerg(e.id); }}>
                                Ver detalle
                              </Button>
                              {e.status === 2 && (
                                <Button
                                  size="small"
                                  onClick={async (ev) => {
                                    ev.stopPropagation();
                                    const data = await medicalHistoryApi.getForEmergency(e.id);
                                    generateEmergencyReport(data);
                                  }}
                                >
                                  Descargar Historia Clínica
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={emergenciesTotal}
                  page={emergenciesPage}
                  onPageChange={handleEmergenciesPageChange}
                  rowsPerPage={PER_PAGE}
                  rowsPerPageOptions={[PER_PAGE]}
                />
              </>
            )}
          </Paper>
        )}

        {activeTab === 'hospitalizaciones' && (
          <Paper>
            {loadingHospitalizations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : hospitalizations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">Sin hospitalizaciones registradas</Typography></Box>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>F. Ingreso</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>F. Alta</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Diagnóstico</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Médico</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hospitalizations.map((h) => (
                        <TableRow key={h.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDetailHosp(h.id)}>
                          <TableCell>{h.admission_date ? moment(h.admission_date).format('DD/MM/YYYY') : '-'}</TableCell>
                          <TableCell>{h.discharge_date ? moment(h.discharge_date).format('DD/MM/YYYY') : '-'}</TableCell>
                          <TableCell>{h.admission_diagnosis || h.emergency?.diagnostic || '-'}</TableCell>
                          <TableCell>{h.attending_doctor?.name || h.admitting_doctor?.name || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={h.status === 'active' ? 'Activo' : 'Alta'}
                              size="small"
                              color={h.status === 'active' ? 'warning' : 'success'}
                              sx={{ height: 18, '& .MuiChip-label': { fontSize: '0.6rem', px: 0.5 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Button size="small" onClick={(ev) => { ev.stopPropagation(); setDetailHosp(h.id); }}>
                                Ver detalle
                              </Button>
                              {h.status !== 'active' && (
                                <Button
                                  size="small"
                                  onClick={async (ev) => {
                                    ev.stopPropagation();
                                    const data = await medicalHistoryApi.getForHospitalization(h.id);
                                    generateHospitalizationReport(data);
                                  }}
                                >
                                  Descargar Historia Clínica
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={hospitalizationsTotal}
                  page={hospitalizationsPage}
                  onPageChange={handleHospitalizationsPageChange}
                  rowsPerPage={10}
                  rowsPerPageOptions={[10]}
                />
              </>
            )}
          </Paper>
        )}

        {activeTab === 'citas' && (
          <PatientAppointmentsSummary patientId={patient.id} />
        )}

        {activeTab === 'historial' && (
          <HistoricalCasePanel patient={patient} />
        )}

        {activeTab === 'laboratorios' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {loadingLab ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : labData.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">Sin resultados de laboratorio</Typography></Paper>
            ) : (
              labData.map(({ emergency, labs }) => (
                <Paper key={emergency.id} sx={{ p: 1.5, borderTop: 1, borderColor: 'secondary.dark' }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: '#7b1fa2' }}>
                    {moment(emergency.ingress_date).format('DD/MM/YYYY')} — {emergency.diagnostic}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {labs.map((lab) => (
                      <Chip
                        key={lab.id}
                        label={`${lab.parameter || lab.name}: ${lab.result} ${lab.unit || ''}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}

        {activeTab === 'notas' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loadingNotes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : notesData.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">Sin notas registradas</Typography></Paper>
            ) : (
              notesData.map((note) => (
                <Paper key={note.id} sx={{ p: 1.5, borderTop: 1, borderColor: 'secondary.dark', bgcolor: '#faf5ff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#7b1fa2' }}>
                      {note.emergency_date ? moment(note.emergency_date).format('DD/MM/YYYY') : ''} — {note.emergency_diagnostic || ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {note.created_at ? moment(note.created_at).format('DD/MM/YYYY HH:mm') : ''}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{note.note}</Typography>
                </Paper>
              ))
            )}
          </Box>
        )}

        {activeTab === 'alergias' && (
          <AllergiesSection patientId={patient.id} readOnly={isDeceased} />
        )}

        {activeTab === 'antecedentes' && (
          <AntecedentsSection patientId={patient.id} readOnly={isDeceased} />
        )}

        {activeTab === 'cirugias' && (
          <Paper>
            {loadingSurgeries ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : surgeries.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">Sin cirugías registradas</Typography></Box>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Tipo</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Cirujano</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Fecha</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Hora Inicio</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Hora Fin</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
                        <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {surgeries.map((s) => (
                        <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => setDetailSurg(s)}>
                          <TableCell>
                            <Chip
                              label={SURGERY_TYPES.find((t) => t.key === s.surgery_type)?.label || s.surgery_type}
                              size="small"
                              sx={{ bgcolor: '#00695c', color: 'white', fontSize: '0.65rem', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>{s.surgeon_name || '-'}</TableCell>
                          <TableCell>{s.surgery_date ? moment(s.surgery_date).format('DD/MM/YYYY') : '-'}</TableCell>
                          <TableCell>{s.scheduled_start_time ? moment(s.scheduled_start_time).format('HH:mm') : s.actual_start_time ? moment(s.actual_start_time).format('HH:mm') : '-'}</TableCell>
                          <TableCell>{s.scheduled_end_time ? moment(s.scheduled_end_time).format('HH:mm') : s.actual_end_time ? moment(s.actual_end_time).format('HH:mm') : '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={s.status === 'scheduled' ? 'Programada' : s.status === 'in_progress' ? 'En Progreso' : s.status === 'completed' ? 'Realizada' : 'Cancelada'}
                              size="small"
                              color={s.status === 'completed' ? 'success' : s.status === 'in_progress' ? 'warning' : s.status === 'scheduled' ? 'primary' : 'default'}
                              sx={{ height: 18, '& .MuiChip-label': { fontSize: '0.6rem', px: 0.5 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Button size="small" onClick={(ev) => { ev.stopPropagation(); setDetailSurg(s); }}>
                                Ver detalle
                              </Button>
                              {s.status === 'completed' && (
                                <Button
                                  size="small"
                                  startIcon={<DownloadIcon />}
                                  onClick={(ev) => { ev.stopPropagation(); generateSurgeryReport(s); }}
                                >
                                  Descargar Historia Clínica
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Paper>
        )}

        {activeTab === 'documentos' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <Paper sx={{ p: 1.5, borderTop: 1, borderColor: 'primary.main' }}>
              <DocumentsPanel attachableType="Patient" attachableId={patient.id} managePermission="pacientes.documentos" />
            </Paper>
          </Box>
        )}

        {activeTab === 'hijos' && (
          <Paper sx={{ p: 2 }}>
            {loadingChildren ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : childrenData.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Sin hijos registrados</Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Nombre</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Sexo</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Edad</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>CI</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>HC</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {childrenData.map((child) => (
                      <TableRow key={child.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{child.name} {child.lastname}</TableCell>
                        <TableCell>{child.gender === 'M' ? 'Masculino' : child.gender === 'F' ? 'Femenino' : '—'}</TableCell>
                        <TableCell>{child.age || '—'}</TableCell>
                        <TableCell>{child.ci || '—'}</TableCell>
                        <TableCell>{child.medical_history_number || '—'}</TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => {
                            if (onViewPatient) onViewPatient(child);
                          }}>Ver perfil</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Box>

      <EditPatientData open={editOpen} onClose={() => setEditOpen(false)} patient={patient} onSaved={handleEditSaved} />

      {detailEmerg && (
        <HistoryDetailModal
          open={!!detailEmerg}
          emergencyId={detailEmerg}
          onClose={() => setDetailEmerg(null)}
        />
      )}
      {detailHosp && (
        <HospitalizationDetailModal
          open={!!detailHosp}
          hospitalizationId={detailHosp}
          onClose={() => setDetailHosp(null)}
        />
      )}
      {detailSurg && (
        <SurgeryDetailModal
          open={!!detailSurg}
          surgery={detailSurg}
          onClose={() => setDetailSurg(null)}
        />
      )}
    </Box>
  );
};

export default PatientProfile;
