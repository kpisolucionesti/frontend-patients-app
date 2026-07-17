import { useCallback, useMemo, useState } from 'react';
import { Box, Chip, IconButton, Paper, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { Add, Delete, Edit, FileUpload } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import LabParameterFormModal from './LabParameterFormModal';
import LabParameterGroupFormModal from './LabParameterGroupFormModal';
import ImportExcelModal from './ImportExcelModal';

const LabParametersManager = () => {
  const { data: params, loading, refetch } = useFetch(() => BackendAPI.labParameters.getAll(), []);
  const { data: groups, loading: loadingGroups, refetch: refetchGroups } = useFetch(() => BackendAPI.labParameters.getGroups(), []);
  const { show } = useSnackbar();

  const [tab, setTab] = useState('params');
  const [paramModal, setParamModal] = useState(null);
  const [groupModal, setGroupModal] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const handleSaved = useCallback(() => {
    refetch();
    refetchGroups();
  }, [refetch, refetchGroups]);

  const handleDeleteParam = useCallback(async (p) => {
    if (!window.confirm(`Eliminar el parámetro "${p.name}"?`)) return;
    try {
      await BackendAPI.labParameters.delete(p.id);
      show('Parámetro eliminado', 'success');
      refetch();
    } catch {
      show('Error al eliminar', 'error');
    }
  }, [refetch, show]);

  const handleDeleteGroup = useCallback(async (g) => {
    if (!window.confirm(`Eliminar el grupo "${g.name}"?`)) return;
    try {
      await BackendAPI.labParameters.deleteGroup(g.id);
      show('Grupo eliminado', 'success');
      refetchGroups();
    } catch {
      show('Error al eliminar', 'error');
    }
  }, [refetchGroups, show]);

  const paramColumns = useMemo(() => [
    { header: 'Nombre', accessorKey: 'name', grow: true },
    { header: 'Unidad', accessorKey: 'unit', size: 100 },
    { header: 'Rango Ref.', accessorKey: 'reference_range', size: 130 },
    {
      header: 'Grupo',
      accessorKey: 'lab_parameter_group',
      size: 150,
      Cell: ({ cell }) => {
        const g = cell.getValue();
        return g ? <Chip label={g.name} size="small" color="info" variant="outlined" /> : '—';
      },
    },
  ], []);

  const paramTable = useMaterialReactTable({
    columns: paramColumns,
    data: params || [],
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => {
      const p = row.original;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar" arrow>
            <IconButton color="warning" size="small" onClick={() => setParamModal(p)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar" arrow>
            <IconButton color="error" size="small" onClick={() => handleDeleteParam(p)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Agregar parámetro" arrow>
            <IconButton color="primary" onClick={() => setParamModal({})}>
              <Add />
            </IconButton>
          </Tooltip>
          <Tooltip title="Importar desde Excel" arrow>
            <IconButton color="secondary" onClick={() => setImportOpen(true)}>
              <FileUpload />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      [],
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  const groupColumns = useMemo(() => [
    { header: 'Nombre', accessorKey: 'name', grow: true },
    { header: 'Descripción', accessorKey: 'description', size: 200 },
    {
      header: 'Parámetros',
      accessorKey: 'lab_parameters',
      size: 400,
      Cell: ({ cell }) => {
        const items = cell.getValue() || [];
        return (
          <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
            {items.length === 0 ? (
              <Typography variant="caption" color="text.secondary">Sin parámetros</Typography>
            ) : (
              items.map((p) => (
                <Chip key={p.id} label={p.name} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
              ))
            )}
          </Box>
        );
      },
    },
  ], []);

  const groupTable = useMaterialReactTable({
    columns: groupColumns,
    data: groups || [],
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => {
      const g = row.original;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar" arrow>
            <IconButton color="warning" size="small" onClick={() => setGroupModal(g)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar" arrow>
            <IconButton color="error" size="small" onClick={() => handleDeleteGroup(g)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Tooltip title="Agregar grupo" arrow>
          <IconButton color="primary" onClick={() => setGroupModal({})}>
            <Add />
          </IconButton>
        </Tooltip>
      ),
      [],
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loadingGroups },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 }, '& .Mui-selected': { color: '#1565c0', fontWeight: 700 } }}
          TabIndicatorProps={{ sx: { bgcolor: '#1565c0', height: 3 } }}
        >
          <Tab label="Parámetros" value="params" />
          <Tab label="Grupos" value="groups" />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', p: 1 }}>
        <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {tab === 'params' ? <MaterialReactTable table={paramTable} /> : <MaterialReactTable table={groupTable} />}
        </Paper>
      </Box>

      {paramModal && (
        <LabParameterFormModal
          open={!!paramModal}
          onClose={() => setParamModal(null)}
          param={paramModal.id ? paramModal : null}
          groups={groups}
          onSaved={handleSaved}
        />
      )}

      {groupModal && (
        <LabParameterGroupFormModal
          open={!!groupModal}
          onClose={() => setGroupModal(null)}
          group={groupModal.id ? groupModal : null}
          onSaved={handleSaved}
        />
      )}

      <ImportExcelModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={handleSaved}
      />
    </Box>
  );
};

export default LabParametersManager;
