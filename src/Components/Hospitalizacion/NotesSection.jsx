import { useState, useEffect } from 'react';
import { Box, Paper, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SubjectIcon from '@mui/icons-material/Subject';
import { BackendAPI } from '../../services/BackendApi';

const NotesSection = ({ emergencyId, readOnly }) => {
  const [notes, setNotes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!emergencyId) return;
    BackendAPI.notes.getAll({ emergency_id: emergencyId }).then((data) => setNotes(data || [])).catch(() => {});
  }, [emergencyId]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    try {
      await BackendAPI.notes.create({ note: noteText, emergency_id: emergencyId });
      const data = await BackendAPI.notes.getAll({ emergency_id: emergencyId });
      setNotes(data || []);
      setNoteText('');
      setDialogOpen(false);
    } catch { }
    setSaving(false);
  };

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SubjectIcon sx={{ fontSize: 18, color: '#7b1fa2' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#7b1fa2', fontSize: '0.8rem' }}>
            NOTAS
          </Typography>
        </Box>
        {!readOnly && (
          <Tooltip title="Agregar nota" arrow>
            <IconButton size="small" onClick={() => setDialogOpen(true)} sx={{ p: 0.25 }}>
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {notes.length === 0 ? (
        <Typography variant="caption" color="text.secondary">Sin notas</Typography>
      ) : (
        notes.map((note) => (
          <Box key={note.id} sx={{ mb: 0.5, p: 0.75, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{note.note}</Typography>
          </Box>
        ))
      )}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setNoteText(''); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.95rem', bgcolor: 'secondary.main', color: 'white' }}>Agregar Nota</DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <TextField
            variant="standard"
            size="small"
            label="Nota"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            multiline
            rows={3}
            required
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => { setDialogOpen(false); setNoteText(''); }}>
            Cancelar
          </Button>
          <Button size="small" variant="outlined" onClick={handleAddNote} disabled={saving || !noteText.trim()}>
            {saving ? <CircularProgress size={14} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default NotesSection;
