import { useMemo, useState, memo, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Select, MenuItem, FormControl, Chip,
  Skeleton, InputLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import TodayIcon from '@mui/icons-material/Today';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BiotechIcon from '@mui/icons-material/Biotech';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useFetch } from '../../hooks/useFetch';
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'white', p: 1, border: 1, borderColor: 'divider', borderRadius: 1, fontSize: '0.75rem' }}>
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

/* ─── Dashboard ─── */

const Dashboard = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data, loading, error } = useFetch(
    () => BackendAPI.dashboard.getStats({ year: selectedYear }),
    [selectedYear],
  );

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

  const surgeriesByMonth = useMemo(() => (data?.surgeries_by_month || []).map((m) => ({
    month: m.month?.slice(5),
    count: m.count,
  })), [data]);

  const appointmentsByMonth = useMemo(() => (data?.appointments_by_month || []).map((m) => ({
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

  const recentEmergencies = useMemo(() => data?.recent_emergencies || [], [data]);

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
      <Box component="main" role="main" aria-label="Dashboard — error" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 1 }}>
        <ErrorIcon sx={{ color: 'error.main', fontSize: 40 }} />
        <Typography variant="body2" color="text.secondary">No se pudieron cargar los datos del dashboard</Typography>
      </Box>
    );
  }

  return (
    <Box component="main" role="main" aria-label="Dashboard" sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
      {/* ─── header ─── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontWeight={700} sx={{ fontSize: '1rem', m: 0 }}>Dashboard</Typography>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="dashboard-year-label" sx={{ fontSize: '0.7rem' }}>Año</InputLabel>
          <Select
            labelId="dashboard-year-label"
            label="Año"
            variant="outlined"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{ fontSize: '0.75rem' }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y} sx={{ fontSize: '0.75rem' }}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ─── KPI cards ─── */}
      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={3}>
          <KpiCard icon={<LocalHospitalIcon sx={{ fontSize: 20 }} />}
            label="Emergencias Activas" value={data.active_emergencies} bgcolor={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
            label="Total Emergencias" value={data.total_emergencies} bgcolor={theme.palette.success.main} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard icon={<BiotechIcon sx={{ fontSize: 20 }} />}
            label="Cirugías del Año" value={data.surgeries_total} bgcolor={theme.palette.info.main} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard icon={<CalendarMonthIcon sx={{ fontSize: 20 }} />}
            label="Citas Hoy" value={data.appointments_today} bgcolor={theme.palette.warning.dark} />
        </Grid>
      </Grid>

      {/* ─── info cards ─── */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8rem', mb: 1 }}>
                Estado del Sistema
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {healthStatus.status === 'checking' ? (
                  <Skeleton variant="text" width={120} />
                ) : healthStatus.status === 'ok' ? (
                  <>
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: 'success.main', fontSize: '0.75rem' }}>Operativo</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: 'error.main', fontSize: '0.75rem' }}>Error de conexión</Typography>
                    </Box>
                  </>
                )}
              </Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${data.total_emergencies} casos`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                <Chip label={`${data.surgeries_total} cirugías`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EventNoteIcon sx={{ color: 'warning.dark', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                  Próximas Citas
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="warning.dark" sx={{ fontSize: '1.1rem' }}>
                {data.appointments_upcoming}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Citas programadas/confirmadas pendientes</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                  Tiempo Promedio
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ fontSize: '1.1rem' }}>
                {(data.avg_wait_time / 60).toFixed(1)} <Typography component="span" variant="caption" color="text.secondary">hrs</Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Tiempo promedio en emergencia</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <ChartCard title="Últimas 24h" ariaLabel="Tabla de emergencias recientes en las últimas 24 horas">
            <TableContainer sx={{ maxHeight: 165, borderRadius: 1 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Nombre</TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentEmergencies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} sx={{ fontSize: '0.7rem', p: 0.5, textAlign: 'center', color: 'text.secondary' }}>
                        Sin emergencias recientes
                      </TableCell>
                    </TableRow>
                  ) : recentEmergencies.slice(0, 6).map((e, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{(e.patient_name || '') + ' ' + (e.patient_lastname || '')}</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>
                        <Chip
                          label={STATUS_CONFIG[e.status]?.label || '?'}
                          color={STATUS_CONFIG[e.status]?.chipColor || 'default'}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ─── Charts Row 1: Emergency + Surgery by Month ─── */}
      <Grid container spacing={1.5}>
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
          <ChartCard title="Cirugías por Mes" ariaLabel="Gráfico de barras: cirugías por mes">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={surgeriesByMonth} role="img" aria-label={`Gráfico de cirugías mensuales. ${surgeriesByMonth.length} meses con datos.`}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={theme.palette.info.main} radius={[4, 4, 0, 0]} name="Cirugías" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ─── Charts Row 2: Appointments by Month + Surgery Status Pie ─── */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Citas por Mes" ariaLabel="Gráfico de barras: citas por mes">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={appointmentsByMonth} role="img" aria-label={`Gráfico de citas mensuales. ${appointmentsByMonth.length} meses con datos.`}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={theme.palette.warning.dark} radius={[4, 4, 0, 0]} name="Citas" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Estado de Cirugías" ariaLabel="Gráfico de torta: distribución de cirugías por estado">
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={surgeryStatusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={30}>
                    {surgeryStatusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ flex: 1 }}>
                <PieLegend data={surgeryStatusPieData} total={surgeryPieTotal} />
              </Box>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ─── Charts Row 3: Distribution by Status + Appointments by Status ─── */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Distribución de Emergencias por Estado" ariaLabel="Gráfico de torta: emergencias por estado (alta, ingresado, anulada, fallecido)">
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={30}>
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ flex: 1 }}>
                <PieLegend data={statusPieData} total={statusPieTotal} />
              </Box>
            </Box>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Distribución de Citas por Estado" ariaLabel="Gráfico de torta: citas por estado">
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={apptStatusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={30}>
                    {apptStatusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ flex: 1 }}>
                <PieLegend data={apptStatusPieData} total={apptPieTotal} />
              </Box>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ─── Charts Row 4: Avg Wait Time + Saturation Peaks ─── */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Tiempo Promedio de Espera (horas)" ariaLabel="Gráfico de líneas: tiempo promedio de espera mensual en horas">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={avgWaitByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} role="img" aria-label={`Tiempo de espera promedio. ${avgWaitByMonth.length} meses con datos.`}>
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
          <ChartCard title="Picos de Saturación" ariaLabel="Gráfico de barras: saturación por hora del día, coloreado por nivel de actividad">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={saturationData} role="img" aria-label={`Saturación horaria. Hora pico: ${saturationPeakLabel}.`}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]} name="Casos">
                  {saturationData.map((entry, i) => (
                    <Cell key={i} fill={getSaturationColor(entry.count)} name={`${entry.hour}: ${getSaturationLabel(entry.count)} (${entry.count} casos)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* ─── Charts Row 5: Classification ─── */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Casos por Clasificación (Triage)" ariaLabel="Gráfico de barras horizontal: casos por clasificación de triage Manchester">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={classificationData} layout="vertical" role="img" aria-label={`Distribución de triage: ${classificationData.map(d => `${d.name}: ${d.value}`).join(', ')}`}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {classificationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Cirugías por Tipo" ariaLabel="Gráfico de barras horizontal: cirugías por tipo">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={(data?.surgeries_by_type || []).slice(0, 10)} layout="vertical" role="img" aria-label={`Top de tipos de cirugía. ${(data?.surgeries_by_type || []).slice(0, 5).map(s => `${s.type}: ${s.count}`).join(', ')}`}>
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
  );
};

export default Dashboard;
