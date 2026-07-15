import { Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Delete, Edit, MedicalServices, NoteAdd } from "@mui/icons-material";
import React, { useCallback, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useFetch } from "../../hooks/useFetch";
import AsignRoom from "../Board/asignRoomModal";
import EditPatientData from "../Patients/editPatientDataModal";
import MovePatient from "../Board/movePatientsModal";
import ReleasePatient from "../Board/releasePatientModal";
import moment from 'moment';

const perms = () => {
    try { return JSON.parse(localStorage.getItem('user_permissions') || '[]'); }
    catch { return []; }
};

const CaseDetailModal = ({ open, emergencyId, onClose, onDataChange }) => {
    const permissions = useMemo(perms, []);
    const hasPerm = useCallback((p) => permissions.includes(p), [permissions]);
    const { data: emergency, refetch } = useFetch(
        () => BackendAPI.emergencies.getById(emergencyId),
        [emergencyId],
    );
    const [showEditPatient, setShowEditPatient] = useState(false);
    const [interconsultaInput, setInterconsultaInput] = useState('');
    const { data: allNotes, refetch: refetchNotes } = useFetch(() => BackendAPI.notes.getAll(), []);
    const { data: doctors } = useFetch(() => BackendAPI.doctors.getAll(), []);
    const { data: rooms } = useFetch(() => BackendAPI.rooms.getAll(), []);

    const row = useMemo(() => emergency || {}, [emergency]);
    const patient = useMemo(() => row.patient || {}, [row.patient]);

    const patientId = patient.id || row.patient_id;
    const patientNotes = useMemo(
        () => (allNotes || []).filter((f) => f.patient_id === patientId),
        [allNotes, patientId],
    );

    const consultingDoctors = useMemo(
        () => (row.doctors || []).filter((d) => d.id !== row.primary_doctor?.id),
        [row.doctors, row.primary_doctor],
    );

    const patientRoom = useMemo(
        () => (rooms || []).find((r) => r.patient_id === patientId),
        [rooms, patientId],
    );

    const availableConsultingDoctors = useMemo(
        () => (doctors || []).filter((d) =>
            d.id !== row.primary_doctor?.id && !consultingDoctors.find((c) => c.id === d.id)
        ),
        [doctors, row.primary_doctor, consultingDoctors],
    );

    const handleSubActionClose = useCallback(() => {
        refetch();
        if (onDataChange) onDataChange();
        onClose();
    }, [refetch, onDataChange, onClose]);

    const handleSubActionRefresh = useCallback(() => {
        refetch();
        if (onDataChange) onDataChange();
    }, [refetch, onDataChange]);

    const handlePatientSaved = useCallback(() => {
        refetch();
        if (onDataChange) onDataChange();
    }, [refetch, onDataChange]);

    const handleAddInterconsulta = useCallback(async () => {
        if (!interconsultaInput) return;
        const allDoctorIds = [row.primary_doctor?.id, ...consultingDoctors.map((d) => d.id), interconsultaInput].filter(Boolean);
        try {
            await BackendAPI.emergencies.update({
                id: row.id,
                doctors: allDoctorIds.map((id) => ({ id })),
            });
            setInterconsultaInput('');
            refetch();
            if (onDataChange) onDataChange();
        } catch {
            alert("Error al agregar interconsulta");
        }
    }, [interconsultaInput, row, consultingDoctors, refetch, onDataChange]);

    const handleRemoveInterconsulta = useCallback(async (doctorId) => {
        const remainingIds = [row.primary_doctor?.id, ...consultingDoctors.filter((d) => d.id !== doctorId).map((d) => d.id)].filter(Boolean);
        try {
            await BackendAPI.emergencies.update({
                id: row.id,
                doctors: remainingIds.map((id) => ({ id })),
            });
            refetch();
            if (onDataChange) onDataChange();
        } catch {
            alert("Error al eliminar interconsulta");
        }
    }, [row, consultingDoctors, refetch, onDataChange]);

    if (!emergency) return null;

    return (
        <>
            <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
                <DialogTitle textAlign="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', py: 0.75, fontSize: '0.9rem' }}>
                    DETALLE DE EMERGENCIA
                </DialogTitle>
                <DialogContent sx={{
                    '&:first-of-type': { pt: 1.5 },
                    '& .MuiInputBase-input': { fontSize: '0.75rem' },
                    '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                    '& .MuiFormHelperText-root': { fontSize: '0.65rem' },
                    '& .MuiTypography-root': { fontSize: '0.75rem' },
                    '& .MuiChip-label': { fontSize: '0.7rem' },
                    '& .MuiChip-root': { height: 24 },
                }}>
                    <Stack spacing={1.5}>
                        <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
                                    DATOS DEL PACIENTE
                                </Typography>
                                <Stack direction="row" spacing={0.5}>
                                    {hasPerm('pacientes.edit') && (
                                        <Tooltip title="Editar datos del paciente" arrow>
                                            <IconButton size="small" color="warning" onClick={() => setShowEditPatient(true)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {hasPerm('emergencia.assign_room') && <AsignRoom row={row} onStatusChange={handleSubActionRefresh} />}
                                    {hasPerm('emergencia.edit') && <MovePatient row={row} onStatusChange={handleSubActionClose} />}
                                    {hasPerm('emergencia.discharge') && <ReleasePatient row={row} onStatusChange={handleSubActionClose} />}
                                </Stack>
                            </Stack>
                            <Typography variant="body2" fontWeight="bold">
                                {patient.name} {patient.lastname || ''}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                CI: {patient.ci} &nbsp;|&nbsp; Edad: {patient.age} &nbsp;|&nbsp;
                                Genero: {patient.gender} &nbsp;|&nbsp;
                                F. Nac: {patient.birthday ? moment(patient.birthday, 'YYYY-MM-DD').format('DD/MM/YYYY') : ''}
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1.5}>
                            <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2, flex: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="warning.dark">
                                        DATOS DE LA EMERGENCIA
                                    </Typography>
                                    {hasPerm('emergencia.edit') && <EmergencyEditButton row={row} onRefresh={refetch} onClose={onClose} />}
                                </Stack>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Stack direction="row" spacing={1}>
                                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Diagnostico:</Typography>
                                        <Typography variant="body2">{row.diagnostic}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Plan:</Typography>
                                        <Typography variant="body2">{row.treatment}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>F. Ingreso:</Typography>
                                        <Typography variant="body2">{row.ingress_date}</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Ubicacion:</Typography>
                                        <Typography variant="body2">{patientRoom ? patientRoom.name : 'No asignada'}</Typography>
                                    </Stack>
                                    {row.observations && (
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Observaciones:</Typography>
                                            <Typography variant="body2">{row.observations}</Typography>
                                        </Stack>
                                    )}
                                    {row.medical_exit && (
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Alta Medica:</Typography>
                                            <Typography variant="body2">{row.medical_exit}</Typography>
                                        </Stack>
                                    )}
                                    {row.transfer && (
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Area Ingreso:</Typography>
                                            <Typography variant="body2">{row.transfer}</Typography>
                                        </Stack>
                                    )}
                                </Box>
                            </Box>

                            <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: 2, flex: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="success.dark" sx={{ mb: 1 }}>
                                    MEDICOS
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Principal:</strong> {row.primary_doctor?.name || 'No asignado'}
                                </Typography>
                                {consultingDoctors.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2"><strong>Interconsultas:</strong></Typography>
                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                            {consultingDoctors.map((d) => (
                                                <Chip key={d.id} label={d.name} size="small" color="info" onDelete={hasPerm('emergencia.edit') ? () => handleRemoveInterconsulta(d.id) : undefined} />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                {hasPerm('emergencia.edit') && availableConsultingDoctors.length > 0 && (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                        <Autocomplete
                                            size="small"
                                            fullWidth
                                            options={availableConsultingDoctors}
                                            getOptionLabel={(option) => option.name}
                                            value={availableConsultingDoctors.find((d) => d.id === interconsultaInput) || null}
                                            onChange={(_event, newValue) => setInterconsultaInput(newValue?.id || '')}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Agregar Interconsulta" />
                                            )}
                                            sx={{ '& .MuiAutocomplete-option': { fontSize: '0.75rem' } }}
                                        />
                                        <Tooltip title="Agregar Interconsulta" arrow>
                                            <span>
                                                <IconButton color="primary" onClick={handleAddInterconsulta} disabled={!interconsultaInput}>
                                                    <MedicalServices />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                )}
                            </Box>
                        </Stack>

                        <Box sx={{ bgcolor: '#f3e5f5', p: 1.5, borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="secondary.dark" sx={{ mb: 1 }}>
                                NOTAS
                            </Typography>
                                {patientNotes.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">Sin notas</Typography>
                                ) : (
                                    patientNotes.map((note) => (
                                        <NoteItem key={note.id} note={note} onRefresh={refetchNotes} canEdit={hasPerm('notes.edit')} canDelete={hasPerm('notes.delete')} />
                                    ))
                                )}
                                {hasPerm('notes.create') && (
                                    <Box sx={{ mt: 1 }}>
                                        <AddNoteInline patientId={patientId} onAdded={refetchNotes} />
                                    </Box>
                                )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '0.75rem 1.25rem' }}>
                    <Button onClick={onClose} variant="contained" color="error">Cerrar</Button>
                </DialogActions>
            </Dialog>

            {showEditPatient && (
                <EditPatientData
                    open={showEditPatient}
                    onClose={() => setShowEditPatient(false)}
                    patient={patient}
                    onSaved={handlePatientSaved}
                />
            )}
        </>
    );
};

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
                <TextField size="small" fullWidth value={text} onChange={({ target }) => setText(target.value)} autoFocus />
                <Button size="small" variant="contained" color="success" onClick={handleSave}>Guardar</Button>
                <Button size="small" color="error" onClick={() => setEditing(false)}>Cancelar</Button>
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

const AddNoteInline = ({ patientId, onAdded }) => {
    const [text, setText] = useState('');

    const handleAdd = useCallback(async () => {
        if (!text.trim()) return;
        try {
            await BackendAPI.notes.create({ note: text, patient_id: patientId });
            setText('');
            onAdded();
        } catch {
            alert("Error al agregar nota");
        }
    }, [text, patientId, onAdded]);

    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" fullWidth label="Agregar nota" value={text} onChange={({ target }) => setText(target.value)} />
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

const EmergencyEditButton = ({ row, onRefresh, onClose }) => {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState({
        diagnostic: row.diagnostic || '',
        treatment: row.treatment || '',
        current_doctor: row.primary_doctor?.name || '',
        observations: row.observations || '',
    });
    const [validation, setValidation] = useState(false);

    const handleValueChange = useCallback((target) => {
        setValues((prev) => ({ ...prev, [target.name]: target.value }));
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
                <DialogTitle textAlign="center" sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 'bold', py: 0.75, fontSize: '0.9rem' }}>
                    EDITAR EMERGENCIA
                </DialogTitle>
                <DialogContent sx={{ pt: 2, '&:first-of-type': { pt: 2 } }}>
                    <Stack spacing={1.5}>
                        <TextField size="small" fullWidth required label="Diagnostico" name="diagnostic" value={values.diagnostic || ''} onChange={({ target }) => handleValueChange(target)} error={validation && !values.diagnostic} helperText={validation && !values.diagnostic ? 'Requerido' : ''} />
                        <TextField size="small" fullWidth required label="Plan" name="treatment" value={values.treatment || ''} onChange={({ target }) => handleValueChange(target)} error={validation && !values.treatment} helperText={validation && !values.treatment ? 'Requerido' : ''} />
                        <DoctorSelect value={values.current_doctor} onChange={({ target }) => handleValueChange(target)} />
                        <TextField size="small" multiline rows={2} fullWidth label="Observaciones" name="observations" value={values.observations || ''} onChange={({ target }) => handleValueChange(target)} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: '1.25rem', py: 0.75 }}>
                    <Button onClick={() => setOpen(false)} variant="outlined" color="error">Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="success">Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const DoctorSelect = ({ value, onChange }) => {
    const { data: doctors } = useFetch(() => BackendAPI.doctors.getAll(), []);
    return (
        <FormControl size="small" fullWidth>
            <InputLabel>Medico Tratante</InputLabel>
            <Select label="Medico Tratante" name="current_doctor" value={value || ''} onChange={onChange}>
                {(doctors || []).map((d) => (
                    <MenuItem key={d.id} value={d.name}>{d.name} -- {d.speciality}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default CaseDetailModal;
