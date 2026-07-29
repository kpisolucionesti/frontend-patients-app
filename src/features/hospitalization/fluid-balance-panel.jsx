import { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Select, MenuItem, FormControl, InputLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, Grid, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WaterIcon from '@mui/icons-material/Water';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../../shared/ui/mrt-config';

const INTAKE_FLUIDS = [
  { value: 'oral', label: 'Oral' }, { value: 'intravenous', label: 'Intravenoso' },
  { value: 'enteral', label: 'Enteral' }, { value: 'blood_transfusion', label: 'Transfusion' },
];

const OUTPUT_FLUIDS = [
  { value: 'urine', label: 'Orina' }, { value: 'vomit', label: 'Vomito' },
  { value: 'diarrhea', label: 'Diarrea' }, { value: 'drainage', label: 'Drenaje' }, { value: 'bleeding', label: 'Sangrado' },
];

const initialForm = { balance_type: 'intake', fluid_type: 'oral', amount: '', unit: 'ml', recorded_at: new Date().toISOString().slice(0, 16) };

const FluidBalancePanel = ({ hospitalizationId, readOnly }) => {
  const permissions = usePermissions();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...initialForm });
  const [saving, setSaving] = useState(false);
  const canNurse = permissions.includes('hospitalizacion.nursing');

  const loadData = useCallback(async () => {
    if (!hospitalizationId) return;
    setLoading(true);
    try {
      const [rec, sum] = await Promise.all([BackendAPI.fluidBalances.getAll(hospitalizationId), BackendAPI.fluidBalances.summary(hospitalizationId)]);
      setRecords(rec || []); setSummary(sum || null);
    } catch { setError('Error al cargar balance hidrico'); }
    finally { setLoading(false); }
  }, [hospitalizationId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!form.amount) return;
    setSaving(true);
    try { await BackendAPI.fluidBalances.create(hospitalizationId, form); setDialogOpen(false); setForm({ ...initialForm }); loadData(); }
    catch { setError('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.fluidBalances.destroy(hospitalizationId, id); loadData(); }
    catch { setError('Error al eliminar'); }
  };

  const fluidLabel = (type, fluid) => {
    if (type === 'intake') return INTAKE_FLUIDS.find((f) => f.value === fluid)?.label || fluid;
    return OUTPUT_FLUIDS.find((f) => f.value === fluid)?.label || fluid;
  };

  const columns = useMemo(() => [
    { accessorKey: 'balance_type', header: 'Tipo', size: 90,
      Cell: ({ row }) => <Chip label={row.original.balance_type === 'intake' ? 'Ingreso' : 'Egreso'} size="small" color={row.original.balance_type === 'intake' ? 'success' : 'error'} sx={{ fontSize: '0.7rem' }} /> },
    { accessorKey: 'fluid_type', header: 'Fluido', size: 140, Cell: ({ row }) => fluidLabel(row.original.balance_type, row.original.fluid_type) },
    { accessorKey: 'amount', header: 'Cantidad', size: 90, Cell: ({ row }) => `${row.original.amount} ${row.original.unit || 'ml'}` },
    { accessorKey: 'recorded_at', header: 'Fecha/Hora', size: 140, Cell: ({ row }) => row.original.recorded_at ? new Date(row.original.recorded_at).toLocaleString() : '-' },
    { accessorKey: 'recorded_by.name', header: 'Registro', size: 120, Cell: ({ row }) => row.original.recorded_by?.name || '-' },
  ], []);

  const table = useMaterialReactTable({
    ...MRT_DEFAULTS,
    columns,
    data: records,
    state: { isLoading: loading },
    enableRowActions: !readOnly && canNurse,
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <IconButton size="small" onClick={() => handleDelete(row.original.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {!readOnly && canNurse && (
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontSize: '0.7rem' }}>Nuevo Registro</Button>
        )}
      </Box>
    ),
  });

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}><Card sx={{ bgcolor: 'success.light', borderRadius: 1 }}><CardContent sx={{ py: 1, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Total Ingresos</Typography><Typography fontWeight={700} color="success.dark" sx={{ fontSize: '1rem' }}>{summary.total_intake || 0} ml</Typography></CardContent></Card></Grid>
          <Grid item xs={4}><Card sx={{ bgcolor: 'error.light', borderRadius: 1 }}><CardContent sx={{ py: 1, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Total Egresos</Typography><Typography fontWeight={700} color="error.dark" sx={{ fontSize: '1rem' }}>{summary.total_output || 0} ml</Typography></CardContent></Card></Grid>
          <Grid item xs={4}><Card sx={{ bgcolor: (summary.total_net || 0) >= 0 ? 'primary.light' : 'warning.light', borderRadius: 1 }}><CardContent sx={{ py: 1, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Balance Neto</Typography><Typography fontWeight={700} color={(summary.total_net || 0) >= 0 ? 'primary.main' : 'warning.main'} sx={{ fontSize: '1rem' }}>{summary.total_net || 0} ml</Typography></CardContent></Card></Grid>
        </Grid>
      )}
      <MaterialReactTable table={table} />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Nuevo Registro de Balance Hidrico</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <FormControl variant="standard" fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={form.balance_type} label="Tipo" onChange={(e) => setForm((p) => ({ ...p, balance_type: e.target.value, fluid_type: e.target.value === 'intake' ? 'oral' : 'urine' }))}>
                <MenuItem value="intake">Ingreso</MenuItem><MenuItem value="output">Egreso</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="standard" fullWidth>
              <InputLabel>Fluido</InputLabel>
              <Select value={form.fluid_type} label="Fluido" onChange={(e) => setForm((p) => ({ ...p, fluid_type: e.target.value }))}>
                {(form.balance_type === 'intake' ? INTAKE_FLUIDS : OUTPUT_FLUIDS).map((f) => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField variant="standard" size="small" label="Cantidad (ml)" type="number" fullWidth value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
            <TextField variant="standard" size="small" type="datetime-local" label="Fecha/Hora" fullWidth value={form.recorded_at} onChange={(e) => setForm((p) => ({ ...p, recorded_at: e.target.value }))} InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" color="error">Cancelar</Button>
          <Button onClick={handleSave} variant="outlined" color="success" disabled={saving || !form.amount}>Registrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FluidBalancePanel;
