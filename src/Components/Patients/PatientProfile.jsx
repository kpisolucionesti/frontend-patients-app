import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Grid, Chip, Button, Table,
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
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import moment from 'moment';
import AllergiesSection from '../Portal/AllergiesSection';
import AntecedentsSection from '../Portal/AntecedentsSection';
import PatientAppointmentsSummary from '../Commons/PatientAppointmentsSummary';
import EditPatientData from './editPatientDataModal';
import HistoryDetailModal from '../History/HistoryDetailModal';

const TABS = [
  { key: 'resumen', label: 'Resumen', icon: <SummarizeIcon /> },
  { key: 'emergencias', label: 'Emergencias', icon: <EmergencyIcon /> },
  { key: 'hospitalizaciones', label: 'Hospitalizaciones', icon: <HotelIcon /> },
  { key: 'citas', label: 'Citas', icon: <CalendarMonthIcon /> },
  { key: 'laboratorios', label: 'Laboratorios', icon: <ScienceIcon /> },
  { key: 'notas', label: 'Notas', icon: <SubjectIcon /> },
  { key: 'alergias', label: 'Alergias', icon: <WarningIcon /> },
  { key: 'antecedentes', label: 'Antecedentes', icon: <HistoryIcon /> },
];

const GENDER_MAP = { M: 'Masculino', F: 'Femenino' };

const STATUS_LABELS = {
  1: { label: 'Atendido', color: '#1976d2' },
  2: { label: 'Alta', color: '#2e7d32' },
  3: { label: 'Ingresado', color: '#e65100' },
  4: { label: 'Anulada', color: '#757575' },
  5: { label: 'Fallecido', color: '#c62828' },
};

const PatientProfile = ({ patient, onBack }) => {
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
  const [editOpen, setEditOpen] = useState(false);
  const [detailEmerg, setDetailEmerg] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
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

  const handleEmergenciesPageChange = (_e, newPage) => setEmergenciesPage(newPage);

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

        <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd', borderLeft: '4px solid #1565c0' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {patient.name} {patient.lastname}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                CI: {patient.ci || 'N/A'} &nbsp;|&nbsp; {patient.age || '?'} años &nbsp;|&nbsp; {GENDER_MAP[patient.gender] || patient.gender || 'N/A'}
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

        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            bgcolor: 'white',
            borderRadius: 1,
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', minHeight: 36 },
            '& .Mui-selected': { color: '#1565c0', fontWeight: 700 },
            '& .MuiTabs-indicator': { bgcolor: '#1565c0' },
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.key} label={t.label} value={t.key} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>

        {activeTab === 'resumen' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="caption" color="text.secondary">Emergencias</Typography>
                  <Typography variant="h5" fontWeight={700}>{stats?.total_visits || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#fce4ec' }}>
                  <Typography variant="caption" color="text.secondary">Hospitalizaciones</Typography>
                  <Typography variant="h5" fontWeight={700}>{stats?.hospitalizations || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                  <Typography variant="caption" color="text.secondary">Citas</Typography>
                  <Typography variant="h5" fontWeight={700}>{stats?.appointments || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#e8eaf6' }}>
                  <Typography variant="caption" color="text.secondary">Cirugías</Typography>
                  <Typography variant="h5" fontWeight={700}>{stats?.surgeries || 0}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {recentEmergency && (
              <Paper sx={{ p: 1.5, borderLeft: '4px solid #1976d2' }}>
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
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>F. Ingreso</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Diagnóstico</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Médico</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Acciones</TableCell>
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
                              sx={{ bgcolor: STATUS_LABELS[e.status]?.color, color: 'white', fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" onClick={(ev) => { ev.stopPropagation(); setDetailEmerg(e.id); }}>
                              Ver detalle
                            </Button>
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
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Las hospitalizaciones se muestran en el detalle de cada emergencia (sección Emergencias → Ver detalle).
            </Typography>
          </Paper>
        )}

        {activeTab === 'citas' && (
          <PatientAppointmentsSummary patientId={patient.id} />
        )}

        {activeTab === 'laboratorios' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {loadingLab ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
            ) : labData.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">Sin resultados de laboratorio</Typography></Paper>
            ) : (
              labData.map(({ emergency, labs }) => (
                <Paper key={emergency.id} sx={{ p: 1.5, borderLeft: '4px solid #7b1fa2' }}>
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
                <Paper key={note.id} sx={{ p: 1.5, borderLeft: '4px solid #7b1fa2', bgcolor: '#faf5ff' }}>
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
      </Box>

      <EditPatientData open={editOpen} onClose={() => setEditOpen(false)} patient={patient} onSaved={handleEditSaved} />

      {detailEmerg && (
        <HistoryDetailModal
          open={!!detailEmerg}
          emergencyId={detailEmerg}
          onClose={() => setDetailEmerg(null)}
        />
      )}
    </Box>
  );
};

export default PatientProfile;
