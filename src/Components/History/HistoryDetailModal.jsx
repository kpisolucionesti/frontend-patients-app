import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { Button } from "@mui/material";
import React, { useMemo } from "react";
import { useFetch } from "../../hooks/useFetch";
import { BackendAPI } from "../../services/BackendApi";
import StatusChip from "../Commons/StatusChip";
import moment from 'moment';

const HistoryDetailModal = ({ open, emergencyId, onClose }) => {
    const { data: emergency } = useFetch(
        () => BackendAPI.emergencies.getById(emergencyId),
        [emergencyId],
    );
    const { data: rooms } = useFetch(() => BackendAPI.rooms.getAll(), []);
    const { data: allNotes } = useFetch(() => BackendAPI.notes.getAll(), []);

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

    if (!emergency) return null;

    return (
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
                        <Typography variant="subtitle2" fontWeight="bold" color="primary.dark" sx={{ mb: 1 }}>
                            DATOS DEL PACIENTE
                        </Typography>
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
                                <StatusChip status={row.status} />
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
                                            <Chip key={d.id} label={d.name} size="small" color="info" />
                                        ))}
                                    </Box>
                                </Box>
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
                                <Box key={note.id} sx={{ mb: 0.5, p: 0.75, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
                                    <Typography variant="body2">{note.note}</Typography>
                                </Box>
                            ))
                        )}
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: '0.75rem 1.25rem' }}>
                <Button onClick={onClose} variant="contained" color="error">Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default HistoryDetailModal;
