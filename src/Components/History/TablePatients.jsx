import React, { useCallback, useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, Chip, Collapse, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import NotesTable from './NotesTables';
import DetailsPatients from './DetailsPatients';
import StatusChip from '../Commons/StatusChip';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import ExportData from './exportDatamodal';
import HistoryDetailModal from './HistoryDetailModal';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 2, label: 'Alta Medica' },
  { value: 3, label: 'Ingresado' },
];

const TablePatients = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [applied, setApplied] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filters, setFilters] = useState({
    cedula: '',
    edad: '',
    medico: '',
    estatus: '',
  });

  const { data: emergencies, loading } = useFetch(
    () => BackendAPI.emergencies.getAll(), [],
  );

  const [detailEmergencyId, setDetailEmergencyId] = useState(null);

  const tableData = useMemo(() => {
    if (!applied) return [];
    let data = (emergencies || []).filter((r) => r.status !== 1);

    if (startDate) {
      const start = moment(startDate).format('DD/M/YYYY');
      data = data.filter((r) => moment(r.ingress_date, 'DD/M/YYYY').isSameOrAfter(moment(start, 'DD/M/YYYY')));
    }
    if (endDate) {
      const end = moment(endDate).format('DD/M/YYYY');
      data = data.filter((r) => moment(r.ingress_date, 'DD/M/YYYY').isSameOrBefore(moment(end, 'DD/M/YYYY')));
    }
    if (filters.cedula) {
      data = data.filter((r) => (r.patient?.ci || '').includes(filters.cedula));
    }
    if (filters.edad) {
      data = data.filter((r) => String(r.patient?.age || '') === filters.edad);
    }
    if (filters.medico) {
      data = data.filter((r) => (r.primary_doctor?.name || '').toLowerCase().includes(filters.medico.toLowerCase()));
    }
    if (filters.estatus !== '' && filters.estatus !== undefined) {
      data = data.filter((r) => r.status === filters.estatus);
    }

    return data.map((x) => ({
      ...x,
      ingress_date: moment(x.ingress_date, 'DD/M/YYYY').format('YYYY/MM/DD'),
    }));
  }, [emergencies, startDate, endDate, filters, applied]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setApplied(false);
  }, []);

  const handleApplyFilters = useCallback(() => {
    if (!startDate && !endDate) {
      alert('Debe seleccionar al menos una fecha de inicio o fin');
      return;
    }
    setApplied(true);
  }, [startDate, endDate]);

  const handleClearFilters = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setFilters({ cedula: '', edad: '', medico: '', estatus: '' });
    setApplied(false);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (startDate) count++;
    if (endDate) count++;
    if (filters.cedula) count++;
    if (filters.edad) count++;
    if (filters.medico) count++;
    if (filters.estatus !== '') count++;
    return count;
  }, [startDate, endDate, filters]);

  const columns = useMemo(
    () => [
      { header: 'F. Ingreso', accessorKey: 'ingress_date', enableEditing: false, minSize: 50, maxSize: 150, size: 150 },
      { header: 'Cedula', accessorKey: 'patient.ci', minSize: 30, maxSize: 150, size: 150 },
      { header: 'Paciente', accessorFn: (row) => `${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim(), grow: true, minSize: 80, maxSize: 200, size: 200 },
      { header: 'Edad', accessorKey: 'patient.age', minSize: 50, maxSize: 100, size: 100 },
      { header: 'Medico', accessorKey: 'primary_doctor.name', grow: true, minSize: 100, maxSize: 250, size: 250 },
      {
        header: 'Estatus',
        accessorKey: 'status',
        minSize: 80,
        maxSize: 100,
        size: 180,
        Cell: ({ cell }) => <StatusChip status={cell.getValue()} />,
        enableColumnOrdering: false,
        enableEditing: false,
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableRowPinning: true,
    enableExpandAll: false,
    enableFullScreenToggle: false,
    positionExpandColumn: 'last',
    editDisplayMode: 'modal',
    enableSorting: true,
    enableStickyHeader: true,
    enableHiding: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    getRowId: (row) => row.id?.toString(),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => setDetailEmergencyId(row.original.id),
      sx: { cursor: 'pointer' },
    }),
    renderTopToolbarCustomActions: useCallback(
      () => applied && (
        <Box sx={{ display: 'flex', gap: '1rem', p: '4px', alignItems: 'center' }}>
          <ExportData apiData={tableData} />
        </Box>
      ),
      [applied, tableData],
    ),
    displayColumnDefOptions: useMemo(() => ({
      'mrt-row-expand': {
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        header: 'Detalles',
        grow: true,
        size: 10,
      },
    }), []),
    renderDetailPanel: useCallback(
      ({ row }) => (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
          <DetailsPatients row={row.original} />
          <NotesTable row={row.original} />
        </Box>
      ),
      [],
    ),
    initialState: {
      pagination: { pageSize: 25 },
      density: 'compact',
      sorting: [{ id: 'ingress_date', desc: true }, { id: 'status', desc: false }],
    },
    state: { isLoading: loading && applied },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
      <Paper sx={{ p: 1.5, bgcolor: '#f0f4ff' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary.dark">
            FILTROS DE HISTORIAL
          </Typography>
          <Button size="small" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </Stack>

        <Collapse in={showFilters}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <DatePicker
                  format="DD/MM/YYYY"
                  label="Fecha Inicio"
                  value={startDate}
                  onChange={(v) => { setStartDate(v); setApplied(false); }}
                  slotProps={{ textField: { size: 'small', sx: { width: 145 } } }}
                />
                <DatePicker
                  format="DD/MM/YYYY"
                  label="Fecha Fin"
                  value={endDate}
                  onChange={(v) => { setEndDate(v); setApplied(false); }}
                  slotProps={{ textField: { size: 'small', sx: { width: 145 } } }}
                />
              </LocalizationProvider>
              <Button
                size="small"
                variant="text"
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', minWidth: 'auto' }}
              >
                {showAdvanced ? '▲' : '▼'} Filtros Avanzados
              </Button>
            </Stack>

            <Collapse in={showAdvanced}>
              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                <TextField
                  size="small" label="Cedula" value={filters.cedula} sx={{ width: 140 }}
                  onChange={({ target }) => handleFilterChange('cedula', target.value)}
                />
                <TextField
                  size="small" label="Edad" type="number" value={filters.edad} sx={{ width: 80 }}
                  onChange={({ target }) => handleFilterChange('edad', target.value)}
                />
                <TextField
                  size="small" label="Medico" value={filters.medico} sx={{ width: 170 }}
                  onChange={({ target }) => handleFilterChange('medico', target.value)}
                />
                <FormControl size="small" sx={{ width: 130 }}>
                  <InputLabel>Estatus</InputLabel>
                  <Select label="Estatus" value={filters.estatus} onChange={({ target }) => handleFilterChange('estatus', target.value)}>
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.label} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button onClick={handleClearFilters} size="small" color="error" variant="outlined" sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}>Limpiar</Button>
              </Stack>
            </Collapse>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={handleApplyFilters} size="small" variant="contained" color="success">Aplicar Filtros</Button>
            </Stack>
          </Stack>
        </Collapse>
      </Paper>

      {!applied ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Aplique los filtros para visualizar los datos del historial.
          </Typography>
        </Paper>
      ) : (
        <MaterialReactTable table={table} />
      )}
      {detailEmergencyId && (
        <HistoryDetailModal
          open={!!detailEmergencyId}
          emergencyId={detailEmergencyId}
          onClose={() => setDetailEmergencyId(null)}
        />
      )}
    </Box>
  );
};

export default TablePatients;
