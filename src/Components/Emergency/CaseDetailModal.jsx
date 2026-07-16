import { Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { ArrowBack, Cancel, Edit, MedicalServices } from "@mui/icons-material";
import WarningIcon from '@mui/icons-material/Warning';
import MedicalPlanSection from "./MedicalPlanSection";
import NoteItem from "./NoteItem";
import AddNoteInline from "./AddNoteInline";
import EmergencyEditButton from "./EmergencyEditButton";
import React, { useCallback, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useFetch } from "../../hooks/useFetch";
import AsignRoom from "../Board/asignRoomModal";
import EditPatientData from "../Patients/editPatientDataModal";
import IngressPatientModal from "../Board/IngressPatientModal";
import ReleasePatient from "../Board/releasePatientModal";
import StatusChip from "../Commons/StatusChip";
import usePermissions from "../../hooks/usePermissions";
import moment from 'moment';

const CaseDetailModal = ({ open, emergencyId, onClose, onDataChange, readOnly, hideHistory }) => {
    const permissions = usePermissions();
    const hasPerm = useCallback((p) => permissions.includes(p), [permissions]);
    const [historyEmergencyId, setHistoryEmergencyId] = useState(null);
    const [showEditPatient, setShowEditPatient] = useState(false);
    const [interconsultaInput, setInterconsultaInput] = useState('');
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const activeEmergencyId = historyEmergencyId || emergencyId;
    const isViewingHistory = !!historyEmergencyId;

    const { data: emergency, refetch } = useFetch(
        () => BackendAPI.emergencies.getById(activeEmergencyId),
        [activeEmergencyId],
    );
    const { data: patientEmergencies } = useFetch(
        () => emergency?.patient?.id ? BackendAPI.emergencies.getAll({ patient_id: emergency.patient.id, per_page: 10000 }) : Promise.resolve({ data: [] }),
        [emergency?.patient?.id],
    );

    const row = useMemo(() => emergency || {}, [emergency]);
    const patient = useMemo(() => row.patient || {}, [row.patient]);
    const patientId = patient.id || row.patient_id;

    const { data: allNotes, refetch: refetchNotes } = useFetch(
        () => activeEmergencyId ? BackendAPI.notes.getAll({ emergency_id: activeEmergencyId }) : Promise.resolve([]),
        [activeEmergencyId],
    );
    const { data: doctors } = useFetch(() => BackendAPI.doctors.getAll(), []);
    const { data: rooms } = useFetch(() => BackendAPI.rooms.getAll(), []);
    const patientNotes = useMemo(() => allNotes || [], [allNotes]);

    const allEmergencies = useMemo(() => patientEmergencies?.data || [], [patientEmergencies]);

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

    const handleCancelEmergency = useCallback(async () => {
        if (!cancelReason) return;
        try {
            await BackendAPI.emergencies.update({
                id: row.id,
                status: 4,
                medical_exit: cancelReason,
            });
            setCancelDialogOpen(false);
            setCancelReason('');
            handleSubActionClose();
        } catch {
            alert("Error al anular emergencia");
        }
    }, [row.id, cancelReason, handleSubActionClose]);

    const handleBackToCurrent = useCallback(() => {
        setHistoryEmergencyId(null);
    }, []);

    const handleHistoryRowClick = useCallback((eid) => {
        if (eid === activeEmergencyId) return;
        setHistoryEmergencyId(eid);
    }, [activeEmergencyId]);

    const effectiveReadOnly = readOnly || isViewingHistory || patient?.disabled;

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
                        {isViewingHistory && (
                            <Button startIcon={<ArrowBack />} size="small" onClick={handleBackToCurrent} sx={{ alignSelf: 'flex-start' }}>
                                Volver a emergencia actual
                            </Button>
                        )}

                        <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 2 }}>
                            {patient?.disabled && (
                                <Box sx={{ bgcolor: '#212121', color: 'white', p: 0.5, borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <WarningIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="caption" fontWeight={700}>FALLECIDO — Solo lectura</Typography>
                                </Box>
                            )}
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary.dark">
                                    DATOS DEL PACIENTE
                                </Typography>
                                {effectiveReadOnly ? (
                                    <StatusChip status={row.status} />
                                ) : (
                                    <Stack direction="row" spacing={0.5}>
                                        {hasPerm('pacientes.edit') && (
                                            <Tooltip title="Editar datos del paciente" arrow>
                                                <IconButton size="small" color="warning" onClick={() => setShowEditPatient(true)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {hasPerm('emergencia.assign_room') && <AsignRoom row={row} onStatusChange={handleSubActionRefresh} />}
                                        {hasPerm('emergencia.edit') && <IngressPatientModal row={row} onStatusChange={handleSubActionClose} />}
                                        {hasPerm('emergencia.discharge') && <ReleasePatient row={row} onStatusChange={handleSubActionClose} />}
                                        {hasPerm('emergencia.edit') && row.status === 1 && (
                                            <Tooltip title="Anular Emergencia" arrow>
                                                <IconButton size="small" color="error" onClick={() => setCancelDialogOpen(true)}>
                                                    <Cancel fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                )}
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
                                        {isViewingHistory ? 'DATOS DEL CASO ANTERIOR' : 'DATOS DE LA EMERGENCIA'}
                                    </Typography>
                                    {effectiveReadOnly ? (
                                        <StatusChip status={row.status} />
                                    ) : (
                                        hasPerm('emergencia.edit') && <EmergencyEditButton row={row} onRefresh={refetch} />
                                    )}
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
                                        <Typography variant="body2">{moment(row.ingress_date).format('DD/MM/YYYY')}</Typography>
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
                                    {row.cause_of_death && (
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Causa Muerte:</Typography>
                                            <Typography variant="body2">{row.cause_of_death}</Typography>
                                        </Stack>
                                    )}
                                    {effectiveReadOnly && row.created_at && (
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Hora Ingreso:</Typography>
                                            <Typography variant="body2">{moment(row.created_at).format('DD/MM/YYYY HH:mm')}</Typography>
                                        </Stack>
                                    )}
                                    {effectiveReadOnly && row.egress_at && (
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Hora Egreso:</Typography>
                                            <Typography variant="body2">{moment(row.egress_at).format('DD/MM/YYYY HH:mm')}</Typography>
                                        </Stack>
                                    )}
                                    {effectiveReadOnly && row.created_by?.name && (
                                        <Stack direction="row" spacing={1}>
                                            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 110 }}>Creado por:</Typography>
                                            <Typography variant="body2">{row.created_by.name}</Typography>
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
                                                <Chip
                                                    key={d.id}
                                                    label={d.name}
                                                    size="small"
                                                    color="info"
                                                    onDelete={!effectiveReadOnly && hasPerm('emergencia.edit') ? () => handleRemoveInterconsulta(d.id) : undefined}
                                                />
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                                {!effectiveReadOnly && hasPerm('emergencia.edit') && availableConsultingDoctors.length > 0 && (
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                        <Autocomplete
                                            size="small"
                                            fullWidth
                                            options={availableConsultingDoctors}
                                            getOptionLabel={(option) => option.name}
                                            value={availableConsultingDoctors.find((d) => d.id === interconsultaInput) || null}
                                            onChange={(_event, newValue) => setInterconsultaInput(newValue?.id || '')}
                                            renderInput={(params) => (
                                                <TextField variant="standard" {...params} label="Agregar Interconsulta" />
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

                        <Box sx={{ bgcolor: '#fff8e1', p: 1.5, borderRadius: 2 }}>
                            <MedicalPlanSection emergencyId={activeEmergencyId} readOnly={effectiveReadOnly} />
                        </Box>

                        <Box sx={{ bgcolor: '#f3e5f5', p: 1.5, borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="secondary.dark" sx={{ mb: 1 }}>
                                NOTAS
                            </Typography>
                            {patientNotes.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">Sin notas</Typography>
                            ) : effectiveReadOnly ? (
                                patientNotes.map((note) => (
                                    <Box key={note.id} sx={{ mb: 0.5, p: 0.75, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 1 }}>
                                        <Typography variant="body2">{note.note}</Typography>
                                    </Box>
                                ))
                            ) : (
                                patientNotes.map((note) => (
                                    <NoteItem key={note.id} note={note} onRefresh={refetchNotes} canEdit={hasPerm('notes.edit')} canDelete={hasPerm('notes.delete')} />
                                ))
                            )}
                            {!effectiveReadOnly && hasPerm('notes.create') && (
                                <Box sx={{ mt: 1 }}>
                                    <AddNoteInline emergencyId={activeEmergencyId} patientId={patientId} onAdded={refetchNotes} />
                                </Box>
                            )}
                        </Box>

                        {!hideHistory && allEmergencies.length > 1 && (
                            <Box sx={{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" sx={{ mb: 1 }}>
                                    HISTORIAL DE CASOS
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'grey.700' }}>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>F. Ingreso</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>Medico Tratante</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>Diagnostico</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>Estatus</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {allEmergencies.map((e) => {
                                                const isCurrentEmergency = e.id === emergencyId;
                                                const isActiveView = e.id === activeEmergencyId;
                                                return (
                                                    <TableRow
                                                        key={e.id}
                                                        hover
                                                        onClick={() => handleHistoryRowClick(e.id)}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            bgcolor: isActiveView ? 'action.selected' : 'inherit',
                                                            '&:hover': { bgcolor: 'action.hover' },
                                                        }}
                                                    >
                                                        <TableCell sx={{ fontSize: '0.7rem' }}>
                                                            {moment(e.ingress_date).format('DD/MM/YYYY')}
                                                            {isCurrentEmergency && (
                                                                <Chip label="ACTUAL" size="small" color="primary" sx={{ ml: 1, height: 18, '& .MuiChip-label': { fontSize: '0.6rem', px: 0.5 } }} />
                                                            )}
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.7rem' }}>{e.primary_doctor?.name || '-'}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.7rem' }}>{e.diagnostic || '-'}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.7rem' }}>
                                                            <StatusChip status={e.status} />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: '0.75rem 1.25rem' }}>
                    <Button onClick={onClose} variant="contained" color="error">Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelDialogOpen} onClose={() => { setCancelDialogOpen(false); setCancelReason(''); }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#616161', color: 'white', fontSize: '0.85rem' }}>
                    ANULAR EMERGENCIA
                </DialogTitle>
                <DialogContent style={{ paddingTop: 24 }}>
                    <TextField variant="standard" fullWidth size="small" required multiline rows={3}
                        label="Motivo de anulación" value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        error={!cancelReason}
                        helperText={!cancelReason ? 'Requerido' : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button size="small" onClick={() => { setCancelDialogOpen(false); setCancelReason(''); }}>Cancelar</Button>
                    <Button size="small" variant="contained" color="error" onClick={handleCancelEmergency}
                        disabled={!cancelReason}>
                        Anular Emergencia
                    </Button>
                </DialogActions>
            </Dialog>

            {!readOnly && showEditPatient && (
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

export default CaseDetailModal;
