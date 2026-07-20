import React, { useCallback, useMemo, useState } from 'react';
import { Box, Chip, IconButton, Paper, Tooltip } from '@mui/material';
import { Add, Delete, Edit, LockOpen } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import RoomFormModal from './RoomFormModal';

const ROOM_TYPE_LABELS = {
  adulto: 'Adultos',
  pediatria: 'Pediatría',
};

const RoomsManager = () => {
  const { data: rooms, loading, refetch } = useFetch(
    () => BackendAPI.rooms.getAll(), [],
  );
  const { show } = useSnackbar();

  const [formModal, setFormModal] = useState(null);

  const handleSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDelete = useCallback(async (room) => {
    if (!window.confirm(`Eliminar la sala "${room.name}"?`)) return;
    try {
      await BackendAPI.rooms.delete(room.id);
      show('Sala eliminada', 'success');
      refetch();
    } catch (err) {
      show(err.response?.data?.error || 'Error al eliminar sala', 'error');
    }
  }, [refetch, show]);

  const handleFree = useCallback(async (room) => {
    if (!window.confirm(`Liberar la sala "${room.name}"?`)) return;
    try {
      await BackendAPI.rooms.update({ ...room, patient_id: null });
      show(`Sala "${room.name}" liberada`, 'success');
      refetch();
    } catch (err) {
      show(err.response?.data?.error || 'Error al liberar sala', 'error');
    }
  }, [refetch, show]);

  const columns = useMemo(() => [
    {
      header: 'Nombre',
      accessorKey: 'name',
      grow: true,
    },
    {
      header: 'Área',
      accessorKey: 'area_name',
      size: 180,
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
      header: 'Estado',
      accessorKey: 'patient_id',
      size: 120,
      Cell: ({ cell }) => {
        const occupied = !!cell.getValue();
        return occupied ? (
          <Chip label="Ocupado" color="error" size="small" />
        ) : (
          <Chip label="Disponible" color="success" size="small" />
        );
      },
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: rooms || [],
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => {
      const room = row.original;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {room.patient_id && (
            <Tooltip title="Liberar cama" arrow>
              <IconButton color="success" size="small" onClick={() => handleFree(room)}>
                <LockOpen fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Editar" arrow>
            <IconButton color="warning" size="small" onClick={() => setFormModal(room)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar" arrow>
            <IconButton color="error" size="small" onClick={() => handleDelete(room)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Tooltip title="Agregar sala" arrow>
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
      <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', '& .MuiTablePagination-root': { marginTop: 0 } }}>
        <MaterialReactTable table={table} />
      </Paper>
      {formModal && (
        <RoomFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          room={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
    </Box>
  );
};

export default RoomsManager;
