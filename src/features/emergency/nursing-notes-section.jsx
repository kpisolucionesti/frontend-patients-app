import React from 'react';
import { Box, Typography } from '@mui/material';

const NursingNotesSection = React.memo(function NursingNotesSection({ nursingNotes }) {
  if (nursingNotes.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
        Sin notas de enfermería registradas
      </Typography>
    );
  }

  return (
    <>
      {nursingNotes.map((note) => (
        <Box key={note.id} sx={{ mb: 0.5, p: 0.75, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
            {note.created_at ? new Date(note.created_at).toLocaleDateString() + ' ' + new Date(note.created_at).toLocaleTimeString() : '—'}
            {note.created_by?.name ? ' · ' + note.created_by.name : ''}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.73rem', mt: 0.25 }}>{note.note}</Typography>
        </Box>
      ))}
    </>
  );
});

export default NursingNotesSection;
