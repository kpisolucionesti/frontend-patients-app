import { useState, useMemo, useCallback } from 'react';
import { Box, Paper, Button, ToggleButton, ToggleButtonGroup, Typography, Stack } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HistoryIcon from '@mui/icons-material/History';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import ExportModal from '../Commons/ExportModal';
import StatusChip from '../Commons/StatusChip';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';

const REPORT_TYPES = [
  { key: 'patients', label: 'Pacientes', icon: <PeopleIcon /> },
  { key: 'emergencies', label: 'Emergencias', icon: <LocalHospitalIcon /> },
  { key: 'history', label: 'Historial', icon: <HistoryIcon /> },
];

const PATIENT_COLUMNS = [
  { header: 'Cédula', accessorKey: 'ci', size: 30 },
  { header: 'Nombre', accessorFn: (row) => `${row.name || ''} ${row.lastname || ''}`.trim(), size: 120 },
  { header: 'Edad', accessorKey: 'age', size: 10 },
  { header: 'Género', accessorKey: 'gender', size: 40 },
  { header: 'F. Nacimiento', accessorKey: 'birthday', size: 80, Cell: ({ cell }) => cell.getValue() ? moment(cell.getValue()).format('DD/MM/YYYY') : '' },
];

const EMERGENCY_COLUMNS = [
  { header: 'F. Ingreso', accessorKey: 'ingress_date', size: 70, Cell: ({ cell }) => cell.getValue() ? moment(cell.getValue()).format('DD/MM/YYYY') : '' },
  { header: 'Paciente', accessorFn: (row) => `${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim(), size: 120 },
  { header: 'Cédula', accessorKey: 'patient.ci', size: 30 },
  { header: 'Edad', accessorKey: 'patient.age', size: 10 },
  { header: 'Diagnóstico', accessorKey: 'diagnostic', size: 100 },
  { header: 'Médico', accessorKey: 'primary_doctor.name', size: 80 },
  { header: 'Estado', accessorKey: 'status', size: 50, Cell: ({ cell }) => <StatusChip status={cell.getValue()} /> },
];

const HISTORY_COLUMNS = [
  { header: 'F. Ingreso', accessorKey: 'ingress_date', size: 70, Cell: ({ cell }) => cell.getValue() ? moment(cell.getValue()).format('DD/MM/YYYY') : '' },
  { header: 'Paciente', accessorFn: (row) => `${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim(), size: 120 },
  { header: 'Cédula', accessorKey: 'patient.ci', size: 30 },
  { header: 'Diagnóstico', accessorKey: 'diagnostic', size: 100 },
  { header: 'Médico', accessorKey: 'primary_doctor.name', size: 80 },
  { header: 'Estado', accessorKey: 'status', size: 50, Cell: ({ cell }) => <StatusChip status={cell.getValue()} /> },
  { header: 'F. Egreso', accessorKey: 'egress_at', size: 70, Cell: ({ cell }) => cell.getValue() ? moment(cell.getValue()).format('DD/MM/YYYY') : '-' },
];

const ReportsSection = () => {
  const [reportType, setReportType] = useState('patients');
  const [generated, setGenerated] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleTypeChange = useCallback((_, val) => {
    if (!val) return;
    setReportType(val);
    setGenerated(false);
    setStartDate(null);
    setEndDate(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (reportType === 'history' && !startDate && !endDate) {
      alert('Debe seleccionar al menos una fecha de inicio o fin');
      return;
    }
    setLoading(true);
    try {
      if (reportType === 'patients') {
        const res = await BackendAPI.patients.getAll({ per_page: 10000 });
        setData(res.data || []);
      } else if (reportType === 'emergencies') {
        const res = await BackendAPI.emergencies.getAll({ status: 1, per_page: 10000 });
        setData(res.data || []);
      } else {
        const params = { per_page: 10000 };
        if (startDate) params.from = moment(startDate).format('YYYY-MM-DD');
        if (endDate) params.to = moment(endDate).format('YYYY-MM-DD');
        const res = await BackendAPI.emergencies.getAll(params);
        setData(res.data || []);
      }
      setGenerated(true);
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [reportType, startDate, endDate]);

  const columns = useMemo(() => {
    if (reportType === 'patients') return PATIENT_COLUMNS;
    if (reportType === 'emergencies') return EMERGENCY_COLUMNS;
    return HISTORY_COLUMNS;
  }, [reportType]);

  const filename = useMemo(() => {
    if (reportType === 'patients') return 'Reporte_Pacientes';
    if (reportType === 'emergencies') return 'Reporte_Emergencias';
    return 'Reporte_Historial';
  }, [reportType]);

  const table = useMaterialReactTable({
    columns,
    data,
    ...MRT_DEFAULTS,
    enableRowActions: false,
    enableFilters: false,
    enableColumnFilters: false,
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    enableStickyFooter: true,
    state: { isLoading: loading },
    renderTopToolbarCustomActions: useCallback(
      () => generated ? <ExportModal data={data} columns={columns} filename={filename} /> : null,
      [data, columns, filename, generated],
    ),
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    muiTableBodyRowProps: {
      sx: { '&:nth-of-type(even)': { bgcolor: '#f8f9fa' } },
    },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Paper sx={{ p: 1.5, bgcolor: 'white' }}>
        <Typography variant="subtitle2" fontWeight={600} color="primary.dark" sx={{ mb: 1 }}>
          REPORTES
        </Typography>
        <Stack spacing={1}>
            <ToggleButtonGroup
              value={reportType}
              exclusive
              onChange={handleTypeChange}
              size="small"
            >
              {REPORT_TYPES.map((t) => (
                <ToggleButton key={t.key} value={t.key} sx={{ textTransform: 'none', gap: 0.5 }}>
                  {t.icon} {t.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {reportType === 'history' && (
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <DatePicker
                    format="DD/MM/YYYY"
                    label="Fecha Inicio"
                    value={startDate}
                    onChange={(v) => setStartDate(v)}
                    slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 160 } } }}
                  />
                  <DatePicker
                    format="DD/MM/YYYY"
                    label="Fecha Fin"
                    value={endDate}
                    onChange={(v) => setEndDate(v)}
                    slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 160 } } }}
                  />
                </Stack>
              </LocalizationProvider>
            )}

            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Generando...' : 'Generar Reporte'}
              </Button>
            </Box>
          </Stack>
      </Paper>

      {generated && (
        <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <MaterialReactTable table={table} />
        </Paper>
      )}
    </Box>
  );
};

export default ReportsSection;
