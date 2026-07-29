import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Add, Delete, Edit, FileUpload, LockOpen } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useRooms } from '../../hooks/useApiData';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import RoomFormModal from './RoomFormModal';
import ImportModal from '../../shared/ui/import-excel-modal';

const ROOM_IMPORT_COLS = [
  { field: 'name', label: 'Nombre', required: true, aliases: ['name', 'nombre', 'sala'] },
  { field: 'area', label: 'Area', required: false, aliases: ['area', 'nombre area', 'area_name'] },
];
const ROOM_IMPORT_TMPL = [
  { name: 'Cubiculo 1', area: 'Emergencia Adultos' },
  { name: 'Cubiculo 2', area: '' },
];

const ROOM_TYPE_LABELS = {
  adulto: 'Adultos',
  pediatria: 'Pediatría',
};

const RoomsManager = () => {
  const { data: rooms, isLoading: loading, isError, error, refetch } = useRooms();
  const { show } = useSnackbar();

  const [formModal, setFormModal] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    if (isError) {
      show(error?.message || 'Error al cargar salas', 'error');
    }
  }, [isError, error, show]);

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
            <IconButton size="small" onClick={() => setFormModal(room)}>
              <Edit sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar" arrow>
            <IconButton size="small" onClick={() => handleDelete(room)} sx={{ p: 0.25, color: 'error.main' }}>
              <Delete sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
      <>
        <Tooltip title="Agregar sala" arrow>
          <IconButton size="small" color="primary" onClick={() => setFormModal({})}><Add fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Importar desde Excel" arrow>
          <IconButton size="small" color="info" onClick={() => setImportOpen(true)}><FileUpload fontSize="small" /></IconButton>
        </Tooltip>
      </>
      ),
      [],
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <MaterialReactTable key="salas" table={table} />
      {formModal && (
        <RoomFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          room={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)}
        onImported={handleSaved} sectionLabel="Salas" templateName="plantilla_salas"
        columns={ROOM_IMPORT_COLS} templateRows={ROOM_IMPORT_TMPL}
        apiImportFn={async (rows) => {
          const errors = []; let created = 0;
          for (const row of rows) {
            try { await BackendAPI.rooms.create({ name: row.name, area_name: row.area }); created++; }
            catch { errors.push({ row: row._row, error: 'Error al crear' }); }
          }
          return { created, errors };
        }}
      />
    </Box>
  );
};

export default RoomsManager;
