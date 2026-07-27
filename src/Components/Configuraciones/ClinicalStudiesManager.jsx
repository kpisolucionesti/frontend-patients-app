import { useCallback, useMemo, useState } from 'react';
import { Box, Chip, FormControlLabel, IconButton, Switch, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { Add, Delete, Edit, FileUpload, RestoreFromTrash } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import LabParameterFormModal from './LabParameterFormModal';
import LabParameterGroupFormModal from './LabParameterGroupFormModal';
import ClinicalStudyClassificationFormModal from './ClinicalStudyClassificationFormModal';
import ImportExcelModal from './ImportExcelModal';

const ClinicalStudiesManager = () => {
  const [showInactive, setShowInactive] = useState(false);
  const { data: params, loading, refetch } = useFetch(() => BackendAPI.labParameters.getAll(showInactive), [showInactive]);
  const { data: groups, loading: loadingGroups, refetch: refetchGroups } = useFetch(() => BackendAPI.labParameters.getGroups(showInactive), [showInactive]);
  const { data: classifications, loading: loadingClasses, refetch: refetchClasses } = useFetch(() => BackendAPI.clinicalStudyClassifications.getAll(showInactive), [showInactive]);
  const { show } = useSnackbar();

  const [tab, setTab] = useState('params');
  const [paramModal, setParamModal] = useState(null);
  const [groupModal, setGroupModal] = useState(null);
  const [classModal, setClassModal] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const handleSaved = useCallback(() => {
    refetch();
    refetchGroups();
    refetchClasses();
  }, [refetch, refetchGroups, refetchClasses]);

  const handleDeleteParam = useCallback(async (p) => {
    if (!window.confirm(`Suspender el parámetro "${p.name}"?`)) return;
    try {
      await BackendAPI.labParameters.delete(p.id);
      show('Parámetro suspendido', 'success');
      refetch();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al suspender';
      show(msg, 'error');
    }
  }, [refetch, show]);

  const handleRestoreParam = useCallback(async (p) => {
    try {
      await BackendAPI.labParameters.restore(p.id);
      show('Parámetro restaurado', 'success');
      refetch();
    } catch { show('Error al restaurar', 'error'); }
  }, [refetch, show]);

  const handleDeleteGroup = useCallback(async (g) => {
    if (!window.confirm(`Suspender el grupo "${g.name}"?`)) return;
    try {
      await BackendAPI.labParameters.deleteGroup(g.id);
      show('Grupo suspendido', 'success');
      refetchGroups();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al suspender';
      show(msg, 'error');
    }
  }, [refetchGroups, show]);

  const handleRestoreGroup = useCallback(async (g) => {
    try {
      await BackendAPI.labParameters.restoreGroup(g.id);
      show('Grupo restaurado', 'success');
      refetchGroups();
    } catch { show('Error al restaurar', 'error'); }
  }, [refetchGroups, show]);

  const handleDeleteClass = useCallback(async (c) => {
    if (!window.confirm(`Suspender la clasificación "${c.name}"?`)) return;
    try {
      await BackendAPI.clinicalStudyClassifications.delete(c.id);
      show('Clasificación suspendida', 'success');
      refetchClasses();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al suspender';
      show(msg, 'error');
    }
  }, [refetchClasses, show]);

  const handleRestoreClass = useCallback(async (c) => {
    try {
      await BackendAPI.clinicalStudyClassifications.restore(c.id);
      show('Clasificación restaurada', 'success');
      refetchClasses();
    } catch { show('Error al restaurar', 'error'); }
  }, [refetchClasses, show]);

  const paramColumns = useMemo(() => [
    { header: 'Nombre', accessorKey: 'name', grow: true },
    { header: 'Unidad', accessorKey: 'unit', size: 100 },
    { header: 'Rango Ref.', accessorKey: 'reference_range', size: 130 },
    {
      header: 'Clasificación',
      accessorKey: 'clinical_study_classification',
      size: 150,
      Cell: ({ cell }) => {
        const c = cell.getValue();
        return c ? <Chip label={c.name} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: c.color || '#999', color: 'white' }} /> : '—';
      },
    },
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
    initialState: { pagination: { pageSize: 50 }, density: 'compact' },
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
    initialState: { pagination: { pageSize: 50 }, density: 'compact' },
    state: { isLoading: loadingGroups },
  });

  const classColumns = useMemo(() => [
    { header: 'Nombre', accessorKey: 'name', grow: true },
    { header: 'Clave', accessorKey: 'key', size: 120 },
    {
      header: 'Color',
      accessorKey: 'color',
      size: 80,
      Cell: ({ cell }) => {
        const c = cell.getValue();
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                bgcolor: c || '#999',
                border: '2px solid',
                borderColor: 'grey.300',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            />
          </Box>
        );
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

  const classTable = useMaterialReactTable({
    columns: classColumns,
    data: classifications || [],
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => {
      const c = row.original;
      const isActive = c.is_active !== false;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar" arrow>
            <IconButton color="warning" size="small" onClick={() => setClassModal(c)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          {isActive ? (
            <Tooltip title="Suspender" arrow>
              <IconButton color="error" size="small" onClick={() => handleDeleteClass(c)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Restaurar" arrow>
              <IconButton color="success" size="small" onClick={() => handleRestoreClass(c)}>
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
          <Tooltip title="Agregar clasificación" arrow>
            <IconButton color="primary" onClick={() => setClassModal({})}>
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
    initialState: { pagination: { pageSize: 50 }, density: 'compact' },
    state: { isLoading: loadingClasses },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 }, '& .Mui-selected': { color: '#1565c0', fontWeight: 700 } }}
          TabIndicatorProps={{ sx: { bgcolor: '#1565c0', height: 3 } }}
        >
          <Tab label="Parámetros" value="params" />
          <Tab label="Grupos" value="groups" />
          <Tab label="Clasificación" value="classifications" />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', p: 1 }}>
        {tab === 'params' && <MaterialReactTable table={paramTable} />}
        {tab === 'groups' && <MaterialReactTable table={groupTable} />}
        {tab === 'classifications' && <MaterialReactTable table={classTable} />}
      </Box>

      {paramModal && (
        <LabParameterFormModal
          open={!!paramModal}
          onClose={() => setParamModal(null)}
          param={paramModal.id ? paramModal : null}
          groups={groups}
          classifications={classifications}
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

      {classModal && (
        <ClinicalStudyClassificationFormModal
          open={!!classModal}
          onClose={() => setClassModal(null)}
          classification={classModal.id ? classModal : null}
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

export default ClinicalStudiesManager;
