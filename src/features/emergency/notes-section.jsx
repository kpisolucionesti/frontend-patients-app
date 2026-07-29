import React, { useState, useCallback } from 'react';
import { Box, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SubjectIcon from '@mui/icons-material/Subject';
import NoteItem from '../../Components/Emergency/NoteItem';
import SectionHeader from '../../shared/ui/section-header';
import { BackendAPI } from '../../services/BackendApi';

const NotesSection = React.memo(function NotesSection({
  patientNotes,
  emergencyId,
  patientId,
  readOnly,
  onRefresh,
}) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      await BackendAPI.notes.create({ note: noteText, patient_id: patientId, emergency_id: emergencyId, note_type: 'general' });
      setNoteText('');
      setNoteDialogOpen(false);
      onRefresh();
    } catch {
      alert('Error al agregar nota');
    } finally { setNoteSaving(false); }
  }, [noteText, patientId, emergencyId, onRefresh]);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <SectionHeader icon={<SubjectIcon sx={{ fontSize: 16 }} />} label="NOTAS" color="secondary.main" />
        <Tooltip title={readOnly ? 'Sin permiso' : 'Agregar nota'} arrow>
          <span>
            <IconButton size="small" onClick={() => setNoteDialogOpen(true)} sx={{ p: 0.25 }} disabled={readOnly}>
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {patientNotes.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Sin notas</Typography>
      ) : readOnly ? (
        patientNotes.map((note) => (
          <Box key={note.id} sx={{ mb: 0.5, p: 0.75, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{note.note}</Typography>
          </Box>
        ))
      ) : (
        patientNotes.map((note) => (
          <NoteItem key={note.id} note={note} onRefresh={onRefresh} canEdit={!readOnly} canDelete={!readOnly} />
        ))
      )}

      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.95rem', bgcolor: 'primary.main', color: 'white', fontWeight: 700 }}>Agregar Nota</DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <TextField variant="standard" size="small" label="Nota" value={noteText} onChange={(e) => setNoteText(e.target.value)}
            multiline rows={3} required fullWidth />
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setNoteDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="outlined" onClick={handleAddNote} disabled={noteSaving || !noteText.trim()}>
            {noteSaving ? <CircularProgress size={14} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default NotesSection;
