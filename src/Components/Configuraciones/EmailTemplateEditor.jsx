import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, IconButton, Tooltip, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, CircularProgress, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { integrationsApi } from '../../services/integrationsApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';

const EMPTY = { name: '', subject: '', body_html: '', variables: [], template_type: 'custom' };

const EmailTemplateEditor = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [varInput, setVarInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { show: showSnackbar } = useSnackbar();

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setTemplates(await integrationsApi.emailTemplates.list()); } catch { }
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setVarInput(''); setDialogOpen(true); };
  const handleOpenEdit = (t) => { setEditing(t); setForm(t); setVarInput(''); setDialogOpen(true); };

  const handleAddVariable = () => {
    const v = varInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (v && !form.variables.includes(v)) setForm((prev) => ({ ...prev, variables: [...prev.variables, v] }));
    setVarInput('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await integrationsApi.emailTemplates.update(editing.id, form);
      else await integrationsApi.emailTemplates.create(form);
      showSnackbar('Plantilla guardada', 'success');
      setDialogOpen(false); fetch();
    } catch (err) { showSnackbar(err.response?.data?.error || 'Error', 'error'); }
    setSaving(false);
  };

  const handlePreview = async (template) => {
    try {
      const data = await integrationsApi.emailTemplates.preview(template.id, { user_name: 'Juan Perez', reset_link: 'https://ejemplo.com/reset' });
      setPreview(data); setPreviewOpen(true);
    } catch { showSnackbar('Error al generar vista previa', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await integrationsApi.emailTemplates.remove(deleteTarget.id); fetch(); showSnackbar('Plantilla eliminada', 'success'); }
    catch { showSnackbar('Error al eliminar', 'error'); }
    setDeleting(false); setDeleteTarget(null);
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Nombre', size: 160 },
    { accessorKey: 'subject', header: 'Asunto', size: 200 },
    { accessorKey: 'template_type', header: 'Tipo', size: 100 },
    { accessorKey: 'variables', header: 'Variables', size: 200,
      Cell: ({ cell }) => (
        <Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap' }}>
          {(cell.getValue() || []).slice(0, 3).map((v) => (
            <Chip key={v} label={`{{${v}}}`} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 20 }} />
          ))}
        </Box>
      ),
    },
  ], []);

  const table = useMaterialReactTable({
    columns, data: templates, ...MRT_DEFAULTS,
    enableRowActions: true, positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex' }}>
        <Tooltip title="Vista previa" arrow><IconButton size="small" onClick={() => handlePreview(row.original)} sx={{ p: 0.25 }}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
        <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEdit(row.original)} sx={{ p: 0.25 }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
        <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => setDeleteTarget(row.original)} sx={{ p: 0.25, color: 'error.main' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: useCallback(() => (
      <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 16 }} />}
        onClick={handleOpenAdd} sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}>
        Nueva Plantilla
      </Button>
    ), []),
    getRowId: (r) => r.id?.toString() || '',
    state: { isLoading: loading },
    muiTablePaperProps: { sx: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, boxShadow: 3, borderRadius: 1, overflow: 'hidden' } },
    initialState: { pagination: { pageSize: 25 }, density: 'compact', showGlobalFilter: true },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem', mb: 0.75 }}>
        Plantillas de Correo
      </Typography>
      <MaterialReactTable table={table} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
          {editing ? 'Editar Plantilla' : 'Nueva Plantilla'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField variant="standard" size="small" label="Nombre" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus sx={{ flex: 1 }} />
              <TextField variant="standard" size="small" label="Tipo" value={form.template_type}
                onChange={(e) => setForm({ ...form, template_type: e.target.value })} sx={{ width: 150 }} />
            </Box>
            <TextField variant="standard" size="small" label="Asunto" value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })} required fullWidth />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField variant="standard" size="small" label="Variable" value={varInput}
                onChange={(e) => setVarInput(e.target.value)} placeholder="ej: user_name"
                sx={{ width: 180 }} inputProps={{ style: { fontSize: '0.7rem' } }} />
              <Button size="small" variant="outlined" onClick={handleAddVariable} sx={{ fontSize: '0.7rem', py: 0.25 }}>Agregar</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {form.variables.map((v) => (
                <Chip key={v} label={`{{${v}}}`} size="small" onDelete={() => setForm((prev) => ({ ...prev, variables: prev.variables.filter((x) => x !== v) }))}
                  sx={{ fontSize: '0.65rem', height: 22 }} />
              ))}
            </Box>
            <TextField variant="standard" size="small" label="Cuerpo HTML" value={form.body_html}
              onChange={(e) => setForm({ ...form, body_html: e.target.value })}
              fullWidth multiline rows={10} inputProps={{ style: { fontSize: '0.7rem', fontFamily: 'monospace' } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)} sx={{ fontSize: '0.75rem' }}>Cancelar</Button>
          <Button size="small" variant="contained" onClick={handleSave} disabled={saving || !form.name} sx={{ fontSize: '0.75rem' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '1rem' }}>Vista Previa</DialogTitle>
        <DialogContent>
          {preview && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Asunto: {preview.subject}</Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, maxHeight: 400, overflow: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: preview.body }} />
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setPreviewOpen(false)} sx={{ fontSize: '0.75rem' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        loading={deleting} message={`¿Eliminar plantilla "${deleteTarget?.name}"?`} />
    </Box>
  );
};

export default EmailTemplateEditor;
