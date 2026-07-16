import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useFetch } from '../../hooks/useFetch';
import CaseDetailModal from './CaseDetailModal';
import AddEmergencyModal from './AddEmergencyModal';

const CurrentPatients = () => {
  const [detailEmergencyId, setDetailEmergencyId] = useState(null);
  const { data, loading, error, refetch } = useFetch(
    () => BackendAPI.emergencies.getAll({ status: 1, per_page: 200 }), [],
  );

  const emergencies = useMemo(() => data?.data || [], [data]);

  const permissions = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user_permissions') || '[]'); }
    catch { return []; }
  }, []);

  const canCreateEmergency = useMemo(() => permissions.includes('emergencia.create'), [permissions]);

  const handleRowClick = useCallback((row) => {
    setDetailEmergencyId(row.original.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailEmergencyId(null);
  }, []);

  const columns = useMemo(
    () => [
      { header: 'Cedula', accessorKey: 'patient.ci', size: 30 },
      {
        header: 'Paciente',
        accessorFn: (row) => `${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim(),
        size: 100,
      },
      { header: 'Edad', accessorKey: 'patient.age', size: 10 },
      { header: 'Medico Tratante', accessorKey: 'primary_doctor.name', size: 90 },
      { header: 'Diagnostico', accessorKey: 'diagnostic', grow: true },
      { header: 'Plan', accessorKey: 'treatment', size: 80 },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: emergencies,
    layoutMode: 'grid',
    enableEditing: false,
    enableFullScreenToggle: false,
    enableSorting: true,
    enableStickyHeader: true,
    enableHiding: false,
    enableGlobalFilter: true,
    enableDensityToggle: false,
    enableRowActions: false,
    getRowId: (row) => row.id?.toString(),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => handleRowClick(row),
      sx: { cursor: 'pointer' },
    }),
    renderTopToolbarCustomActions: useCallback(
      () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <AddEmergencyModal onEmergencyCreated={refetch} disabled={!canCreateEmergency} />
        </div>
      ),
      [refetch, canCreateEmergency, emergencies, columns],
    ),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <>
      {error && (
        <Box sx={{ p: 1 }}>
          <Alert severity="error" onClose={refetch}>
            Error al cargar emergencias. <strong>Haz clic aqui para reintentar.</strong>
          </Alert>
        </Box>
      )}
      <MaterialReactTable table={table} />
      {detailEmergencyId && (
          <CaseDetailModal
            open={!!detailEmergencyId}
            emergencyId={detailEmergencyId}
            onClose={handleCloseDetail}
            onDataChange={refetch}
          />
      )}
    </>
  );
};

export default CurrentPatients;
