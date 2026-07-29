import React, { useCallback, useMemo, useState } from 'react';
import { Box, Button, IconButton, Paper, Tooltip, Typography } from '@mui/material';
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
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Editar" arrow>
            <IconButton size="small" onClick={() => setFormModal(specialty)} sx={{ p: 0.25 }}>
              <Edit sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar" arrow>
            <IconButton size="small" onClick={() => handleDelete(specialty)} sx={{ p: 0.25, color: 'error.main' }}>
              <Delete sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Button size="small" variant="outlined" startIcon={<Add sx={{ fontSize: 16 }} />}
          onClick={() => setFormModal({})} sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}>
          Agregar
        </Button>
      ),
      [],
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ px: 2, py: 1.25, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem' }}>Especialidades</Typography>
      </Box>
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
