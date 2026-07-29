import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Tooltip } from "@mui/material";
import { Edit } from "@mui/icons-material";
import React, { useCallback, useState } from "react";
import { Button } from "@mui/material";
import { BackendAPI } from "../../services/BackendApi";
import DoctorSelect from '../../shared/ui/doctor-select';
import { sanitizeInput } from "../../utils/sanitize";

const EmergencyEditButton = ({ row, onRefresh }) => {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState({
        diagnostic: row.diagnostic || '',
        treatment: row.treatment || '',
        current_doctor: row.primary_doctor?.name || '',
        observations: row.observations || '',
    });
    const [validation, setValidation] = useState(false);

    const handleValueChange = useCallback((target) => {
        const sanitized = sanitizeInput(target.value, { maxLength: 2000 });
        setValues((prev) => ({ ...prev, [target.name]: sanitized }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!values.diagnostic || !values.treatment) {
            alert("FALTAN DATOS POR LLENAR");
            setValidation(true);
            return;
        }
        try {
            await BackendAPI.emergencies.update({ id: row.id, ...values });
            setOpen(false);
            onRefresh();
        } catch {
            alert("Error al actualizar");
        }
    }, [values, row.id, onRefresh]);

    return (
        <>
            <Tooltip title="Editar emergencia" arrow>
                <IconButton color="success" onClick={() => setOpen(true)}>
                    <Edit fontSize="small" />
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle textAlign="center" sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>
                    EDITAR EMERGENCIA
                </DialogTitle>
                <DialogContent sx={{ pt: 2, '&:first-of-type': { pt: 2 } }}>
                    <Stack spacing={1.5}>
                        <TextField variant="standard" size="small" fullWidth required label="Diagnostico" name="diagnostic" value={values.diagnostic || ''} onChange={({ target }) => handleValueChange(target)} error={validation && !values.diagnostic} helperText={validation && !values.diagnostic ? 'Requerido' : ''} inputProps={{ maxLength: 2000 }} />
                        <TextField variant="standard" size="small" fullWidth required label="Plan" name="treatment" value={values.treatment || ''} onChange={({ target }) => handleValueChange(target)} error={validation && !values.treatment} helperText={validation && !values.treatment ? 'Requerido' : ''} inputProps={{ maxLength: 2000 }} />
                        <DoctorSelect value={values.current_doctor} onChange={({ target }) => handleValueChange(target)} />
                        <TextField variant="standard" size="small" multiline rows={2} fullWidth label="Observaciones" name="observations" value={values.observations || ''} onChange={({ target }) => handleValueChange(target)} inputProps={{ maxLength: 2000 }} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: '1.25rem', py: 0.75 }}>
                    <Button onClick={() => setOpen(false)} variant="outlined" color="error">Cancelar</Button>
                    <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EmergencyEditButton;
