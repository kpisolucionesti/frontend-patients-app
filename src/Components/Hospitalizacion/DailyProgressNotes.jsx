import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Alert, CircularProgress, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';

const NOTE_TYPES = [
  { value: 'progress', label: 'Evolución Médica' },
  { value: 'nursing', label: 'Nota de Enfermería' },
  { value: 'admission', label: 'Nota de Ingreso' },
  { value: 'discharge', label: 'Nota de Alta' },
];

const SHIFTS = [
  { value: 'morning', label: 'Mañana' },
  { value: 'afternoon', label: 'Tarde' },
  { value: 'night', label: 'Noche' },
];

const initialNote = {
  note_type: 'progress',
  shift: '',
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
  recorded_at: new Date().toISOString().slice(0, 16),
};

const DailyProgressNotes = ({ hospitalizationId }) => {
  const permissions = usePermissions();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({ ...initialNote });
  const [saving, setSaving] = useState(false);

  const canEdit = permissions.includes('hospitalizacion.edit');
  const canNurse = permissions.includes('hospitalizacion.nursing');

  const loadNotes = useCallback(async () => {
    if (!hospitalizationId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.hospitalizationNotes.getAll(hospitalizationId);
      setNotes(data || []);
    } catch {
      setError('Error al cargar notas');
    } finally {
      setLoading(false);
    }
  }, [hospitalizationId]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setForm({ ...initialNote, recorded_at: new Date().toISOString().slice(0, 16) });
    setDialogOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setForm({
      note_type: note.note_type,
      shift: note.shift || '',
      subjective: note.subjective || '',
      objective: note.objective || '',
      assessment: note.assessment || '',
      plan: note.plan || '',
      recorded_at: note.recorded_at ? note.recorded_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.subjective && !form.objective && !form.assessment && !form.plan) return;
    setSaving(true);
    try {
      if (editingNote) {
        const updated = await BackendAPI.hospitalizationNotes.update(hospitalizationId, editingNote.id, form);
        setNotes(notes.map((n) => (n.id === editingNote.id ? updated : n)));
      } else {
        const created = await BackendAPI.hospitalizationNotes.create(hospitalizationId, form);
        setNotes([created, ...notes]);
      }
      setDialogOpen(false);
    } catch {
      setError('Error al guardar la nota');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('¿Eliminar esta nota?')) return;
    try {
      await BackendAPI.hospitalizationNotes.destroy(hospitalizationId, noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch {
      setError('Error al eliminar la nota');
    }
  };

  const noteTypeColor = (type) => {
    const colors = { progress: 'primary', nursing: 'info', admission: 'success', discharge: 'warning' };
    return colors[type] || 'default';
  };

  if (loading) return <CircularProgress />;

  const canCreateOrEdit = canEdit || canNurse;

  return (
    <Paper sx={{ p: 1.5, borderLeft: '4px solid #1565c0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AssignmentIcon sx={{ fontSize: 18, color: '#1565c0' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0', fontSize: '0.8rem' }}>
            NOTAS DE EVOLUCIÓN
          </Typography>
        </Box>
        {canCreateOrEdit && (
          <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleOpenCreate}>
            Nueva Nota
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {notes.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No hay notas registradas
        </Typography>
      ) : notes.map((note) => (
        <Card key={note.id} sx={{ mb: 2, bgcolor: note.note_type === 'nursing' ? '#f5f5f5' : 'white' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <Chip label={note.note_type_label || note.note_type} size="small" color={noteTypeColor(note.note_type)} />
                {note.shift_label && <Chip label={note.shift_label} size="small" variant="outlined" />}
                <Typography variant="caption" color="text.secondary">
                  {note.recorded_at ? new Date(note.recorded_at).toLocaleString() : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  por {note.created_by?.name || 'Desconocido'}
                </Typography>
              </Box>
              {canCreateOrEdit && (
                <Box>
                  <IconButton size="small" onClick={() => handleOpenEdit(note)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(note.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              )}
            </Box>
            {note.subjective && <Typography variant="body2"><b>S:</b> {note.subjective}</Typography>}
            {note.objective && <Typography variant="body2"><b>O:</b> {note.objective}</Typography>}
            {note.assessment && <Typography variant="body2"><b>A:</b> {note.assessment}</Typography>}
            {note.plan && <Typography variant="body2"><b>P:</b> {note.plan}</Typography>}
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingNote ? 'Editar Nota' : 'Nueva Nota'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Tipo</InputLabel>
              <Select value={form.note_type} label="Tipo" onChange={(e) => setForm({ ...form, note_type: e.target.value })}>
                {NOTE_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
            {form.note_type === 'nursing' && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Turno</InputLabel>
                <Select value={form.shift} label="Turno" onChange={(e) => setForm({ ...form, shift: e.target.value })}>
                  {SHIFTS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                </Select>
              </FormControl>
            )}
            <TextField
              size="small"
              label="Fecha/Hora"
              type="datetime-local"
              value={form.recorded_at}
              onChange={(e) => setForm({ ...form, recorded_at: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <TextField fullWidth multiline rows={2} label="Subjetivo (S)" value={form.subjective}
            onChange={(e) => setForm({ ...form, subjective: e.target.value })} sx={{ mb: 1.5 }} />
          <TextField fullWidth multiline rows={2} label="Objetivo (O)" value={form.objective}
            onChange={(e) => setForm({ ...form, objective: e.target.value })} sx={{ mb: 1.5 }} />
          <TextField fullWidth multiline rows={2} label="Evaluación (A)" value={form.assessment}
            onChange={(e) => setForm({ ...form, assessment: e.target.value })} sx={{ mb: 1.5 }} />
          <TextField fullWidth multiline rows={2} label="Plan (P)" value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DailyProgressNotes;
