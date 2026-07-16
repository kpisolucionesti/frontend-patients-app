import { IconButton, Stack, TextField, Tooltip } from "@mui/material";
import { NoteAdd } from "@mui/icons-material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const AddNoteInline = ({ emergencyId, patientId, onAdded }) => {
    const [text, setText] = useState('');

    const handleAdd = useCallback(async () => {
        if (!text.trim()) return;
        try {
            await BackendAPI.notes.create({ note: text, patient_id: patientId, emergency_id: emergencyId });
            setText('');
            onAdded();
        } catch {
            alert("Error al agregar nota");
        }
    }, [text, emergencyId, patientId, onAdded]);

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <TextField variant="standard" size="small" fullWidth label="Agregar nota" value={text} onChange={({ target }) => setText(target.value)} />
            <Tooltip title="Agregar" arrow>
                <span>
                    <IconButton color="primary" onClick={handleAdd} disabled={!text.trim()}>
                        <NoteAdd />
                    </IconButton>
                </span>
            </Tooltip>
        </Stack>
    );
};

export default AddNoteInline;
