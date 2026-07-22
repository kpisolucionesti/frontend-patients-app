import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, TextField, InputAdornment,
  CircularProgress, Stack, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmergencyIcon from '@mui/icons-material/LocalHospital';
import HotelIcon from '@mui/icons-material/Hotel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ScienceIcon from '@mui/icons-material/Science';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';
import BreadcrumbNav from '../Commons/BreadcrumbNav';

const HISTORICAL_STATUSES = [2, 3, 4, 5];

const STATUS_LABELS = {
  2: { label: 'Alta', color: '#2e7d32' },
  3: { label: 'Ingresado', color: '#e65100' },
  4: { label: 'Anulada', color: '#757575' },
  5: { label: 'Fallecido', color: '#c62828' },
};

const TABS = [
  { key: 'emergencias', label: 'Emergencias', icon: <EmergencyIcon /> },
  { key: 'hospitalizaciones', label: 'Hospitalizaciones', icon: <HotelIcon /> },
  { key: 'citas', label: 'Citas', icon: <CalendarMonthIcon /> },
  { key: 'cirugias', label: 'Cirugías', icon: <ScienceIcon /> },
];

const Historial = () => {
  const [activeTab, setActiveTab] = useState('emergencias');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const yearOptions = Array.from({ length: new Date().getFullYear() - 2019 }, (_, i) => new Date().getFullYear() - i);
  const [loading, setLoading] = useState(false);

  const [emergencies, setEmergencies] = useState([]);
  const [hospitalizations, setHospitalizations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [surgeries, setSurgeries] = useState([]);

  const applyDateFilter = (items, dateField) => {
    return items.filter((item) => {
      const v = item[dateField];
      if (!v) return !dateFrom && !dateTo;
      const d = new Date(v);
      if (isNaN(d.getTime())) return true;
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  };

  const yearFrom = `${selectedYear}-01-01`;
  const yearTo = `${selectedYear}-12-31`;

  const fetchEmergencies = useCallback(async (q = '', dateF = dateFrom, dateT = dateTo) => {
    setLoading(true);
    try {
      const params = { per_page: 200, from: yearFrom, to: yearTo };
      if (q) params.q = q;
      const res = await BackendAPI.emergencies.getAll(params);
      const all = res.data || [];
      let filtered = all.filter((e) => HISTORICAL_STATUSES.includes(e.status));
      filtered = applyDateFilter(filtered, 'ingress_date');
      setEmergencies(filtered);
    } catch {
      setEmergencies([]);
    }
    setLoading(false);
  }, [dateFrom, dateTo, yearFrom, yearTo]);

  const fetchHospitalizations = useCallback(async (q = '', dateF = dateFrom, dateT = dateTo) => {
    setLoading(true);
    try {
      const res = await BackendAPI.hospitalizations.historical({ per_page: 100, q, from: yearFrom, to: yearTo });
      let data = res.data || [];
      data = applyDateFilter(data, 'admission_date');
      setHospitalizations(data);
    } catch {
      setHospitalizations([]);
    }
    setLoading(false);
  }, [dateFrom, dateTo, yearFrom, yearTo]);

  const fetchAppointments = useCallback(async (q = '', dateF = dateFrom, dateT = dateTo) => {
    setLoading(true);
    try {
      const allAppointments = await BackendAPI.appointments.getAll({ per_page: 200 });
      const now = new Date();
      let past = (allAppointments || []).filter((a) => new Date(a.appointment_date) < now);
      if (q) {
        const t = q.toLowerCase();
        past = past.filter((a) =>
          (a.patient?.name || '').toLowerCase().includes(t) ||
          (a.patient?.lastname || '').toLowerCase().includes(t) ||
          (a.patient?.ci || '').includes(t)
        );
      }
      past = past.filter((a) => {
        if (!a.appointment_date) return false;
        return new Date(a.appointment_date).getFullYear() === selectedYear;
      });
      past = applyDateFilter(past, 'appointment_date');
      setAppointments(past);
    } catch {
      setAppointments([]);
    }
    setLoading(false);
  }, [dateFrom, dateTo, selectedYear]);

  const fetchSurgeries = useCallback(async (q = '', dateF = dateFrom, dateT = dateTo) => {
    setLoading(true);
    try {
      const params = { per_page: 100, from: yearFrom, to: yearTo };
      if (q) params.q = q;
      const res = await BackendAPI.surgeries.search(params);
      let data = res.data || [];
      data = applyDateFilter(data, 'surgery_date');
      setSurgeries(data);
    } catch {
      setSurgeries([]);
    }
    setLoading(false);
  }, [dateFrom, dateTo, yearFrom, yearTo]);

  const fetchData = useCallback((q) => {
    switch (activeTab) {
      case 'emergencias': fetchEmergencies(q); break;
      case 'hospitalizaciones': fetchHospitalizations(q); break;
      case 'citas': fetchAppointments(q); break;
      case 'cirugias': fetchSurgeries(q); break;
    }
  }, [activeTab, fetchEmergencies, fetchHospitalizations, fetchAppointments, fetchSurgeries]);

  useEffect(() => {
    fetchData('');
  }, [activeTab]);

  const handleSearch = () => {
    fetchData(search);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
    fetchData(search);
  };

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    fetchData(search);
  };

  const renderEmergencias = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Cédula</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Paciente</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>F. Ingreso</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Diagnóstico</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {emergencies.length === 0 ? (
            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay historial de emergencias</TableCell></TableRow>
          ) : emergencies.map((e) => (
            <TableRow key={e.id} hover>
              <TableCell>{e.patient?.ci || '-'}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{(e.patient?.name || '') + ' ' + (e.patient?.lastname || '')}</TableCell>
              <TableCell>{e.ingress_date ? moment(e.ingress_date).format('DD/MM/YYYY') : '-'}</TableCell>
              <TableCell>{e.diagnostic || '-'}</TableCell>
              <TableCell>
                <Chip
                  label={STATUS_LABELS[e.status]?.label || '?'}
                  size="small"
                  sx={{ bgcolor: STATUS_LABELS[e.status]?.color, color: 'white', fontSize: '0.7rem' }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderHospitalizaciones = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Cédula</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Paciente</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>F. Ingreso</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>F. Alta</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Diagnóstico</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Días</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hospitalizations.length === 0 ? (
            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay historial de hospitalización</TableCell></TableRow>
          ) : hospitalizations.map((h) => {
            const p = h.emergency?.patient || {};
            return (
              <TableRow key={h.id} hover>
                <TableCell>{p.ci || '-'}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{(p.name || '') + ' ' + (p.lastname || '')}</TableCell>
                <TableCell>{h.admission_date ? moment(h.admission_date).format('DD/MM/YYYY') : '-'}</TableCell>
                <TableCell>{h.discharge_date ? moment(h.discharge_date).format('DD/MM/YYYY') : '-'}</TableCell>
                <TableCell>{h.admission_diagnosis || h.emergency?.diagnostic || '-'}</TableCell>
                <TableCell>{h.length_of_stay_days || 0}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCitas = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Cédula</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Paciente</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Fecha</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Doctor</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Especialidad</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay historial de citas</TableCell></TableRow>
          ) : appointments.map((a) => (
            <TableRow key={a.id} hover>
              <TableCell>{a.patient?.ci || '-'}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{(a.patient?.name || '') + ' ' + (a.patient?.lastname || '')}</TableCell>
              <TableCell>{a.appointment_date ? moment(a.appointment_date).format('DD/MM/YYYY HH:mm') : '-'}</TableCell>
              <TableCell>{a.doctor?.name || '-'}</TableCell>
              <TableCell>{a.specialty?.name || a.doctor?.speciality || '-'}</TableCell>
              <TableCell>
                <Chip
                  label={a.status === 'completed' ? 'Completada' : a.status === 'cancelled' ? 'Cancelada' : a.status || '-'}
                  size="small"
                  color={a.status === 'completed' ? 'success' : a.status === 'cancelled' ? 'error' : 'default'}
                  sx={{ fontSize: '0.7rem' }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCirugias = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Cédula</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Paciente</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Tipo</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Fecha</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Hora Inicio</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Hora Fin</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Cirujano</TableCell>
            <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Resultado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {surgeries.length === 0 ? (
            <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay historial de cirugías</TableCell></TableRow>
          ) : surgeries.map((s) => (
            <TableRow key={s.id} hover>
              <TableCell>{s.patient?.ci || '-'}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{(s.patient?.name || '') + ' ' + (s.patient?.lastname || '')}</TableCell>
              <TableCell>{s.surgery_type || '-'}</TableCell>
              <TableCell>{s.surgery_date ? moment(s.surgery_date).format('DD/MM/YYYY') : '-'}</TableCell>
              <TableCell>{s.scheduled_start_time ? moment(s.scheduled_start_time).format('HH:mm') : s.actual_start_time ? moment(s.actual_start_time).format('HH:mm') : '-'}</TableCell>
              <TableCell>{s.scheduled_end_time ? moment(s.scheduled_end_time).format('HH:mm') : s.actual_end_time ? moment(s.actual_end_time).format('HH:mm') : '-'}</TableCell>
              <TableCell>{s.surgeon_name || '-'}</TableCell>
              <TableCell>{s.result || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;
    }
    switch (activeTab) {
      case 'emergencias': return renderEmergencias();
      case 'hospitalizaciones': return renderHospitalizaciones();
      case 'citas': return renderCitas();
      case 'cirugias': return renderCirugias();
      default: return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f0f4ff' }}>
      <BreadcrumbNav crumbs={[{ label: 'Historial' }]} />
      <Box sx={{ px: 2, py: 1, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1565c0', fontSize: '1rem', mb: 1 }}>
          Historial Clínico
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            placeholder="Buscar por Cédula, Nombre o Apellido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
          <TextField
            select
            size="small"
            value={selectedYear}
            onChange={handleYearChange}
            sx={{ width: 100 }}
          >
            {yearOptions.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={dateFrom}
            onChange={handleDateChange(setDateFrom)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={dateTo}
            onChange={handleDateChange(setDateTo)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 170 }}
          />
        </Stack>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', px: 2, flexShrink: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.8rem', minHeight: 36 },
            '& .Mui-selected': { color: '#1565c0', fontWeight: 700 },
            '& .MuiTabs-indicator': { bgcolor: '#1565c0', height: 3 },
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.key} label={t.label} value={t.key} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 2, pb: 2, pt: 1.5 }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Historial;
