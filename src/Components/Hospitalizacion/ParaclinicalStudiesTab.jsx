import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BiotechIcon from '@mui/icons-material/Biotech';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';

const STUDY_TYPES = [
  { key: 'ekg', label: 'EKG' },
  { key: 'ecografia', label: 'Ecografía' },
  { key: 'tomografia', label: 'Tomografía' },
  { key: 'resonancia', label: 'Resonancia' },
  { key: 'rayos_x', label: 'Rayos X' },
  { key: 'laboratorio_externo', label: 'Laboratorio Externo' },
  { key: 'endoscopia', label: 'Endoscopia' },
  { key: 'otros', label: 'Otros' },
];

const getTypeLabel = (key) => STUDY_TYPES.find((t) => t.key === key)?.label || key;

const EMPTY = { study_type: '', description: '', result: '', study_date: '', status: 'requested' };

const ParaclinicalStudiesTab = ({ emergencyId }) => {
  const permissions = usePermissions();
  const canEdit = permissions.includes('hospitalizacion.edit');
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    if (!emergencyId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.paraclinicalStudies.getAll(emergencyId);
      setStudies(data || []);
    } catch {
      setError('Error al cargar estudios');
    } finally {
      setLoading(false);
    }
  }, [emergencyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (s) => {
    setEditing(s);
    setForm({
      study_type: s.study_type || '',
      description: s.description || '',
      result: s.result || '',
      study_date: s.study_date ? s.study_date.slice(0, 16) : '',
      status: s.status || 'requested',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.study_type || !form.description) return;
    setSaving(true);
    try {
      if (editing) {
        await BackendAPI.paraclinicalStudies.update(emergencyId, editing.id, form);
      } else {
        await BackendAPI.paraclinicalStudies.create(emergencyId, form);
      }
      setDialogOpen(false);
      fetch();
    } catch {
      setError('Error al guardar estudio');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await BackendAPI.paraclinicalStudies.delete(emergencyId, id);
      fetch();
    } catch {
      setError('Error al eliminar estudio');
    }
  };

  if (!emergencyId) return null;

  const pendingCount = studies.filter((s) => s.status === 'requested').length;

  return (
    <Paper sx={{ p: 1.5, borderTop: 2, borderColor: 'secondary.dark', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BiotechIcon sx={{ fontSize: 18, color: '#6a1b9a' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#6a1b9a', fontSize: '0.8rem' }}>
            ESTUDIOS PARACLÍNICOS / IMAGEN
          </Typography>
          {pendingCount > 0 && (
            <Chip label={`${pendingCount} pendiente(s)`} size="small" color="warning" sx={{ height: 20, fontSize: '0.6rem' }} />
          )}
        </Box>
        {canEdit && (
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpenAdd}>
            Nuevo Estudio
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ flex: 1, minHeight: 0, overflow: 'auto', boxShadow: 3, borderRadius: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Tipo</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Descripción</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Fecha</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Resultado</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
                {canEdit && <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {studies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 6 : 5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Sin estudios registrados
                  </TableCell>
                </TableRow>
              ) : studies.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Chip label={getTypeLabel(s.study_type)} size="small"
                      sx={{ height: 20, fontSize: '0.6rem', bgcolor: 'secondary.main', color: 'white' }} />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 250, fontSize: '0.75rem' }}>{s.description}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    {s.study_date ? new Date(s.study_date).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, fontSize: '0.75rem' }}>{s.result || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.status === 'requested' ? 'Solicitado' : s.status === 'completed' ? 'Realizado' : s.status}
                      size="small"
                      color={s.status === 'completed' ? 'success' : 'default'}
                      sx={{ height: 20, fontSize: '0.6rem' }}
                    />
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenEdit(s)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(s.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.95rem', bgcolor: 'secondary.main', color: 'white' }}>
          {editing ? 'Editar Estudio' : 'Nuevo Estudio'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <TextField select variant="standard" size="small" label="Tipo" value={form.study_type}
              onChange={(e) => handleChange('study_type', e.target.value)} required fullWidth>
              {STUDY_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
            </TextField>
            <TextField variant="standard" size="small" label="Descripción" value={form.description}
              onChange={(e) => handleChange('description', e.target.value)} required multiline rows={2} fullWidth />
            <TextField variant="standard" size="small" label="Fecha" type="datetime-local" value={form.study_date}
              onChange={(e) => handleChange('study_date', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField variant="standard" size="small" label="Resultado" value={form.result}
              onChange={(e) => handleChange('result', e.target.value)} multiline rows={2} fullWidth />
            <TextField select variant="standard" size="small" label="Estado" value={form.status}
              onChange={(e) => handleChange('status', e.target.value)} fullWidth>
              <MenuItem value="requested">Solicitado</MenuItem>
              <MenuItem value="completed">Realizado</MenuItem>
              <MenuItem value="cancelled">Cancelado</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleSave} disabled={saving || !form.study_type || !form.description}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ParaclinicalStudiesTab;
