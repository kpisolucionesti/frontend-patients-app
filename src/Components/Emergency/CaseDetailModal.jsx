import { Autocomplete, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { ArrowBack, Cancel, Edit, MedicalServices } from "@mui/icons-material";
import WarningIcon from '@mui/icons-material/Warning';
import DownloadIcon from '@mui/icons-material/Download';
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
import DocumentsPanel from '../Commons/DocumentsPanel';
import usePermissions from "../../hooks/usePermissions";
import { CLASSIFICATION_OPTIONS } from '../../constants';
import { medicalHistoryApi } from '../../services/medicalHistoryApi';
import { generateEmergencyReport } from '../../services/medicalHistoryReport';
import moment from 'moment';

const FieldItem = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 0.5, py: 0.15 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 90, fontSize: '0.68rem' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontSize: '0.73rem', color: value ? 'text.primary' : 'text.disabled', wordBreak: 'break-word' }}>
      {value || '—'}
    </Typography>
  </Box>
);

const SectionHeader = ({ title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
    <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 0.5 }}>
      {title}
    </Typography>
    <Divider sx={{ flex: 1 }} />
  </Box>
);

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
            d.status === 'active' && d.id !== row.primary_doctor?.id && !consultingDoctors.find((c) => c.id === d.id)
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

    const classificationLabel = useMemo(() => {
        const found = CLASSIFICATION_OPTIONS.find((c) => c.key === row.classification);
        return found?.label || row.classification || null;
    }, [row.classification]);

    if (!emergency) return null;

    return (
        <>
            <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
                <DialogTitle textAlign="center" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', py: 0.75, fontSize: '0.9rem' }}>
                    DETALLE DE EMERGENCIA
                </DialogTitle>
                <DialogContent sx={{
                    pt: 2,
                    '&:first-of-type': { pt: 3 },
                    '& .MuiTypography-root': { fontSize: '0.75rem' },
                }}>
                    {isViewingHistory && (
                        <Button variant="outlined" startIcon={<ArrowBack />} size="small" onClick={handleBackToCurrent} sx={{ mb: 1.5, fontSize: '0.7rem' }}>
                            Volver a emergencia actual
                        </Button>
                    )}

                    {patient?.disabled && (
                        <Box sx={{ bgcolor: '#212121', color: 'white', p: 0.5, borderRadius: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <WarningIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption" fontWeight={700}>FALLECIDO — Solo lectura</Typography>
                        </Box>
                    )}

                    {/* Patient Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                                {patient.name} {patient.lastname || ''}
                            </Typography>
                            <StatusChip status={row.status} />
                            {classificationLabel && (
                                <Chip label={classificationLabel} size="small" sx={{
                                    height: 20, fontSize: '0.6rem',
                                    bgcolor: CLASSIFICATION_OPTIONS.find((c) => c.key === row.classification)?.color || '#999',
                                    color: 'white', fontWeight: 600,
                                }} />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                Ingreso: {row.ingress_date ? moment(row.ingress_date).format('DD/MM/YYYY HH:mm') : moment(row.created_at).format('DD/MM/YYYY HH:mm')}
                            </Typography>
                            {effectiveReadOnly && row.created_by?.name && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    Creado por: {row.created_by.name}
                                </Typography>
                            )}
                        </Box>
                        {!effectiveReadOnly && (
                            <Box sx={{ display: 'flex', gap: 0.25 }}>
                                {hasPerm('pacientes.edit') && (
                                    <Tooltip title="Editar datos del paciente" arrow>
                                        <IconButton size="small" color="warning" onClick={() => setShowEditPatient(true)} sx={{ p: 0.25 }}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {hasPerm('emergencia.assign_room') && <AsignRoom row={row} onStatusChange={handleSubActionRefresh} />}
                                {hasPerm('emergencia.edit') && <IngressPatientModal row={row} onStatusChange={handleSubActionClose} />}
                                {hasPerm('emergencia.discharge') && <ReleasePatient row={row} onStatusChange={handleSubActionClose} />}
                                {hasPerm('emergencia.edit') && row.status === 1 && (
                                    <Tooltip title="Anular Emergencia" arrow>
                                        <IconButton size="small" color="error" onClick={() => setCancelDialogOpen(true)} sx={{ p: 0.25 }}>
                                            <Cancel fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* Patient Data */}
                    <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
                        <SectionHeader title="PACIENTE" />
                        <Grid container spacing={0}>
                            <Grid item xs={6}><FieldItem label="CI" value={patient.ci} /></Grid>
                            <Grid item xs={6}><FieldItem label="Edad" value={patient.age ? `${patient.age} años` : ''} /></Grid>
                            <Grid item xs={6}><FieldItem label="Género" value={patient.gender} /></Grid>
                            <Grid item xs={6}><FieldItem label="F. Nac" value={patient.birthday ? moment(patient.birthday, 'YYYY-MM-DD').format('DD/MM/YYYY') : ''} /></Grid>
                        </Grid>
                    </Box>

                    {/* Emergency Data */}
                    <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
                        <SectionHeader title={isViewingHistory ? 'CASO ANTERIOR' : 'EMERGENCIA'} />
                        <Grid container spacing={0}>
                            <Grid item xs={12}><FieldItem label="Diagnóstico" value={row.diagnostic} /></Grid>
                            <Grid item xs={12}><FieldItem label="Plan" value={row.treatment} /></Grid>
                            <Grid item xs={6}><FieldItem label="Médico" value={row.primary_doctor?.name || 'No asignado'} /></Grid>
                            <Grid item xs={6}><FieldItem label="Ubicación" value={patientRoom?.name || 'No asignada'} /></Grid>
                            {effectiveReadOnly && row.created_at && (
                                <Grid item xs={6}><FieldItem label="H. Ingreso" value={moment(row.created_at).format('DD/MM/YYYY HH:mm')} /></Grid>
                            )}
                            {effectiveReadOnly && row.egress_at && (
                                <Grid item xs={6}><FieldItem label="H. Egreso" value={moment(row.egress_at).format('DD/MM/YYYY HH:mm')} /></Grid>
                            )}
                            <Grid item xs={6}><FieldItem label="Clasificación" value={classificationLabel} /></Grid>
                            {!effectiveReadOnly && (
                                <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                    {hasPerm('emergencia.edit') && <EmergencyEditButton row={row} onRefresh={refetch} />}
                                </Grid>
                            )}
                        </Grid>
                        {row.observations && (
                            <Box sx={{ mt: 0.5, p: 0.75, bgcolor: '#fff8e1', borderRadius: 1 }}>
                                <Typography variant="caption" fontWeight={600} sx={{ color: '#f57f17', fontSize: '0.65rem' }}>Observaciones</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.73rem', mt: 0.25 }}>{row.observations}</Typography>
                            </Box>
                        )}
                        {row.status === 4 && row.medical_exit && (
                            <Box sx={{ mt: 0.5, p: 0.75, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #ef5350' }}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: '#c62828', fontSize: '0.65rem' }}>EMERGENCIA ANULADA</Typography>
                                <Typography variant="body2" sx={{ fontSize: '0.73rem', mt: 0.25, color: '#c62828' }}>{row.medical_exit}</Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                            {row.status !== 4 && row.medical_exit && <FieldItem label="Alta Médica" value={row.medical_exit} />}
                            {row.transfer && <FieldItem label="Área Ingreso" value={row.transfer} />}
                            {row.cause_of_death && <FieldItem label="Causa Muerte" value={row.cause_of_death} />}
                        </Box>
                    </Box>

                    {/* Doctors */}
                    <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
                        <SectionHeader title="MÉDICOS" />
                        <Grid container spacing={0}>
                            <Grid item xs={6}><FieldItem label="Principal" value={row.primary_doctor?.name || 'No asignado'} /></Grid>
                            {consultingDoctors.length > 0 && (
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', gap: 0.25, flexWrap: 'wrap', py: 0.15 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.68rem', mr: 0.5 }}>
                                            Interconsultas:
                                        </Typography>
                                        {consultingDoctors.map((d) => (
                                            <Chip key={d.id} label={d.name} size="small" color="info"
                                                onDelete={!effectiveReadOnly && hasPerm('emergencia.edit') ? () => handleRemoveInterconsulta(d.id) : undefined}
                                                sx={{ height: 18, '& .MuiChip-label': { fontSize: '0.6rem', px: 0.5 } }} />
                                        ))}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                        {!effectiveReadOnly && hasPerm('emergencia.edit') && availableConsultingDoctors.length > 0 && (
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                <Autocomplete size="small" fullWidth
                                    options={availableConsultingDoctors}
                                    getOptionLabel={(option) => option.name}
                                    value={availableConsultingDoctors.find((d) => d.id === interconsultaInput) || null}
                                    onChange={(_event, newValue) => setInterconsultaInput(newValue?.id || '')}
                                    renderInput={(params) => (<TextField variant="standard" {...params} label="Agregar Interconsulta" sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' } }} />)}
                                    sx={{ '& .MuiAutocomplete-option': { fontSize: '0.7rem' } }} />
                                <Tooltip title="Agregar Interconsulta" arrow>
                                    <span><IconButton color="primary" onClick={handleAddInterconsulta} disabled={!interconsultaInput}><MedicalServices /></IconButton></span>
                                </Tooltip>
                            </Stack>
                        )}
                    </Box>

                    {/* Medical Plan */}
                    <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
                        <SectionHeader title="PLAN MÉDICO" />
                        <MedicalPlanSection emergencyId={activeEmergencyId} readOnly={effectiveReadOnly} />
                    </Box>

                    {/* Notes */}
                    <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
                        <SectionHeader title="NOTAS" />
                        {patientNotes.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.73rem' }}>Sin notas</Typography>
                        ) : (
                            patientNotes.map((note) => (
                                effectiveReadOnly ? (
                                    <Box key={note.id} sx={{ mb: 0.5, p: 0.75, bgcolor: 'white', borderRadius: 1, border: '1px solid #eee' }}>
                                        <Typography variant="body2" sx={{ fontSize: '0.73rem', whiteSpace: 'pre-wrap' }}>{note.note}</Typography>
                                        {note.created_by?.name && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', mt: 0.25, display: 'block' }}>
                                                — {note.created_by.name} {note.created_at ? moment(note.created_at).format('DD/MM/YYYY HH:mm') : ''}
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <NoteItem key={note.id} note={note} onRefresh={refetchNotes} canEdit={hasPerm('notes.edit')} canDelete={hasPerm('notes.delete')} />
                                )
                            ))
                        )}
                        {!effectiveReadOnly && hasPerm('notes.create') && (
                            <Box sx={{ mt: 1 }}><AddNoteInline emergencyId={activeEmergencyId} patientId={patientId} onAdded={refetchNotes} /></Box>
                        )}
                    </Box>

                    {/* Documents */}
                    {emergency.status === 2 && (
                      <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
                        <SectionHeader title="DOCUMENTOS" />
                        {!effectiveReadOnly && (
                          <DocumentsPanel
                            attachableType="Emergency"
                            attachableId={activeEmergencyId}
                          />
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={async () => {
                            const data = await medicalHistoryApi.getForEmergency(activeEmergencyId);
                            generateEmergencyReport(data);
                          }}
                          sx={{ mt: 1, fontSize: '0.7rem' }}
                        >
                          Descargar Historia Clínica (PDF)
                        </Button>
                      </Box>
                    )}

                    {/* Case History */}
                    {!hideHistory && allEmergencies.length > 0 && (
                        <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
                            <SectionHeader title="HISTORIAL DE CASOS" />
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'grey.700' }}>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.65rem', py: 0.5 }}>F. Ingreso</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.65rem', py: 0.5 }}>Médico Tratante</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.65rem', py: 0.5 }}>Diagnóstico</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.65rem', py: 0.5 }}>Estatus</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allEmergencies.map((e) => {
                                            const isCurrentEmergency = e.id === emergencyId;
                                            const isActiveView = e.id === activeEmergencyId;
                                            return (
                                                <TableRow key={e.id} hover onClick={() => handleHistoryRowClick(e.id)}
                                                    sx={{ cursor: 'pointer', bgcolor: isActiveView ? 'action.selected' : 'inherit', '&:hover': { bgcolor: 'action.hover' } }}>
                                                    <TableCell sx={{ fontSize: '0.65rem', py: 0.5 }}>
                                                        {moment(e.ingress_date).format('DD/MM/YYYY')}
                                                        {isCurrentEmergency && <Chip label="ACTUAL" size="small" color="primary" sx={{ ml: 0.5, height: 16, '& .MuiChip-label': { fontSize: '0.55rem', px: 0.5 } }} />}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.65rem', py: 0.5 }}>{e.primary_doctor?.name || '-'}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.65rem', py: 0.5 }}>{e.diagnostic || '-'}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.65rem', py: 0.5 }}><StatusChip status={e.status} /></TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: '0.5rem 1rem' }}>
                    <Button onClick={onClose} variant="outlined" color="error" sx={{ fontSize: '0.7rem' }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={cancelDialogOpen} onClose={() => { setCancelDialogOpen(false); setCancelReason(''); }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#616161', color: 'white', fontSize: '0.8rem' }}>
                    ANULAR EMERGENCIA
                </DialogTitle>
                <DialogContent style={{ paddingTop: 24 }}>
                    <TextField variant="standard" fullWidth size="small" required multiline rows={3}
                        label="Motivo de anulación" value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        error={!cancelReason} helperText={!cancelReason ? 'Requerido' : ''}
                        sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
                </DialogContent>
                <DialogActions>
                    <Button size="small" variant="outlined" onClick={() => { setCancelDialogOpen(false); setCancelReason(''); }}>Cancelar</Button>
                    <Button size="small" variant="outlined" color="error" onClick={handleCancelEmergency} disabled={!cancelReason}>
                        Anular Emergencia
                    </Button>
                </DialogActions>
            </Dialog>

            {!readOnly && showEditPatient && (
                <EditPatientData open={showEditPatient} onClose={() => setShowEditPatient(false)} patient={patient} onSaved={handlePatientSaved} />
            )}

        </> 
    );
};

export default CaseDetailModal;
