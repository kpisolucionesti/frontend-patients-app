import { useCallback, useMemo, useState } from 'react';
import { Box, Chip, FormControlLabel, IconButton, Paper, Switch, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { Add, Delete, Edit, FileUpload, RestoreFromTrash } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import LabParameterFormModal from './LabParameterFormModal';
import LabParameterGroupFormModal from './LabParameterGroupFormModal';
import ImportExcelModal from './ImportExcelModal';

const LabParametersManager = () => {
  const [showInactive, setShowInactive] = useState(false);
  const { data: params, loading, refetch } = useFetch(() => BackendAPI.labParameters.getAll(showInactive), [showInactive]);
  const { data: groups, loading: loadingGroups, refetch: refetchGroups } = useFetch(() => BackendAPI.labParameters.getGroups(showInactive), [showInactive]);
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
    if (!window.confirm(`Suspender el parámetro "${p.name}"?`)) return;
    try {
      await BackendAPI.labParameters.delete(p.id);
      show('Parámetro suspendido', 'success');
      refetch();
    } catch {
      show('Error al suspender', 'error');
    }
  }, [refetch, show]);

  const handleRestoreParam = useCallback(async (p) => {
    try {
      await BackendAPI.labParameters.restore(p.id);
      show('Parámetro restaurado', 'success');
      refetch();
    } catch {
      show('Error al restaurar', 'error');
    }
  }, [refetch, show]);

  const handleDeleteGroup = useCallback(async (g) => {
    if (!window.confirm(`Suspender el grupo "${g.name}"?`)) return;
    try {
      await BackendAPI.labParameters.deleteGroup(g.id);
      show('Grupo suspendido', 'success');
      refetchGroups();
    } catch {
      show('Error al suspender', 'error');
    }
  }, [refetchGroups, show]);

  const handleRestoreGroup = useCallback(async (g) => {
    try {
      await BackendAPI.labParameters.restoreGroup(g.id);
      show('Grupo restaurado', 'success');
      refetchGroups();
    } catch {
      show('Error al restaurar', 'error');
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
    {
      header: 'Activo',
      accessorKey: 'is_active',
      size: 80,
      Cell: ({ cell }) => {
        const active = cell.getValue();
        return active !== false
          ? <Chip label="Sí" size="small" color="success" variant="outlined" />
          : <Chip label="No" size="small" color="error" variant="outlined" />;
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
      const isActive = p.is_active !== false;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar" arrow>
            <IconButton color="warning" size="small" onClick={() => setParamModal(p)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          {isActive ? (
            <Tooltip title="Suspender" arrow>
              <IconButton color="error" size="small" onClick={() => handleDeleteParam(p)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Restaurar" arrow>
              <IconButton color="success" size="small" onClick={() => handleRestoreParam(p)}>
                <RestoreFromTrash fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
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
          <FormControlLabel
            control={<Switch checked={showInactive} onChange={(_, v) => setShowInactive(v)} size="small" />}
            label="Mostrar suspendidos"
            sx={{ ml: 2, '& .MuiTypography-root': { fontSize: '0.75rem' } }}
          />
        </Box>
      ),
      [showInactive],
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
      size: 200,
      Cell: ({ cell }) => {
        const items = cell.getValue() || [];
        return (
          <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
            {items.length === 0 ? (
              <Typography variant="caption" color="text.secondary">Sin parámetros</Typography>
            ) : (
              items.map((p) => (
                <Chip key={p.id} label={p.name} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }}
                  color={p.is_active === false ? 'default' : 'primary'}
                />
              ))
            )}
          </Box>
        );
      },
      grow: true,
    },
    {
      header: 'Activo',
      accessorKey: 'is_active',
      size: 80,
      Cell: ({ cell }) => {
        const active = cell.getValue();
        return active !== false
          ? <Chip label="Sí" size="small" color="success" variant="outlined" />
          : <Chip label="No" size="small" color="error" variant="outlined" />;
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
      const isActive = g.is_active !== false;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar" arrow>
            <IconButton color="warning" size="small" onClick={() => setGroupModal(g)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          {isActive ? (
            <Tooltip title="Suspender" arrow>
              <IconButton color="error" size="small" onClick={() => handleDeleteGroup(g)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Restaurar" arrow>
              <IconButton color="success" size="small" onClick={() => handleRestoreGroup(g)}>
                <RestoreFromTrash fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title="Agregar grupo" arrow>
            <IconButton color="primary" onClick={() => setGroupModal({})}>
              <Add />
            </IconButton>
          </Tooltip>
          <FormControlLabel
            control={<Switch checked={showInactive} onChange={(_, v) => setShowInactive(v)} size="small" />}
            label="Mostrar suspendidos"
            sx={{ ml: 2, '& .MuiTypography-root': { fontSize: '0.75rem' } }}
          />
        </Box>
      ),
      [showInactive],
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
        <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', '& .MuiTablePagination-root': { marginTop: 0 } }}>
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
