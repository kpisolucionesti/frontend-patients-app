import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, Chip, Collapse, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import NotesTable from './NotesTable';
import DetailsPatients from './DetailsPatients';
import StatusChip from '../Commons/StatusChip';
import ExportModal from '../Commons/ExportModal';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import HistoryDetailModal from './HistoryDetailModal';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 2, label: 'Alta Médica' },
  { value: 3, label: 'Ingreso a Hospitalización' },
];

const TablePatients = ({ onSelectEmergency, embedded }) => {
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

  const [detailEmergencyId, setDetailEmergencyId] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [loading, setLoading] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const fetchData = useCallback(async (page = 1, pageSize = 25) => {
    setLoading(true);
    const params = {
      page,
      per_page: pageSize,
    };
    if (startDate) params.from = moment(startDate).format('YYYY-MM-DD');
    if (endDate) params.to = moment(endDate).format('YYYY-MM-DD');
    if (filters.cedula && filters.medico) {
      params.q = filters.medico;
    } else if (filters.cedula) {
      params.q = filters.cedula;
    } else if (filters.medico) {
      params.q = filters.medico;
    }
    if (filters.estatus !== '') params.status = filters.estatus;

    try {
      const res = await BackendAPI.emergencies.getAll(params);
      setTableData((res.data || []).map((x) => ({
        ...x,
        ingress_date: x.ingress_date,
      })));
      setTotal(res.total || 0);
    } catch {
      setTableData([]);
      setTotal(0);
    }
    setLoading(false);
  }, [startDate, endDate, filters]);

  useEffect(() => {
    if (!applied) {
      setTableData([]);
      setTotal(0);
      return;
    }
    fetchData(pagination.pageIndex + 1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied, pagination.pageIndex, pagination.pageSize, fetchTrigger]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    if (!startDate && !endDate) {
      alert('Debe seleccionar al menos una fecha de inicio o fin');
      return;
    }
    setApplied(true);
    setFetchTrigger((t) => t + 1);
    setPagination({ pageIndex: 0, pageSize: 25 });
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
    rowCount: total,
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
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    manualPagination: true,
    getRowId: (row) => row.id?.toString(),
    muiTableBodyRowProps: embedded && onSelectEmergency ? ({ row }) => ({
      onClick: () => onSelectEmergency(row.original),
      sx: { cursor: 'pointer' },
    }) : ({ row }) => ({
      onClick: () => setDetailEmergencyId(row.original.id),
      sx: { cursor: 'pointer' },
    }),
    renderTopToolbarCustomActions: useCallback(
      () => applied && (
        <Box sx={{ display: 'flex', gap: '1rem', p: '4px', alignItems: 'center' }}>
          <ExportModal data={tableData} filename="Historial_Clinico" />
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
    onPaginationChange: setPagination,
    initialState: {
      pagination: { pageSize: 25 },
      density: 'compact',
      sorting: [{ id: 'ingress_date', desc: true }, { id: 'status', desc: false }],
    },
    state: { isLoading: loading && applied, pagination },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, flex: 1, minHeight: 0 }}>
      <Paper sx={{ p: 1.5, bgcolor: 'white' }}>
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
                  onChange={(v) => setStartDate(v)}
                  slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 145 } } }}
                />
                <DatePicker
                  format="DD/MM/YYYY"
                  label="Fecha Fin"
                  value={endDate}
                  onChange={(v) => setEndDate(v)}
                  slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 145 } } }}
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
                  variant="standard"
                  size="small" label="Cedula" value={filters.cedula} sx={{ width: 140 }}
                  onChange={({ target }) => handleFilterChange('cedula', target.value)}
                />
                <TextField
                  variant="standard"
                  size="small" label="Edad" type="number" value={filters.edad} sx={{ width: 80 }}
                  onChange={({ target }) => handleFilterChange('edad', target.value)}
                />
                <TextField
                  variant="standard"
                  size="small" label="Medico" value={filters.medico} sx={{ width: 170 }}
                  onChange={({ target }) => handleFilterChange('medico', target.value)}
                />
                <FormControl size="small" sx={{ width: 130 }}>
                  <InputLabel>Estatus</InputLabel>
                  <Select variant="standard" label="Estatus" value={filters.estatus} onChange={({ target }) => handleFilterChange('estatus', target.value)}>
                    {STATUS_OPTIONS.map((opt) => (
                      <MenuItem key={opt.label} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button onClick={handleClearFilters} size="small" color="error" variant="outlined" sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}>Limpiar</Button>
              </Stack>
            </Collapse>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={handleApplyFilters} size="small" variant="outlined" color="success">Aplicar Filtros</Button>
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
        <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', '& .MuiTablePagination-root': { marginTop: 0 } }}>
          <MaterialReactTable table={table} />
        </Paper>
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
