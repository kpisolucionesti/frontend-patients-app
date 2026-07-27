import React, { useCallback, useMemo, useState } from 'react';
import { Box, Chip, IconButton, Paper, Tooltip } from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import AreaFormModal from './AreaFormModal';

const ROOM_TYPE_LABELS = {
  adulto: 'Adultos',
  pediatria: 'Pediatría',
  quirofano: 'Quirófano',
  hospitalizacion: 'Hospitalización',
  uci: 'UCI',
};

const AreasManager = () => {
  const { data: areas, loading, refetch } = useFetch(
    () => BackendAPI.areas.getAll(), [],
  );
  const { show } = useSnackbar();

  const [formModal, setFormModal] = useState(null);

  const handleSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDelete = useCallback(async (area) => {
    if (!window.confirm(`Eliminar el área "${area.name}"?`)) return;
    try {
      await BackendAPI.areas.delete(area.id);
      show('Área eliminada', 'success');
      refetch();
    } catch (err) {
      show(err.response?.data?.error || 'Error al eliminar área', 'error');
    }
  }, [refetch, show]);

  const columns = useMemo(() => [
    {
      header: 'Nombre',
      accessorKey: 'name',
      grow: true,
    },
    {
      header: 'Tipo',
      accessorKey: 'room_type',
      size: 120,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        return val ? (
          <Chip label={ROOM_TYPE_LABELS[val] || val} size="small" color={val === 'pediatria' ? 'info' : 'default'} />
        ) : (
          <Chip label="Sin restricción" size="small" variant="outlined" />
        );
      },
    },
    {
      header: 'Salas',
      accessorKey: 'rooms_count',
      size: 80,
      Cell: ({ cell }) => cell.getValue() || 0,
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: areas || [],
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => {
      const area = row.original;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar" arrow>
            <IconButton color="warning" size="small" onClick={() => setFormModal(area)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar" arrow>
            <IconButton color="error" size="small" onClick={() => handleDelete(area)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Tooltip title="Agregar área" arrow>
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
        <AreaFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          area={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
    </Box>
  );
};

export default AreasManager;
