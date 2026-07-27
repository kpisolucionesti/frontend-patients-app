import React, { useCallback, useMemo, useState } from 'react';
import { Box, IconButton, Paper, Tooltip } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import SpecialtyFormModal from './SpecialtyFormModal';

const SpecialtiesManager = () => {
  const { data: specialties, loading, refetch } = useFetch(
    () => BackendAPI.specialties.getAll(), [],
  );
  const { show } = useSnackbar();

  const [formModal, setFormModal] = useState(null);

  const handleSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDelete = useCallback(async (specialty) => {
    if (!window.confirm(`Eliminar la especialidad "${specialty.name}"?`)) return;
    try {
      await BackendAPI.specialties.delete(specialty.id);
      show('Especialidad eliminada', 'success');
      refetch();
    } catch (err) {
      show(err.response?.data?.error || 'Error al eliminar especialidad', 'error');
    }
  }, [refetch, show]);

  const columns = useMemo(() => [
    { header: 'Nombre', accessorKey: 'name', grow: true },
    {
      header: 'Médicos',
      accessorKey: 'doctors_count',
      size: 100,
      Cell: ({ cell }) => cell.getValue() || 0,
    },
    {
      header: 'Activo',
      accessorKey: 'is_active',
      size: 80,
      Cell: ({ cell }) => cell.getValue() ? 'Sí' : 'No',
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: specialties || [],
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => {
      const specialty = row.original;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar" arrow>
            <IconButton color="warning" size="small" onClick={() => setFormModal(specialty)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar" arrow>
            <IconButton color="error" size="small" onClick={() => handleDelete(specialty)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Tooltip title="Agregar especialidad" arrow>
          <IconButton color="primary" onClick={() => setFormModal({})}>
            <Add />
          </IconButton>
        </Tooltip>
      ),
      [],
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Paper sx={{ bgcolor: 'background.paper', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', '& .MuiTablePagination-root': { marginTop: 0 } }}>
        <MaterialReactTable table={table} />
      </Paper>
      {formModal && (
        <SpecialtyFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          specialty={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
    </Box>
  );
};

export default SpecialtiesManager;
