import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const NoteItem = ({ note, onRefresh, canEdit, canDelete }) => {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(note.note);

    const handleSave = useCallback(async () => {
        if (!text.trim()) return;
        try {
            await BackendAPI.notes.update({ id: note.id, note: text, patient_id: note.patient_id });
            setEditing(false);
            onRefresh();
        } catch {
            alert("Error al editar la nota");
        }
    }, [text, note.id, note.patient_id, onRefresh]);

    const handleDelete = useCallback(async () => {
        try {
            await BackendAPI.notes.delete(note.id);
            onRefresh();
        } catch {
            alert("Error al eliminar la nota");
        }
    }, [note.id, onRefresh]);

    if (editing) {
        return (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <TextField variant="standard" size="small" fullWidth value={text} onChange={({ target }) => setText(target.value)} autoFocus />
                <Button size="small" variant="outlined" color="success" onClick={handleSave}>Guardar</Button>
                <Button size="small" variant="outlined" color="error" onClick={() => setEditing(false)}>Cancelar</Button>
            </Stack>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, p: 0.75, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>{note.note}</Typography>
            <Box>
                {canEdit && (
                    <IconButton size="small" color="primary" onClick={() => { setText(note.note); setEditing(true); }}>
                        <Edit fontSize="small" />
                    </IconButton>
                )}
                {canDelete && (
                    <IconButton size="small" color="error" onClick={handleDelete}>
                        <Delete fontSize="small" />
                    </IconButton>
                )}
            </Box>
        </Box>
    );
};

export default NoteItem;
