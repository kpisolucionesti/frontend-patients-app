import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, IconButton, Tooltip, Typography,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, CircularProgress, Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { integrationsApi } from '../../services/integrationsApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';

const WEBHOOK_EVENTS = [
  { value: 'emergency.created', label: 'Emergencia creada' },
  { value: 'emergency.discharged', label: 'Emergencia - Alta' },
  { value: 'emergency.death', label: 'Emergencia - Fallecimiento' },
  { value: 'hospitalization.admission', label: 'Ingreso hospitalizacion' },
  { value: 'hospitalization.discharge', label: 'Alta hospitalaria' },
  { value: 'surgery.scheduled', label: 'Cirugia programada' },
  { value: 'surgery.completed', label: 'Cirugia completada' },
  { value: 'patient.created', label: 'Paciente creado' },
  { value: 'appointment.created', label: 'Cita creada' },
];

const EMPTY = { url: '', event: 'emergency.created', secret: '', is_active: true };

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [deliveries, setDeliveries] = useState({});
  const { show: showSnackbar } = useSnackbar();

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setWebhooks(await integrationsApi.webhooks.list()); } catch { }
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (w) => { setEditing(w); setForm(w); setDialogOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await integrationsApi.webhooks.update(editing.id, form);
      else await integrationsApi.webhooks.create(form);
      showSnackbar('Webhook guardado', 'success');
      setDialogOpen(false); fetch();
    } catch (err) { showSnackbar(err.response?.data?.error || 'Error', 'error'); }
    setSaving(false);
  };

  const handleTest = async (webhook) => {
    try { await integrationsApi.webhooks.test(webhook.id); showSnackbar('Test enviado', 'success'); }
    catch { showSnackbar('Error', 'error'); }
  };

  const handleToggleDeliveries = async (webhook) => {
    if (expandedId === webhook.id) { setExpandedId(null); return; }
    setExpandedId(webhook.id);
    try { const data = await integrationsApi.webhooks.deliveries(webhook.id); setDeliveries((prev) => ({ ...prev, [webhook.id]: data })); }
    catch { }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await integrationsApi.webhooks.remove(deleteTarget.id); fetch(); showSnackbar('Webhook eliminado', 'success'); }
    catch { showSnackbar('Error', 'error'); }
    setDeleting(false); setDeleteTarget(null);
  };

  const eventLabel = (ev) => WEBHOOK_EVENTS.find((e) => e.value === ev)?.label || ev;

  const columns = useMemo(() => [
    { accessorKey: 'url', header: 'URL', Cell: ({ cell }) => <Box sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.7rem' }}>{cell.getValue()}</Box> },
    { accessorKey: 'event', header: 'Evento', size: 170, Cell: ({ cell }) => <Chip label={eventLabel(cell.getValue())} size="small" sx={{ fontSize: '0.65rem', height: 20 }} /> },
    { accessorKey: 'is_active', header: 'Estado', size: 90,
      Cell: ({ cell }) => <Chip label={cell.getValue() ? 'Activo' : 'Inactivo'} size="small" color={cell.getValue() ? 'success' : 'default'} sx={{ fontSize: '0.65rem', height: 20 }} />,
    },
  ], []);

  const table = useMaterialReactTable({
    columns, data: webhooks, ...MRT_DEFAULTS,
    enableRowActions: true, positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex' }}>
        <Tooltip title="Entregas" arrow><IconButton size="small" onClick={() => handleToggleDeliveries(row.original)} sx={{ p: 0.25 }}><ExpandMoreIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
        <Tooltip title="Test" arrow><IconButton size="small" onClick={() => handleTest(row.original)} sx={{ p: 0.25 }}><SendIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
        <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEdit(row.original)} sx={{ p: 0.25 }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
        <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => setDeleteTarget(row.original)} sx={{ p: 0.25, color: 'error.main' }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: useCallback(() => (
      <Tooltip title="Nuevo webhook" arrow>
        <IconButton size="small" color="primary" onClick={handleOpenAdd}><AddIcon fontSize="small" /></IconButton>
      </Tooltip>
    ), []),
    getRowId: (r) => r.id?.toString() || '',
    state: { isLoading: loading },
    muiTablePaperProps: { sx: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, boxShadow: 3, borderRadius: 1, overflow: 'hidden' } },
    initialState: { pagination: { pageSize: 25 }, density: 'compact', showGlobalFilter: true },
    renderDetailPanel: expandedId ? ({ row }) => {
      const w = row.original;
      if (expandedId !== w.id) return null;
      const dl = deliveries[w.id] || [];
      return (
        <Box sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}>
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Historial de Entregas</Typography>
          {dl.length === 0 ? (
            <Typography variant="caption" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.5 }}>Sin entregas</Typography>
          ) : dl.slice(0, 10).map((d) => (
            <Box key={d.id} sx={{ display: 'flex', gap: 1, py: 0.25, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontFamily: 'monospace', width: 140 }}>{new Date(d.created_at).toLocaleString()}</Typography>
              <Chip label={d.response_code || 'ERR'} size="small" color={d.response_code >= 200 && d.response_code < 300 ? 'success' : 'error'} sx={{ fontSize: '0.6rem', height: 18 }} />
            </Box>
          ))}
        </Box>
      );
    } : undefined,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem', mb: 0.75 }}>
        Webhooks
      </Typography>
      <MaterialReactTable table={table} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
          {editing ? 'Editar Webhook' : 'Nuevo Webhook'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
            <TextField variant="standard" size="small" label="URL" value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })} required autoFocus fullWidth />
            <TextField select variant="standard" size="small" label="Evento" value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })} required fullWidth>
              {WEBHOOK_EVENTS.map((ev) => <MenuItem key={ev.value} value={ev.value}>{ev.label}</MenuItem>)}
            </TextField>
            <TextField variant="standard" size="small" label="Secret (opcional)" value={form.secret}
              onChange={(e) => setForm({ ...form, secret: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)} sx={{ fontSize: '0.75rem' }}>Cancelar</Button>
          <Button size="small" variant="contained" onClick={handleSave} disabled={saving || !form.url} sx={{ fontSize: '0.75rem' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting} message={`¿Eliminar webhook para "${eventLabel(deleteTarget?.event)}"?`} />
    </Box>
  );
};

export default WebhookManager;
