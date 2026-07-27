import { useMemo, useState, memo, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid, Paper, Typography, Select, MenuItem, FormControl,
  Skeleton, InputLabel, Collapse, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HotelIcon from '@mui/icons-material/Hotel';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { useFetch } from '../../hooks/useFetch';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { BackendAPI } from '../../services/BackendApi';
import { STATUS_LABELS, CLASSIFICATION_OPTIONS, STATUS_CONFIG } from '../../constants';

/* ─── saturation thresholds ─── */
const SATURATION_LOW = 0.25;
const SATURATION_MEDIUM = 0.5;
const SATURATION_HIGH = 0.75;

/* ─── surgery + appointment config (dashboard-specific) ─── */

const SURGERY_STATUS_CONFIG = {
  scheduled:      { label: 'Programada',   color: 'primary.main' },
  in_progress:    { label: 'En Progreso',  color: 'warning.dark' },
  completed:      { label: 'Realizada',    color: 'success.main' },
  cancelled:      { label: 'Cancelada',    color: 'text.disabled' },
};

const APPT_STATUS_CONFIG = {
  scheduled:        { label: 'Programada',    color: 'primary.main' },
  confirmed:        { label: 'Confirmada',    color: '#43a047' },
  in_consultation:  { label: 'En Consulta',   color: 'warning.dark' },
  completed:        { label: 'Completada',    color: 'success.main' },
  cancelled:        { label: 'Cancelada',     color: 'text.disabled' },
  no_show:          { label: 'No Asistió',    color: 'error.main' },
};

/* ─── memoized sub-components ─── */

const KpiCard = memo(function KpiCard({ icon, label, value, bgcolor }) {
  return (
    <Card sx={{ bgcolor, boxShadow: 3 }} role="status" aria-label={`${label}: ${value ?? 'sin datos'}`}>
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2, p: 1, display: 'flex' }}>
            {icon}
          </Box>
          <Box>
            <Typography variant="caption" color="white" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>
              {label}
            </Typography>
            <Typography variant="h6" fontWeight={700} color="white" sx={{ fontSize: '1rem' }}>
              {value ?? 'N/A'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

const ChartCard = memo(function ChartCard({ title, extra, children, ariaLabel }) {
  return (
    <Paper sx={{ p: 1.5, boxShadow: 3, borderRadius: 1, height: '100%' }} role="region" aria-label={ariaLabel || title}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{title}</Typography>
        {extra}
      </Box>
      {children}
    </Paper>
  );
});

const PieLegend = memo(function PieLegend({ data, total }) {
  if (!data.length) {
    return <Typography variant="caption" color="text.secondary">Sin datos</Typography>;
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
      {data.map((entry, i) => {
        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
        return (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: entry.color, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
              {entry.name}: {entry.value} ({pct}%)
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
});

const OperationalTables = memo(function OperationalTables({ activeEmergencies, activeHospitalizations, scheduledSurgeries, roomsMap, open, onToggle }) {
  const theme = useTheme();
  const headerSx = { bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.8rem', p: 1, whiteSpace: 'nowrap' };
  const cellSx = { fontSize: '0.8rem', p: 1 };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={onToggle} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>Pacientes en Atención</Typography>
        <IconButton size="small" sx={{ ml: 0.5 }} aria-label={open ? 'Ocultar tablas' : 'Mostrar tablas'}>{open ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1.5 }}>
          <Paper sx={{ boxShadow: 3, borderRadius: 1 }}>
            <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
              <LocalHospitalIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={600}>Emergencias Activas</Typography>
              <Chip label={activeEmergencies.length} size="small" color="primary" sx={{ fontWeight: 700, height: 24 }} />
            </Box>
            <TableContainer sx={{ maxHeight: 220 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerSx}>Paciente</TableCell>
                    <TableCell sx={headerSx}>Diagnóstico</TableCell>
                    <TableCell sx={headerSx}>Médico</TableCell>
                    <TableCell sx={headerSx}>Tiempo</TableCell>
                    <TableCell sx={headerSx}>Habitación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeEmergencies.length === 0 ? (
                    <TableRow><TableCell colSpan={5} sx={{ ...cellSx, textAlign: 'center', color: 'text.secondary' }}>Sin emergencias activas</TableCell></TableRow>
                  ) : activeEmergencies.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell sx={cellSx}>{`${e.patient?.name || ''} ${e.patient?.lastname || ''}`}</TableCell>
                      <TableCell sx={{ ...cellSx, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.diagnostic || '-'}</TableCell>
                      <TableCell sx={cellSx}>{e.primary_doctor?.name || '-'}</TableCell>
                      <TableCell sx={cellSx}>{formatElapsed(e.ingress_date)}</TableCell>
                      <TableCell sx={cellSx}>
                        <Chip label={roomsMap[e.patient_id] || '-'} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.75rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ boxShadow: 3, borderRadius: 1 }}>
            <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
              <HotelIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
              <Typography variant="subtitle2" fontWeight={600}>Hospitalizaciones Activas</Typography>
              <Chip label={activeHospitalizations.length} size="small" color="secondary" sx={{ fontWeight: 700, height: 24 }} />
            </Box>
            <TableContainer sx={{ maxHeight: 220 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerSx}>Paciente</TableCell>
                    <TableCell sx={headerSx}>Diagnóstico</TableCell>
                    <TableCell sx={headerSx}>Médico</TableCell>
                    <TableCell sx={headerSx}>Tiempo</TableCell>
                    <TableCell sx={headerSx}>Habitación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeHospitalizations.length === 0 ? (
                    <TableRow><TableCell colSpan={5} sx={{ ...cellSx, textAlign: 'center', color: 'text.secondary' }}>Sin hospitalizaciones activas</TableCell></TableRow>
                  ) : activeHospitalizations.map((h) => (
                    <TableRow key={h.id} hover>
                      <TableCell sx={cellSx}>{`${h.emergency?.patient?.name || ''} ${h.emergency?.patient?.lastname || ''}`}</TableCell>
                      <TableCell sx={{ ...cellSx, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.admission_diagnosis || h.emergency?.diagnostic || '-'}</TableCell>
                      <TableCell sx={cellSx}>{h.attending_doctor?.name || h.admitting_doctor?.name || '-'}</TableCell>
                      <TableCell sx={cellSx}>{formatElapsed(h.admission_date)}</TableCell>
                      <TableCell sx={cellSx}>
                        <Chip label={h.room?.name || '-'} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.75rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper sx={{ boxShadow: 3, borderRadius: 1 }}>
            <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
              <MedicalServicesIcon sx={{ fontSize: 20, color: 'success.main' }} />
              <Typography variant="subtitle2" fontWeight={600}>Cirugías Programadas</Typography>
              <Chip label={scheduledSurgeries.length} size="small" color="success" sx={{ fontWeight: 700, height: 24 }} />
            </Box>
            <TableContainer sx={{ maxHeight: 220 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerSx}>Paciente</TableCell>
                    <TableCell sx={headerSx}>Diagnóstico</TableCell>
                    <TableCell sx={headerSx}>Médico</TableCell>
                    <TableCell sx={headerSx}>Hora Programada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scheduledSurgeries.length === 0 ? (
                    <TableRow><TableCell colSpan={4} sx={{ ...cellSx, textAlign: 'center', color: 'text.secondary' }}>Sin cirugías programadas</TableCell></TableRow>
                  ) : scheduledSurgeries.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell sx={cellSx}>{s.patient ? `${s.patient.name || ''} ${s.patient.lastname || ''}` : (s.patient_name || '-')}</TableCell>
                      <TableCell sx={{ ...cellSx, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.surgery_type || '-'}</TableCell>
                      <TableCell sx={cellSx}>{s.surgeon_name || '-'}</TableCell>
                      <TableCell sx={cellSx}>{formatDate(s.scheduled_start_time || s.surgery_date)} {s.scheduled_start_time ? new Date(s.scheduled_start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Collapse>
    </Box>
  );
});

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1, border: 1, borderColor: 'divider', borderRadius: 1, fontSize: '0.75rem' }}>
        <Typography variant="caption" fontWeight={600}>{label}</Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="caption" sx={{ color: p.color, display: 'block' }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

function formatElapsed(isoString) {
  if (!isoString) return '-';
  const ms = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

function formatDate(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* ─── Dashboard ─── */

const Dashboard = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  useDocumentTitle('Dashboard');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [tablesOpen, setTablesOpen] = useState(true);

  const { data, loading, error, fetchedAt, refetch } = useFetch(
    () => BackendAPI.dashboard.getStats({ year: selectedYear }),
    [selectedYear],
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const { data: emergData } = useFetch(() => BackendAPI.emergencies.getAll({ status: 1, per_page: 200 }), []);
  const { data: hospCensus } = useFetch(() => BackendAPI.hospitalizations.census(), []);
  const { data: surgSchedule } = useFetch(() => BackendAPI.quirofano.getSchedule(todayStr), []);
  const { data: roomsData } = useFetch(() => BackendAPI.rooms.getAll(), []);

  const activeEmergencies = useMemo(() => emergData?.data || [], [emergData]);
  const activeHospitalizations = useMemo(() => (hospCensus?.data || []).filter((h) => h.status === 'active'), [hospCensus]);
  const scheduledSurgeries = useMemo(() => {
    const all = surgSchedule?.surgeries || [];
    return all.filter((s) => s.status === 'scheduled');
  }, [surgSchedule]);

  const roomsMap = useMemo(() => {
    const map = {};
    (roomsData || []).forEach((r) => { if (r.patient_id) map[r.patient_id] = r.name; });
    return map;
  }, [roomsData]);

  const healthStatus = useMemo(() => {
    if (loading) return { status: 'checking', latency: null };
    if (error || !data) return { status: 'error', latency: null };
    return { status: 'ok', latency: null };
  }, [loading, error, data]);

  /* ─── year list ─── */

  const years = useMemo(() => {
    const y = [];
    for (let i = currentYear; i >= currentYear - 5; i--) y.push(i);
    return y;
  }, [currentYear]);

  /* ─── derived data ─── */

  const emergenciesByMonth = useMemo(() => (data?.emergencies_by_month || []).map((m) => ({
    month: m.month?.slice(5),
    count: m.count,
  })), [data]);

  const statusPieData = useMemo(() => {
    const map = data?.by_status || {};
    const entries = Object.entries(map)
      .filter(([k]) => ['2', '3', '4', '5'].includes(k))
      .map(([k, v]) => ({
        name: STATUS_LABELS[k] || k,
        value: v,
        color: STATUS_CONFIG[k]?.bg || '#ccc',
      }));
    return entries;
  }, [data]);
  const statusPieTotal = useMemo(() => statusPieData.reduce((s, d) => s + d.value, 0), [statusPieData]);

  const surgeryStatusPieData = useMemo(() => {
    const map = data?.surgeries_by_status || {};
    const entries = Object.entries(map).map(([k, v]) => ({
      name: SURGERY_STATUS_CONFIG[k]?.label || k,
      value: v,
      color: SURGERY_STATUS_CONFIG[k]?.color || '#ccc',
    }));
    return entries;
  }, [data]);
  const surgeryPieTotal = useMemo(() => surgeryStatusPieData.reduce((s, d) => s + d.value, 0), [surgeryStatusPieData]);

  const apptStatusPieData = useMemo(() => {
    const map = data?.appointments_by_status || {};
    const entries = Object.entries(map).map(([k, v]) => ({
      name: APPT_STATUS_CONFIG[k]?.label || k,
      value: v,
      color: APPT_STATUS_CONFIG[k]?.color || '#ccc',
    }));
    return entries;
  }, [data]);
  const apptPieTotal = useMemo(() => apptStatusPieData.reduce((s, d) => s + d.value, 0), [apptStatusPieData]);

  const classificationColors = useMemo(() => {
    const map = {};
    CLASSIFICATION_OPTIONS.forEach((c) => { map[c.key] = c.color; });
    map.null = '#bdbdbd';
    return map;
  }, []);

  const classificationData = useMemo(() => {
    const map = data?.by_classification || {};
    return Object.entries(map).map(([k, v]) => ({
      name: CLASSIFICATION_OPTIONS.find((c) => c.key === k)?.label || 'Sin clasificar',
      value: v,
      color: classificationColors[k] || '#bdbdbd',
    }));
  }, [data, classificationColors]);

  const avgWaitByMonth = useMemo(() => (data?.avg_wait_by_month || []).map((m) => ({
    month: m.month?.slice(5),
    avg_hr: parseFloat((m.avg_min / 60).toFixed(1)),
  })), [data]);

  const saturationData = useMemo(() => {
    const map = data?.by_hour || {};
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: map[i.toString()] || 0,
    }));
  }, [data]);

  const maxSaturation = useMemo(
    () => Math.max(...saturationData.map((d) => d.count), 1),
    [saturationData],
  );

  const getSaturationColor = useCallback((count) => {
    if (count === 0) return '#e0e0e0';
    const ratio = count / maxSaturation;
    if (ratio > SATURATION_HIGH) return theme.palette.error.main;
    if (ratio > SATURATION_MEDIUM) return theme.palette.warning.dark;
    if (ratio > SATURATION_LOW) return '#fdd835';
    return theme.palette.success.main;
  }, [maxSaturation, theme]);

  const getSaturationLabel = useCallback((count) => {
    if (count === 0) return 'Sin actividad';
    const ratio = count / maxSaturation;
    if (ratio > SATURATION_HIGH) return 'Crítica';
    if (ratio > SATURATION_MEDIUM) return 'Alta';
    if (ratio > SATURATION_LOW) return 'Moderada';
    return 'Baja';
  }, [maxSaturation]);

  const saturationPeakLabel = useMemo(() => {
    if (!saturationData.length) return 'sin datos';
    const peak = [...saturationData].sort((a, b) => b.count - a.count)[0];
    return peak ? `${peak.hour} con ${peak.count} casos` : 'sin datos';
  }, [saturationData]);

  /* ─── loading / error ─── */

  if (loading) {
    return (
      <Box component="main" role="main" aria-label="Dashboard — cargando" sx={{ p: 2, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>Dashboard</Typography>
          <Skeleton variant="text" width={60} height={32} />
        </Box>
        <Grid container spacing={1.5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Skeleton variant="rounded" height={64} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rounded" height={120} />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rounded" height={240} />
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box component="main" role="main" aria-label="Dashboard — error" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
        <ErrorIcon sx={{ color: 'error.main', fontSize: 40 }} />
        <Typography variant="body2" color="text.secondary">No se pudieron cargar los datos del dashboard</Typography>
        <Button variant="outlined" onClick={refetch}>Reintentar</Button>
      </Box>
    );
  }

  return (
    <Box component="main" role="main" aria-label="Dashboard" sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, flex: 1, minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography fontWeight={700} sx={{ fontSize: '1.25rem', m: 0 }}>Dashboard</Typography>
          <Typography variant="caption" color="text.secondary" role="status" aria-live="polite">
            Actualizado: {fetchedAt ? new Date(fetchedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '—'}
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="dashboard-year-label">Año</InputLabel>
          <Select labelId="dashboard-year-label" label="Año" variant="outlined" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {years.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard icon={<LocalHospitalIcon sx={{ fontSize: 24 }} />} label="Emergencias Activas" value={data.active_emergencies} bgcolor={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard icon={<HotelIcon sx={{ fontSize: 24 }} />} label="Hospitalizaciones" value={activeHospitalizations.length} bgcolor={theme.palette.secondary.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard icon={<MedicalServicesIcon sx={{ fontSize: 24 }} />} label="Cirugías Programadas" value={scheduledSurgeries.length} bgcolor={theme.palette.success.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard icon={<AccessTimeIcon sx={{ fontSize: 24 }} />} label="Tiempo Promedio" value={`${(data.avg_wait_time / 60).toFixed(1)} hrs`} bgcolor={theme.palette.warning.dark} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KpiCard icon={<CalendarMonthIcon sx={{ fontSize: 24 }} />} label="Citas Hoy" value={data.appointments_today} bgcolor={theme.palette.info.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: healthStatus.status === 'ok' ? theme.palette.success.main : theme.palette.error.main, boxShadow: 3 }} role="status">
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2, p: 1, display: 'flex' }}>
                  {healthStatus.status === 'ok' ? <CheckCircleIcon sx={{ fontSize: 24 }} /> : <ErrorIcon sx={{ fontSize: 24 }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" color="white" sx={{ opacity: 0.85, fontSize: '0.75rem' }}>Sistema</Typography>
                  <Typography variant="h6" fontWeight={700} color="white" sx={{ fontSize: '1rem' }}>
                    {healthStatus.status === 'ok' ? 'Operativo' : 'Error'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <OperationalTables activeEmergencies={activeEmergencies} activeHospitalizations={activeHospitalizations} scheduledSurgeries={scheduledSurgeries} roomsMap={roomsMap} open={tablesOpen} onToggle={() => setTablesOpen((o) => !o)} />

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setReportsOpen((o) => !o)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setReportsOpen((o) => !o); } }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
            Reportes y Tendencias
          </Typography>
          <IconButton size="small" sx={{ ml: 0.5 }} aria-label={reportsOpen ? 'Ocultar reportes' : 'Mostrar reportes'}>
            {reportsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={reportsOpen}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ChartCard title="Emergencias por Mes" ariaLabel="Gráfico de barras: emergencias por mes">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={emergenciesByMonth} role="img" aria-label={`Gráfico de emergencias mensuales. ${emergenciesByMonth.length} meses con datos.`}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} name="Emergencias" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartCard title="Picos de Saturación" ariaLabel="Gráfico de barras: saturación por hora">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={saturationData} role="img" aria-label={`Saturación horaria. Hora pico: ${saturationPeakLabel}.`}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[2, 2, 0, 0]} name="Casos">
                        {saturationData.map((entry, i) => (<Cell key={i} fill={getSaturationColor(entry.count)} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ChartCard title="Tiempo Promedio de Espera (horas)" ariaLabel="Gráfico de líneas: tiempo promedio de espera mensual">
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={avgWaitByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} role="img">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 'auto']} width={35} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="avg_hr" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 3 }} name="Horas" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartCard title="Casos por Clasificación (Triage)" ariaLabel="Gráfico de barras horizontal: casos por clasificación de triage">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={classificationData} layout="vertical" role="img">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {classificationData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ChartCard title="Distribución de Emergencias por Estado" ariaLabel="Gráfico de torta: emergencias por estado">
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart>
                        <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={30}>
                          {statusPieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ flex: 1 }}><PieLegend data={statusPieData} total={statusPieTotal} /></Box>
                  </Box>
                </ChartCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartCard title="Distribución de Citas por Estado" ariaLabel="Gráfico de torta: citas por estado">
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart>
                        <Pie data={apptStatusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={30}>
                          {apptStatusPieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ flex: 1 }}><PieLegend data={apptStatusPieData} total={apptPieTotal} /></Box>
                  </Box>
                </ChartCard>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ChartCard title="Cirugías por Estado" ariaLabel="Gráfico de torta: cirugías por estado">
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <ResponsiveContainer width="55%" height={200}>
                      <PieChart>
                        <Pie data={surgeryStatusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={30}>
                          {surgeryStatusPieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ flex: 1 }}><PieLegend data={surgeryStatusPieData} total={surgeryPieTotal} /></Box>
                  </Box>
                </ChartCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartCard title="Cirugías por Tipo" ariaLabel="Gráfico de barras horizontal: top tipos de cirugía">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={(data?.surgeries_by_type || []).slice(0, 10)} layout="vertical" role="img">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={110} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill={theme.palette.info.main} radius={[0, 4, 4, 0]} name="Cirugías" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Dashboard;
