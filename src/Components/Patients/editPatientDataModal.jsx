import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import React, { useCallback, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import GenderSelect from "../Commons/GenderSelect";
import moment from 'moment';

const EditPatientData = ({ open, onClose, patient, onSaved }) => {
    const [values, setValues] = useState({
        name: patient.name || '',
        lastname: patient.lastname || '',
        birthday: patient.birthday || '',
        gender: patient.gender || '',
        representante: patient.representante || '',
        representante_ci: patient.representante_ci || '',
    });
    const [validation, setValidation] = useState(false);

    const age = useMemo(() => {
        if (!values.birthday) return null;
        return moment().diff(moment(values.birthday, 'YYYY-MM-DD'), 'years');
    }, [values.birthday]);

    const isMinor = age !== null && age < 18;

    const handleValueChange = useCallback((target) => {
        setValues((prev) => ({ ...prev, [target.name]: target.value }));
    }, []);

    const handleBirthdayChange = useCallback((date) => {
        const bday = date ? moment(date).format('YYYY-MM-DD') : '';
        setValues((prev) => ({ ...prev, birthday: bday }));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!values.name || !values.birthday || !values.gender) {
            alert("FALTAN DATOS POR LLENAR");
            setValidation(true);
            return;
        }
        try {
            await BackendAPI.patients.update({ id: patient.id, ...values });
            if (onSaved) onSaved();
            onClose();
        } catch {
            alert("Error al actualizar el paciente");
        }
    }, [values, patient.id, onSaved, onClose]);

    return (
        <Dialog fullWidth maxWidth='xs' open={open} onClose={onClose}>
            <DialogTitle textAlign="center" sx={{ bgcolor: 'success.main', color: 'text.primary', fontWeight: 'bold' }}>
                EDITAR DATOS DEL PACIENTE
            </DialogTitle>
            <DialogContent>
                <TextField
                  variant="standard"
                    disabled fullWidth label="Cédula" value={patient.ci || ''}
                    sx={{ mt: 2, mb: 1 }}
                />
                <TextField
                  variant="standard"
                    error={validation && !values.name} fullWidth required
                    helperText={validation && !values.name ? 'Requerido' : ''}
                    label="Nombre" name="name" value={values.name}
                    onChange={({ target }) => handleValueChange(target)}
                    sx={{ mb: 1 }}
                />
                <TextField
                  variant="standard"
                    fullWidth label="Apellido" name="lastname" value={values.lastname}
                    onChange={({ target }) => handleValueChange(target)}
                    sx={{ mb: 1 }}
                />
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                        format="DD/MM/YYYY"
                        label="Fecha de Nacimiento"
                        value={values.birthday ? moment(values.birthday, 'YYYY-MM-DD') : null}
                        onChange={handleBirthdayChange}
                        slotProps={{
                            textField: {
                                variant: "standard",
                                fullWidth: true, required: true,
                                error: validation && !values.birthday,
                                helperText: validation && !values.birthday ? 'Requerido' : '',
                                sx: { mb: 1 },
                            },
                        }}
                    />
                </LocalizationProvider>
                <GenderSelect
                    variant="standard"
                    value={values.gender}
                    onChange={({ target }) => handleValueChange(target)}
                    error={validation && !values.gender}
                />
                {isMinor && (
                    <>
                        <TextField
                          variant="standard"
                            fullWidth label="Representante" name="representante"
                            value={values.representante}
                            onChange={({ target }) => handleValueChange(target)}
                            sx={{ mt: 1, mb: 1 }}
                        />
                        <TextField
                          variant="standard"
                            fullWidth label="Cédula del Representante" name="representante_ci"
                            value={values.representante_ci}
                            onChange={({ target }) => handleValueChange(target)}
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={onClose} variant="contained" color='error'>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" color='success'>Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditPatientData;
