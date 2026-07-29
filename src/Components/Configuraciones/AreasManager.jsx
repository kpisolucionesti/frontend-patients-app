import React, { useCallback, useMemo, useState } from 'react';
import { Box, Chip, IconButton, Paper, Tooltip } from '@mui/material';
import { Add, Delete, Edit, FileUpload } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import ImportModal from '../../shared/ui/import-excel-modal';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import AreaFormModal from './AreaFormModal';

const AREA_IMPORT_COLS = [
  { field: 'name', label: 'Nombre', required: true, aliases: ['name', 'nombre', 'area'] },
  { field: 'room_type', label: 'Tipo', required: false, aliases: ['room_type', 'tipo', 'type'] },
  { field: 'description', label: 'Descripcion', required: false, aliases: ['description', 'descripcion'] },
];
const AREA_IMPORT_TMPL = [
  { name: 'Emergencia Adultos', room_type: 'adulto', description: 'Area de emergencia adultos' },
  { name: 'Emergencia Pediatria', room_type: 'pediatria', description: '' },
];


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
  const [importOpen, setImportOpen] = useState(false);

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
            <IconButton size="small" onClick={() => setFormModal(area)}>
              <Edit sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar" arrow>
            <IconButton size="small" onClick={() => handleDelete(area)} sx={{ p: 0.25, color: 'error.main' }}>
              <Delete sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Agregar area" arrow>
            <IconButton size="small" color="primary" onClick={() => setFormModal({})}><Add fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Importar desde Excel" arrow>
            <IconButton size="small" color="info" onClick={() => setImportOpen(true)}><FileUpload fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      ),
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
        <AreaFormModal open={!!formModal} onClose={() => setFormModal(null)}
          area={formModal.id ? formModal : null} onSaved={handleSaved} />
      )}
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)}
        onImported={handleSaved} sectionLabel="Areas" templateName="plantilla_areas"
        columns={AREA_IMPORT_COLS} templateRows={AREA_IMPORT_TMPL}
        apiImportFn={async (rows) => {
          const errors = []; let created = 0;
          for (const row of rows) {
            try { await BackendAPI.areas.create({ name: row.name, room_type: row.room_type || null, description: row.description }); created++; }
            catch { errors.push({ row: row._row, error: 'Error al crear' }); }
          }
          return { created, errors };
        }}
      />
    </Box>
  );
};

export default AreasManager;
