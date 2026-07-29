import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Button, IconButton, Tooltip, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControlLabel, Switch, CircularProgress,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';
import ImportModal from '../../shared/ui/import-excel-modal';

const CatalogManager = ({
  apiService,
  title,
  columns,
  fields,
  referenceData,
  importConfig,
}) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const { show: showSnackbar } = useSnackbar();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.list();
      setRecords(Array.isArray(data) ? data : []);
    } catch { setRecords([]); }
    setLoading(false);
  }, [apiService]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const buildEmptyForm = () => {
    const empty = {};
    fields.forEach((f) => { empty[f.name] = f.defaultValue ?? (f.type === 'boolean' ? true : ''); });
    return empty;
  };

  const handleOpenAdd = () => {
    setEditing(null);
    setForm(buildEmptyForm());
    setDirty(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditing(record);
    const f = {};
    fields.forEach((field) => {
      f[field.name] = record[field.name] ?? (field.type === 'boolean' ? true : '');
    });
    setForm(f);
    setDirty(false);
    setDialogOpen(true);
  };

  const handleChange = (name, type) => (e) => {
    const val = type === 'boolean' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [name]: val }));
    setDirty(true);
  };

  const handleCloseDialog = () => {
    if (dirty) { setCloseConfirmOpen(true); } else { setDialogOpen(false); }
  };

  const handleDiscardChanges = () => {
    setCloseConfirmOpen(false);
    setDialogOpen(false);
    setDirty(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await apiService.update(editing.id, form);
        showSnackbar('Registro actualizado', 'success');
      } else {
        await apiService.create(form);
        showSnackbar('Registro creado', 'success');
      }
      setDirty(false);
      setDialogOpen(false);
      fetchRecords();
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Error al guardar', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiService.remove(deleteTarget.id);
      showSnackbar('Registro eliminado', 'success');
      fetchRecords();
    } catch { showSnackbar('Error al eliminar', 'error'); }
    setDeleting(false);
    setDeleteTarget(null);
  };

  const renderField = (field, autoFocus = false) => {
    const val = form[field.name];
    const options = (referenceData && referenceData[field.name]) || field.options;
    if (options || field.type === 'select') {
      return (
        <TextField select variant="standard" size="small" fullWidth
          label={field.label} value={val ?? ''}
          onChange={handleChange(field.name, field.type)} required={field.required}
          autoFocus={autoFocus}>
          {(options || []).map((o) => (
            <MenuItem key={o.id ?? o.value ?? o.name ?? o} value={o.name ?? o.value ?? o}>
              {o.label ?? o.name ?? o}
            </MenuItem>
          ))}
        </TextField>
      );
    }
    if (field.type === 'boolean') {
      return (
        <FormControlLabel
          control={<Switch checked={!!val} onChange={handleChange(field.name, 'boolean')} />}
          label={field.label}
        />
      );
    }
    return (
      <TextField variant="standard" size="small" fullWidth
        label={field.label} value={val ?? ''} type={field.type === 'number' ? 'number' : 'text'}
        onChange={handleChange(field.name, field.type)} required={field.required}
        multiline={field.multiline} rows={field.rows || 1}
        autoFocus={autoFocus}
      />
    );
  };

  const mrtColumns = useMemo(() =>
    columns.map((c) => ({
      accessorKey: c.key,
      header: c.label,
      ...(c.size ? { size: c.size } : {}),
      ...(c.render ? { Cell: ({ cell }) => c.render(cell.row.original) } : {}),
    })),
  [columns]);

  const table = useMaterialReactTable({
    columns: mrtColumns,
    data: records,
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex' }}>
        <Tooltip title="Editar" arrow>
          <IconButton size="small" onClick={() => handleOpenEdit(row.original)} sx={{ p: 0.25 }}>
            <EditIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar" arrow>
          <IconButton size="small" onClick={() => setDeleteTarget(row.original)} sx={{ p: 0.25, color: 'error.main' }}>
            <DeleteIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Agregar" arrow>
            <IconButton size="small" color="primary" onClick={handleOpenAdd}><AddIcon fontSize="small" /></IconButton>
          </Tooltip>
          {importConfig && (
            <Tooltip title="Importar desde Excel" arrow>
              <IconButton size="small" color="info" onClick={() => setImportOpen(true)}><FileUploadIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
        </Box>
      ),
      [importConfig],
    ),
    getRowId: (row) => row.id?.toString() || '',
    state: { isLoading: loading },
    muiTablePaperProps: {
      sx: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, boxShadow: 3, borderRadius: 1, overflow: 'hidden' },
    },
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    initialState: { pagination: { pageSize: 25 }, density: 'compact', showGlobalFilter: true },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem' }}>
          {title}
        </Typography>
      </Box>
      <MaterialReactTable table={table} />

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
          {editing ? `Editar ${title}` : `Agregar ${title}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
            {fields.map((field, idx) => (
              <Box key={field.name}>{renderField(field, idx === 0)}</Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={handleCloseDialog} sx={{ fontSize: '0.75rem' }}>Cancelar</Button>
          <Button size="small" variant="contained" onClick={handleSave} disabled={saving}
            sx={{ fontSize: '0.75rem', py: 0.25 }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={closeConfirmOpen} onClose={() => setCloseConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
          Descartar cambios
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ pt: 2, fontSize: '0.8rem' }}>
            Hay cambios sin guardar. ¿Desea descartarlos?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setCloseConfirmOpen(false)} sx={{ fontSize: '0.75rem' }}>
            Permanecer
          </Button>
          <Button size="small" variant="contained" color="warning" onClick={handleDiscardChanges} sx={{ fontSize: '0.75rem' }}>
            Descartar
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`¿Eliminar "${deleteTarget?.name || deleteTarget?.code || deleteTarget?.id}"?`}
      />
      {importConfig && (
        <ImportModal open={importOpen} onClose={() => setImportOpen(false)}
          onImported={fetchRecords} sectionLabel={importConfig.sectionLabel}
          templateName={importConfig.templateName}
          columns={importConfig.columns} templateRows={importConfig.templateRows}
          apiImportFn={importConfig.apiImportFn} />
      )}
    </Box>
  );
};

export default CatalogManager;
