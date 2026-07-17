import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Chip, IconButton, Paper, TextField, Tooltip } from '@mui/material';
import { Edit, History, Search } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';
import EditPatientData from './editPatientDataModal';
import PatientHistoryModal from './PatientHistoryModal';
import ExportModal from '../Commons/ExportModal';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';

const PatientsList = ({ onSelectPatient, embedded }) => {
  const permissions = usePermissions();
  const [editPatient, setEditPatient] = useState(null);
  const [historyPatient, setHistoryPatient] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPagination({ pageIndex: 0, pageSize: 25 });
    setFetchTrigger((t) => t + 1);
  }, [debouncedSearch]);

  const fetchData = useCallback(async (page = 1, pageSize = 25) => {
    setLoading(true);
    try {
      const params = { page, per_page: pageSize };
      if (debouncedSearch) params.q = debouncedSearch;
      const res = await BackendAPI.patients.getAll(params);
      setTableData(res.data || []);
      setTotal(res.total || 0);
    } catch {
      setTableData([]);
      setTotal(0);
    }
    setLoading(false);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData(pagination.pageIndex + 1, pagination.pageSize);
  }, [pagination.pageIndex, pagination.pageSize, fetchTrigger, fetchData, debouncedSearch]);

  const handlePatientSaved = useCallback(() => {
    setFetchTrigger((t) => t + 1);
  }, []);

  const columns = useMemo(
    () => [
      { header: 'Cedula', accessorKey: 'ci', size: 30 },
      {
        header: 'Apellido', accessorKey: 'lastname', size: 100,
        Cell: ({ cell, row }) => row.original.disabled
          ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {cell.getValue()}
              <Chip label="Fallecido" size="small" sx={{ bgcolor: '#212121', color: 'white', fontWeight: 600, height: 18, fontSize: '0.6rem' }} />
            </Box>
          : cell.getValue(),
      },
      { header: 'Nombre', accessorKey: 'name', size: 100 },
      { header: 'Edad', accessorKey: 'age', size: 10 },
      { header: 'Genero', accessorKey: 'gender', size: 50 },
      { header: 'F. Nacimiento', accessorKey: 'birthday', size: 80, Cell: ({ cell }) => cell.getValue() ? moment(cell.getValue(), 'YYYY-MM-DD').format('DD-MM-YYYY') : '' },
      { header: 'Representante', accessorKey: 'representante', size: 120 },
      { header: 'Ult. Visita', accessorKey: 'last_visit_date', size: 80, Cell: ({ cell }) => cell.getValue() ? moment(cell.getValue(), 'YYYY-MM-DD').format('DD-MM-YYYY') : '-' },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    rowCount: total,
    ...MRT_DEFAULTS,
    enableFilters: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    manualPagination: true,
    enableRowActions: !embedded,
    positionPagination: 'top',
    onPaginationChange: setPagination,
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar por Cédula, Nombre o Apellido"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <Search sx={{ mr: 0.5, color: 'action.active', fontSize: 20 }} />,
              },
            }}
            sx={{ minWidth: 320, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
          />
          <ExportModal data={tableData} columns={columns} filename="Pacientes" />
        </Box>
      ),
      [searchQuery, tableData, columns],
    ),
    renderRowActions: !embedded ? ({ row }) => (
      <>
        {permissions.includes('pacientes.edit') && (
          <Tooltip title="Editar datos del paciente" arrow>
            <IconButton color="warning" size="small" onClick={() => setEditPatient(row.original)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Ver historial de casos" arrow>
          <IconButton color="info" size="small" onClick={() => setHistoryPatient(row.original)}>
            <History fontSize="small" />
          </IconButton>
        </Tooltip>
      </>
    ) : undefined,
    muiTableBodyRowProps: embedded && onSelectPatient ? ({ row }) => ({
      onClick: () => onSelectPatient(row.original),
      sx: { cursor: 'pointer' },
    }) : undefined,
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading, pagination },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', '& .MuiTablePagination-root': { marginTop: 0 } }}>
        <MaterialReactTable table={table} />
      </Paper>
      {editPatient && (
        <EditPatientData
          open={!!editPatient}
          onClose={() => setEditPatient(null)}
          patient={editPatient}
          onSaved={handlePatientSaved}
        />
      )}
      {historyPatient && (
        <PatientHistoryModal
          open={!!historyPatient}
          onClose={() => setHistoryPatient(null)}
          patient={historyPatient}
        />
      )}
    </Box>
  );
};

export default PatientsList;
