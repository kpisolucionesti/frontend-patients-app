import React, { useCallback, useMemo, useState } from 'react';
import { Box, IconButton, Paper, Tooltip } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import DisplayFormModal from './DisplayFormModal';

const DisplaysManager = () => {
  const { data: displays, loading, refetch } = useFetch(
    () => BackendAPI.appointmentDisplays.getAll(), [],
  );
  const { show } = useSnackbar();

  const [formModal, setFormModal] = useState(null);

  const handleSaved = useCallback(() => { refetch(); }, [refetch]);

  const handleDelete = useCallback(async (display) => {
    if (!window.confirm(`Eliminar la pantalla "${display.name}"?`)) return;
    try {
      await BackendAPI.appointmentDisplays.delete(display.id);
      show('Pantalla eliminada', 'success');
      refetch();
    } catch (err) {
      show(err.response?.data?.error || 'Error al eliminar pantalla', 'error');
    }
  }, [refetch, show]);

  const columns = useMemo(() => [
    { header: 'Nombre', accessorKey: 'name', grow: true },
    { header: 'Ubicación', accessorKey: 'location', size: 150 },
    { header: 'Especialidad', accessorKey: 'specialty.name', size: 150 },
    {
      header: 'URL',
      accessorKey: 'public_id',
      size: 250,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        const url = window.location.origin + '/display/' + val;
        return (
          <span
            style={{ cursor: 'pointer', color: '#1565c0', textDecoration: 'underline', fontSize: '0.75rem' }}
            onClick={() => { navigator.clipboard?.writeText(url); }}
            title="Click para copiar"
          >
            {url}
          </span>
        );
      },
    },
    {
      header: 'Activo',
      accessorKey: 'is_active',
      size: 70,
      Cell: ({ cell }) => cell.getValue() ? 'Sí' : 'No',
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: displays || [],
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Editar" arrow>
          <IconButton color="warning" size="small" onClick={() => setFormModal(row.original)}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar" arrow>
          <IconButton color="error" size="small" onClick={() => handleDelete(row.original)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: useCallback(() => (
      <Tooltip title="Agregar pantalla" arrow>
        <IconButton color="primary" onClick={() => setFormModal({})}>
          <Add />
        </IconButton>
      </Tooltip>
    ), []),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', '& .MuiTablePagination-root': { marginTop: 0 } }}>
        <MaterialReactTable table={table} />
      </Paper>
      {formModal && (
        <DisplayFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          display={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
    </Box>
  );
};

export default DisplaysManager;
