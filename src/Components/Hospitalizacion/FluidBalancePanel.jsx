import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, Button, Select, MenuItem, FormControl,
  InputLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WaterIcon from '@mui/icons-material/Water';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';

const BALANCE_TYPES = [
  { value: 'intake', label: 'Ingreso' },
  { value: 'output', label: 'Egreso' },
];

const INTAKE_FLUIDS = [
  { value: 'oral', label: 'Oral' },
  { value: 'intravenous', label: 'Intravenoso' },
  { value: 'enteral', label: 'Enteral' },
  { value: 'blood_transfusion', label: 'Transfusión' },
];

const OUTPUT_FLUIDS = [
  { value: 'urine', label: 'Orina' },
  { value: 'vomit', label: 'Vómito' },
  { value: 'diarrhea', label: 'Diarrea' },
  { value: 'drainage', label: 'Drenaje' },
  { value: 'bleeding', label: 'Sangrado' },
];

const initialForm = {
  balance_type: 'intake',
  fluid_type: 'oral',
  amount: '',
  unit: 'ml',
  recorded_at: new Date().toISOString().slice(0, 16),
};

const FluidBalancePanel = ({ hospitalizationId }) => {
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
      const [recordsData, summaryData] = await Promise.all([
        BackendAPI.fluidBalances.getAll(hospitalizationId),
        BackendAPI.fluidBalances.summary(hospitalizationId),
      ]);
      setRecords(recordsData || []);
      setSummary(summaryData);
    } catch {
      setError('Error al cargar balance hídrico');
    } finally {
      setLoading(false);
    }
  }, [hospitalizationId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) return;
    setSaving(true);
    try {
      const created = await BackendAPI.fluidBalances.create(hospitalizationId, form);
      setRecords([created, ...records]);
      setDialogOpen(false);
      setForm({ ...initialForm, recorded_at: new Date().toISOString().slice(0, 16) });
      const summaryData = await BackendAPI.fluidBalances.summary(hospitalizationId);
      setSummary(summaryData);
    } catch {
      setError('Error al guardar registro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await BackendAPI.fluidBalances.destroy(hospitalizationId, id);
      setRecords(records.filter((r) => r.id !== id));
      const summaryData = await BackendAPI.fluidBalances.summary(hospitalizationId);
      setSummary(summaryData);
    } catch {
      setError('Error al eliminar registro');
    }
  };

  const fluidOptions = form.balance_type === 'intake' ? INTAKE_FLUIDS : OUTPUT_FLUIDS;

  if (loading) return <CircularProgress />;

  return (
    <Paper sx={{ p: 1.5, borderLeft: '4px solid', borderColor: 'primary.main', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <WaterIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: 'primary.main', fontSize: '0.8rem' }}>
            BALANCE HÍDRICO
          </Typography>
        </Box>
        {canNurse && (
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={() => setDialogOpen(true)}>
            Nuevo Registro
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {summary && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ py: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Total Ingresos</Typography>
                <Typography variant="h6" color="success.main">{summary.total_intake || 0} ml</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent sx={{ py: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Total Egresos</Typography>
                <Typography variant="h6" color="error.main">{summary.total_output || 0} ml</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ bgcolor: (summary.total_net || 0) >= 0 ? 'primary.light' : 'warning.light' }}>
              <CardContent sx={{ py: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Balance Neto</Typography>
                <Typography variant="h6" color={summary.total_net >= 0 ? 'primary.main' : 'warning.main'}>
                  {summary.total_net || 0} ml
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <TableContainer component={Paper} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fluido</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Cantidad</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fecha/Hora</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Registró</TableCell>
              {canNurse && <TableCell sx={{ fontWeight: 700 }}>Acción</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canNurse ? 6 : 5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  Sin registros de balance hídrico
                </TableCell>
              </TableRow>
            ) : records.map((r) => (
              <TableRow
                key={r.id}
                sx={{ bgcolor: r.balance_type === 'intake' ? '#f1f8e9' : '#fce4ec' }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {r.balance_type_label || r.balance_type}
                  </Typography>
                </TableCell>
                <TableCell>{r.fluid_type_label || r.fluid_type}</TableCell>
                <TableCell fontWeight={600}>{r.amount} {r.unit}</TableCell>
                <TableCell>{r.recorded_at ? new Date(r.recorded_at).toLocaleString() : ''}</TableCell>
                <TableCell>{r.recorded_by?.name || '-'}</TableCell>
                {canNurse && (
                  <TableCell>
                    <IconButton size="small" onClick={() => handleDelete(r.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Registro de Balance Hídrico</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={form.balance_type}
                label="Tipo"
                onChange={(e) => setForm({ ...form, balance_type: e.target.value, fluid_type: e.target.value === 'intake' ? 'oral' : 'urine' })}
              >
                {BALANCE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Fluido</InputLabel>
              <Select value={form.fluid_type} label="Fluido" onChange={(e) => setForm({ ...form, fluid_type: e.target.value })}>
                {fluidOptions.map((f) => <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Cantidad" type="number" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              InputProps={{ endAdornment: <Typography variant="caption">ml</Typography> }} />
          </Box>
          <TextField
            size="small"
            label="Fecha/Hora"
            type="datetime-local"
            value={form.recorded_at}
            onChange={(e) => setForm({ ...form, recorded_at: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" color="error">Cancelar</Button>
          <Button variant="outlined" color="success" onClick={handleCreate} disabled={saving || !form.amount}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FluidBalancePanel;
