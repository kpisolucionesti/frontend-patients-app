import React, { useCallback, useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Grid, Box } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import NotesTable from './NotesTables';
import DetailsPatients from './DetailsPatients';
import StatusChip from '../Commons/StatusChip';
import moment from 'moment';
import ExportData from './exportDatamodal';

const TablePatients = () => {
  const { data: emergencies, loading } = useFetch(
    () => BackendAPI.emergencies.getAll(), [],
  );

  const tableData = useMemo(
    () => (emergencies || [])
      .filter((r) => r.status !== 1)
      .map((x) => ({
        ...x,
        ingress_date: moment(x.ingress_date, 'DD/M/YYYY').format('YYYY/MM/DD'),
      })),
    [emergencies],
  );

  const columns = useMemo(
    () => [
      { header: 'F. Ingreso', accessorKey: 'ingress_date', enableEditing: false, minSize: 50, maxSize: 150, size: 150 },
      { header: 'Cedula', accessorKey: 'patient.ci', minSize: 30, maxSize: 150, size: 150 },
      { header: 'Paciente', accessorKey: 'patient.name', grow: true, minSize: 80, maxSize: 200, size: 200 },
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
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
          <ExportData apiData={tableData} />
        </Box>
      ),
      [tableData],
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
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <DetailsPatients row={row.original} />
          </Grid>
          <Grid item xs={8}>
            <NotesTable row={row.original} />
          </Grid>
        </Grid>
      ),
      [],
    ),
    initialState: {
      pagination: { pageSize: 25 },
      density: 'compact',
      sorting: [{ id: 'ingress_date', desc: true }, { id: 'status', desc: false }],
    },
    state: { isLoading: loading },
  });

  return <MaterialReactTable table={table} />;
};

export default TablePatients;
