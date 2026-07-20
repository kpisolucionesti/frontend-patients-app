import { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Select, MenuItem, FormControl, Chip,
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';
import TodayIcon from '@mui/icons-material/Today';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useFetch } from '../../hooks/useFetch';
import { BackendAPI } from '../../services/BackendApi';
import { STATUS_LABELS, CLASSIFICATION_OPTIONS } from '../../constants';

const STATUS_COLORS = {
  2: '#2e7d32',
  3: '#6a1b9a',
  4: '#9e9e9e',
  5: '#212121',
  1: '#1565c0',
};

const STATUS_CHIP = {
  0: { color: 'success', label: 'Esperando' },
  1: { color: 'warning', label: 'Atendido' },
  2: { color: 'success', label: 'Alta Médica' },
  3: { color: 'secondary', label: 'Ingreso a Hospitalización' },
  4: { color: 'default', label: 'Anulada' },
  5: { color: 'default', label: 'Fallecido' },
};

const KpiCard = ({ icon, label, value, color }) => (
  <Card sx={{ bgcolor: color || '#f5f5f5', boxShadow: 3 }}>
    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 2, p: 1, display: 'flex' }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="white" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>{label}</Typography>
          <Typography variant="h6" fontWeight={700} color="white" sx={{ fontSize: '1rem' }}>{value ?? 'N/A'}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, extra, children }) => (
  <Paper sx={{ p: 1.5, boxShadow: 3, borderRadius: 1, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>{title}</Typography>
      {extra}
    </Box>
    {children}
  </Paper>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'white', p: 1, border: '1px solid #ccc', borderRadius: 1, fontSize: '0.75rem' }}>
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

const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [healthStatus, setHealthStatus] = useState({ status: 'checking', latency: null });

  const { data, loading } = useFetch(
    () => BackendAPI.dashboard.getStats({ year: selectedYear }),
    [selectedYear],
  );

  useEffect(() => {
    const start = performance.now();
    BackendAPI.dashboard.getStats({ year: selectedYear })
      .then(() => setHealthStatus({ status: 'ok', latency: Math.round(performance.now() - start) }))
      .catch(() => setHealthStatus({ status: 'error', latency: null }));
  }, [selectedYear]);

  const years = useMemo(() => {
    const y = [];
    for (let i = currentYear; i >= currentYear - 5; i--) y.push(i);
    return y;
  }, [currentYear]);

  const byMonth = useMemo(() => (data?.by_month || []).map((m) => ({
    month: m.month?.slice(5),
    count: m.count,
  })), [data]);

  const statusPieData = useMemo(() => {
    const map = data?.by_status || {};
    return Object.entries(map)
      .filter(([k]) => ['2', '3', '4', '5'].includes(k))
      .map(([k, v]) => ({
        name: STATUS_LABELS[k] || k,
        value: v,
        color: STATUS_COLORS[k] || '#ccc',
      }));
  }, [data]);

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

  const getSaturationColor = (count) => {
    if (count === 0) return '#e0e0e0';
    const ratio = count / maxSaturation;
    if (ratio > 0.75) return '#e53935';
    if (ratio > 0.5) return '#fb8c00';
    if (ratio > 0.25) return '#fdd835';
    return '#43a047';
  };

  const recentEmergencies = useMemo(() => data?.recent_emergencies || [], [data]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" color="text.secondary">Cargando dashboard...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="body2" color="text.secondary">No se pudieron cargar los datos</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, p: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.9rem' }}>Dashboard</Typography>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            variant="standard"
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

      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={3}>
          <KpiCard icon={<LocalHospitalIcon sx={{ fontSize: 20 }} />}
            label="Emergencias Activas" value={data.active_emergencies} color="#1565c0" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
            label="Total Emergencias" value={data.total_emergencies} color="#2e7d32" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard icon={<PeopleIcon sx={{ fontSize: 20 }} />}
            label="Pacientes Registrados" value={data.total_patients} color="#6a1b9a" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard icon={<TodayIcon sx={{ fontSize: 20 }} />}
            label="Casos Hoy" value={data.today_count} color="#e65100" />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8rem', mb: 1 }}>
                Estado del Sistema
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {healthStatus.status === 'checking' ? (
                  <Typography variant="caption" color="text.secondary">Verificando...</Typography>
                ) : healthStatus.status === 'ok' ? (
                  <>
                    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#2e7d32', fontSize: '0.75rem' }}>Operativo</Typography>
                      <Typography variant="caption" color="text.secondary">{healthStatus.latency}ms</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <ErrorIcon sx={{ color: '#e53935', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#e53935', fontSize: '0.75rem' }}>Fallando</Typography>
                    </Box>
                  </>
                )}
              </Box>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`${data.total_emergencies} casos`} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 20 }} />
                <Chip label={`${data.total_patients} pacientes`} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 20 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTimeIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                  Tiempo Promedio
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="#1565c0" sx={{ fontSize: '1.1rem' }}>
                {(data.avg_wait_time / 60).toFixed(1)} <Typography component="span" variant="caption" color="text.secondary">hrs</Typography>
              </Typography>
              <Typography variant="caption" color="text.secondary">Tiempo promedio en emergencia</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Últimas 24 horas">
            <TableContainer sx={{ maxHeight: 260 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', p: 0.5 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', p: 0.5 }}>Apellido</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', p: 0.5 }}>Médico</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', p: 0.5 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentEmergencies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ fontSize: '0.65rem', p: 0.5, textAlign: 'center', color: 'text.secondary' }}>
                        Sin emergencias en las últimas 24h
                      </TableCell>
                    </TableRow>
                  ) : recentEmergencies.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontSize: '0.65rem', p: 0.5 }}>{e.patient_name || '-'}</TableCell>
                      <TableCell sx={{ fontSize: '0.65rem', p: 0.5 }}>{e.patient_lastname || '-'}</TableCell>
                      <TableCell sx={{ fontSize: '0.65rem', p: 0.5 }}>{e.doctor_name || '-'}</TableCell>
                      <TableCell sx={{ fontSize: '0.65rem', p: 0.5 }}>
                        <Chip
                          label={STATUS_CHIP[e.status]?.label || '?'}
                          color={STATUS_CHIP[e.status]?.color || 'default'}
                          size="small"
                          sx={{ height: 18, fontSize: '0.6rem' }}
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

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Casos por Mes">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#1565c0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Distribución por Estado">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Tiempo Promedio de Espera (horas)">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={avgWaitByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 'auto']} width={35} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="avg_hr" stroke="#1565c0" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Picos de Saturación (horarios más concurridos)">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={saturationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {saturationData.map((entry, i) => (
                    <Cell key={i} fill={getSaturationColor(entry.count)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Casos por Clasificación (Triage)">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={classificationData} layout="vertical">
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
        <Grid item xs={12} md={6} />
      </Grid>
    </Box>
  );
};

export default Dashboard;
