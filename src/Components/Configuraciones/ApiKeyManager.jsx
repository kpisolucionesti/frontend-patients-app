import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, IconButton, Tooltip, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { integrationsApi } from '../../services/integrationsApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';

const ApiKeyManager = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [form, setForm] = useState({ name: '', expires_at: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { show: showSnackbar } = useSnackbar();

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setKeys(await integrationsApi.apiKeys.list()); } catch { }
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try { const key = await integrationsApi.apiKeys.create(form); setNewKey(key); setDialogOpen(false); fetch(); }
    catch (err) { showSnackbar(err.response?.data?.error || 'Error', 'error'); }
    setSaving(false);
  };

  const handleRegenerate = async (key) => {
    try { const updated = await integrationsApi.apiKeys.regenerate(key.id); setNewKey(updated); fetch(); }
    catch { showSnackbar('Error al regenerar', 'error'); }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => showSnackbar('Token copiado', 'success'));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await integrationsApi.apiKeys.remove(deleteTarget.id); fetch(); showSnackbar('API key eliminada', 'success'); }
    catch { showSnackbar('Error', 'error'); }
    setDeleting(false); setDeleteTarget(null);
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Nombre', size: 160 },
    { accessorKey: 'key', header: 'Token', size: 200,
      Cell: ({ cell }) => <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>••••••••{cell.getValue()?.slice(-8) || ''}</Box>,
    },
    { accessorKey: 'expires_at', header: 'Expira', size: 130,
      Cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : 'Sin expiracion',
    },
    { accessorKey: 'last_used_at', header: 'Ultimo uso', size: 130,
      Cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue()).toLocaleDateString() : '—',
    },
  ], []);

  const table = useMaterialReactTable({
    columns, data: keys, ...MRT_DEFAULTS,
    enableRowActions: true, positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex' }}>
        <Tooltip title="Regenerar" arrow><IconButton size="small" onClick={() => handleRegenerate(row.original)} sx={{ p: 0.25 }}><RefreshIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
        <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => setDeleteTarget(row.original)} sx={{ p: 0.25, color: 'error.main' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: useCallback(() => (
      <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 16 }} />}
        onClick={() => { setForm({ name: '', expires_at: '' }); setDialogOpen(true); }}
        sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}>
        Generar Token
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
        API Keys / Tokens
      </Typography>
      <MaterialReactTable table={table} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '1rem' }}>Generar API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
            <TextField variant="standard" size="small" label="Nombre" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus fullWidth />
            <TextField variant="standard" size="small" type="date" label="Expiracion (opcional)"
              value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              InputLabelProps={{ shrink: true }} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)} sx={{ fontSize: '0.75rem' }}>Cancelar</Button>
          <Button size="small" variant="contained" onClick={handleCreate} disabled={saving || !form.name} sx={{ fontSize: '0.75rem' }}>
            {saving ? 'Generando...' : 'Generar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!newKey} onClose={() => setNewKey(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 700, fontSize: '1rem' }}>Token Generado</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="warning" variant="outlined" sx={{ mb: 2, fontSize: '0.75rem' }}>Copia este token ahora. No se mostrara de nuevo.</Alert>
            <TextField variant="standard" size="small" fullWidth multiline rows={2}
              value={newKey?.key || ''} InputProps={{ readOnly: true, style: { fontFamily: 'monospace', fontSize: '0.75rem' } }} />
            <Button size="small" variant="outlined" startIcon={<ContentCopyIcon sx={{ fontSize: 16 }} />}
              onClick={() => newKey && handleCopy(newKey.key)} sx={{ mt: 1, fontSize: '0.75rem' }}>Copiar Token</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="contained" onClick={() => setNewKey(null)} sx={{ fontSize: '0.75rem' }}>Entendido</Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting} message={`¿Eliminar API key "${deleteTarget?.name}"?`} />
    </Box>
  );
};

export default ApiKeyManager;
