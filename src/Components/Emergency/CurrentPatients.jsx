import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Paper } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useFetch } from '../../hooks/useFetch';
import { CLASSIFICATION_OPTIONS } from '../../constants';
import CaseDetailModal from './CaseDetailModal';
import AddEmergencyModal from './AddEmergencyModal';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';

const STATUS_STYLES = {
  0: { label: 'Esperando', color: '#fff3e0', textColor: '#e65100', chipColor: 'warning' },
  1: { label: 'Atendido', color: '#e3f2fd', textColor: '#1565c0', chipColor: 'info' },
  2: { label: 'Alta Médica', color: '#e8f5e9', textColor: '#2e7d32', chipColor: 'success' },
  3: { label: 'Ingreso a Hospitalización', color: '#f3e5f5', textColor: '#6a1b9a', chipColor: 'secondary' },
  4: { label: 'Anulada', color: '#eeeeee', textColor: '#616161', chipColor: 'default' },
  5: { label: 'Fallecido', color: '#212121', textColor: '#ffffff', chipColor: 'default' },
};

const CurrentPatients = ({ onSelectEmergency, embedded, refreshKey, searchQuery, onCountChange, onEmergenciesChange }) => {
  const [detailEmergencyId, setDetailEmergencyId] = useState(null);
  const { data, loading, error, refetch } = useFetch(
    () => {
      const params = { status: 1, per_page: 200 };
      if (searchQuery) params.q = searchQuery;
      return BackendAPI.emergencies.getAll(params);
    },
    [refreshKey, searchQuery],
  );

  const emergencies = useMemo(() => data?.data || [], [data]);

  useEffect(() => {
    if (onCountChange) onCountChange(emergencies.length);
    if (onEmergenciesChange) onEmergenciesChange(emergencies);
  }, [emergencies.length, emergencies, onCountChange, onEmergenciesChange]);

  const permissions = usePermissions();

  const canCreateEmergency = useMemo(() => permissions.includes('emergencia.create'), [permissions]);

  const handleRowClick = useCallback((row) => {
    if (embedded && onSelectEmergency) {
      onSelectEmergency(row.original);
    } else {
      setDetailEmergencyId(row.original.id);
    }
  }, [embedded, onSelectEmergency]);

  const handleCloseDetail = useCallback(() => {
    setDetailEmergencyId(null);
  }, []);

  const columns = useMemo(
    () => [
      { header: 'Cédula', accessorKey: 'patient.ci', size: 30 },
      {
        header: 'Paciente',
        accessorFn: (row) => `${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim(),
        size: 100,
      },
      { header: 'Edad', accessorKey: 'patient.age', size: 10 },
      { header: 'Médico Tratante', accessorKey: 'primary_doctor.name', size: 90 },
      { header: 'Diagnóstico', accessorKey: 'diagnostic', grow: true },
      { header: 'Estado', accessorKey: 'status', size: 50,
        Cell: ({ cell }) => {
          const st = STATUS_STYLES[cell.getValue()] || {};
          return <Chip label={st.label || '?'} color={st.chipColor || 'default'} size="small" variant="outlined" />;
        },
      },
      { header: '', accessorKey: 'updated_at', size: 10,
        Cell: ({ cell }) => {
          const updated = cell.getValue();
          if (!updated) return null;
          const diff = Date.now() - new Date(updated).getTime();
          return diff < 3600000
            ? <Chip label="Nuevo" size="small" color="info" sx={{ fontSize: '0.6rem', height: 20 }} />
            : null;
        },
      },
      { header: 'Clasificación', accessorKey: 'classification', size: 50,
        Cell: ({ cell }) => {
          const cls = CLASSIFICATION_OPTIONS.find((c) => c.key === cell.getValue());
          return cls
            ? <Chip label={cls.label} size="small" sx={{ bgcolor: cls.color, color: 'white', fontWeight: 600, fontSize: '0.65rem' }} />
            : null;
        },
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: emergencies,
    ...MRT_DEFAULTS,
    enableRowActions: false,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enablePagination: emergencies.length > 15,
    enableBottomToolbar: emergencies.length > 15,
    enableTopToolbar: !embedded,
    getRowId: (row) => row.id?.toString(),
    muiTableBodyRowProps: ({ row }) => {
      const st = STATUS_STYLES[row.original.status] || {};
      return {
        onClick: () => handleRowClick(row),
        sx: {
          cursor: 'pointer',
          bgcolor: st.color || 'inherit',
          '&:hover': { bgcolor: '#f5f5f5' },
          '&:nth-of-type(even)': { bgcolor: st.color ? `${st.color}dd` : '#fafafa' },
        },
      };
    },
    enableStickyFooter: true,
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    muiTableHeadCellProps: {
      sx: { bgcolor: '#1565c0', color: 'white', fontWeight: 600, fontSize: '0.75rem' },
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {!embedded && <AddEmergencyModal onEmergencyCreated={refetch} disabled={!canCreateEmergency} />}
        </div>
      ),
      [refetch, canCreateEmergency, embedded],
    ),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {error && (
        <Box sx={{ p: 1 }}>
          <Alert severity="error" onClose={refetch}>
            Error al cargar emergencias. <strong>Haz clic aquí para reintentar.</strong>
          </Alert>
        </Box>
      )}
      <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <MaterialReactTable table={table} />
      </Paper>
      {detailEmergencyId && (
          <CaseDetailModal
            open={!!detailEmergencyId}
            emergencyId={detailEmergencyId}
            onClose={handleCloseDetail}
            onDataChange={refetch}
          />
      )}
    </Box>
  );
};

export default CurrentPatients;
