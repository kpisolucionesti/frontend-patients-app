import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Typography } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React, { useMemo } from "react";
import { useFetch } from "../../hooks/useFetch";
import { BackendAPI } from "../../services/BackendApi";
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

const HospitalizationDetailModal = ({ open, hospitalizationId, onClose }) => {
  const { data: hospitalization, loading } = useFetch(
    () => hospitalizationId ? BackendAPI.hospitalizations.getById(hospitalizationId) : Promise.resolve(null),
    [hospitalizationId],
  );

  const h = useMemo(() => hospitalization || {}, [hospitalization]);
  const emergency = h.emergency || {};
  const patient = emergency.patient || {};
  const isActive = h.status === 'active';

  return (
    <Dialog fullWidth maxWidth='md' open={open} onClose={onClose}>
      <DialogTitle textAlign="center" sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 'bold', py: 0.75, fontSize: '0.9rem' }}>
        DETALLE DE HOSPITALIZACIÓN
      </DialogTitle>
      <DialogContent sx={{
        pt: 3,
        '&:first-of-type': { pt: 3 },
        '& .MuiTypography-root': { fontSize: '0.75rem' },
      }}>
        {loading ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>Cargando...</Typography>
        ) : !hospitalization ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No se encontró la hospitalización</Typography>
        ) : (
          <>
            {/* Patient Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                  {patient.name} {patient.lastname || ''}
                </Typography>
                <Chip
                  label={isActive ? 'Activo' : 'Alta'}
                  size="small"
                  color={isActive ? 'warning' : 'success'}
                  sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.6rem', px: 0.5 } }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Ingreso: {h.admission_date ? moment(h.admission_date).format('DD/MM/YYYY HH:mm') : '-'}
                </Typography>
                {h.discharge_date && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    Alta: {moment(h.discharge_date).format('DD/MM/YYYY HH:mm')}
                  </Typography>
                )}
                {h.length_of_stay_days != null && (
                  <Chip
                    label={`${h.length_of_stay_days} día${h.length_of_stay_days !== 1 ? 's' : ''}`}
                    size="small"
                    color={h.length_of_stay_days > 7 ? 'error' : h.length_of_stay_days > 3 ? 'warning' : 'success'}
                    sx={{ height: 18, '& .MuiChip-label': { fontSize: '0.55rem', px: 0.5 } }}
                  />
                )}
              </Box>
            </Box>

            {/* Datos del Paciente */}
            <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
              <SectionHeader title="PACIENTE" />
              <Grid container spacing={0}>
                <Grid item xs={6}><FieldItem label="CI" value={patient.ci} /></Grid>
                <Grid item xs={6}><FieldItem label="Edad" value={patient.age ? `${patient.age} años` : ''} /></Grid>
                <Grid item xs={6}><FieldItem label="Género" value={patient.gender} /></Grid>
                <Grid item xs={6}><FieldItem label="F. Nac" value={patient.birthday ? moment(patient.birthday, 'YYYY-MM-DD').format('DD/MM/YYYY') : ''} /></Grid>
              </Grid>
            </Box>

            {/* Datos de Hospitalización */}
            <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
              <SectionHeader title="HOSPITALIZACIÓN" />
              <Grid container spacing={0}>
                <Grid item xs={12}><FieldItem label="Diagnóstico Ingreso" value={h.admission_diagnosis} /></Grid>
                <Grid item xs={6}><FieldItem label="Habitación" value={h.room?.name || '—'} /></Grid>
                <Grid item xs={6}><FieldItem label="Días Estancia" value={h.length_of_stay_days != null ? `${h.length_of_stay_days} días` : ''} /></Grid>
                <Grid item xs={6}><FieldItem label="Médico Tratante" value={h.attending_doctor?.name || '—'} /></Grid>
                <Grid item xs={6}><FieldItem label="Médico Admisión" value={h.admitting_doctor?.name || '—'} /></Grid>
              </Grid>
              {h.discharge_diagnosis && (
                <Box sx={{ mt: 0.5 }}>
                  <FieldItem label="Diagnóstico Alta" value={h.discharge_diagnosis} />
                </Box>
              )}
              {h.discharge_summary && (
                <Box sx={{ mt: 0.5, p: 0.75, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: '#2e7d32', fontSize: '0.65rem' }}>Resumen de Alta</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.73rem', mt: 0.25, whiteSpace: 'pre-wrap' }}>{h.discharge_summary}</Typography>
                </Box>
              )}
            </Box>

            {/* Balance Hídrico */}
            {(h.total_fluid_intake != null || h.total_fluid_output != null || h.net_fluid_balance != null) && (
              <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
                <SectionHeader title="BALANCE HÍDRICO" />
                <Grid container spacing={0}>
                  <Grid item xs={4}><FieldItem label="Ingresos" value={h.total_fluid_intake != null ? `${h.total_fluid_intake} ml` : ''} /></Grid>
                  <Grid item xs={4}><FieldItem label="Egresos" value={h.total_fluid_output != null ? `${h.total_fluid_output} ml` : ''} /></Grid>
                  <Grid item xs={4}>
                    <FieldItem label="Neto" value={h.net_fluid_balance != null ? `${h.net_fluid_balance >= 0 ? '+' : ''}${h.net_fluid_balance} ml` : ''} />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Cirugías */}
            {h.surgeries && h.surgeries.length > 0 && (
              <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1, mb: 1.5 }}>
                <SectionHeader title="CIRUGÍAS" />
                {h.surgeries.map((s, i) => (
                  <Box key={s.id || i} sx={{ p: 0.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #eee', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.73rem', fontWeight: 600 }}>{s.surgery_type || s.name || 'Cirugía'}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      {s.scheduled_date ? moment(s.scheduled_date).format('DD/MM/YYYY') : ''}
                      {s.doctor?.name ? ` — ${s.doctor.name}` : ''}
                      {s.status ? ` — ${s.status}` : ''}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Datos de Emergencia asociada (si existe) */}
            {emergency.id && (
              <Box sx={{ bgcolor: '#fff3e0', borderRadius: 1, p: 1, mb: 1.5 }}>
                <SectionHeader title="EMERGENCIA ASOCIADA" />
                <Grid container spacing={0}>
                  <Grid item xs={6}><FieldItem label="Diagnóstico" value={emergency.diagnostic} /></Grid>
                  <Grid item xs={6}><FieldItem label="Clasificación" value={emergency.classification} /></Grid>
                </Grid>
                <Box sx={{ mt: 0.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => window.open(`/patients/atencion?tab=emergencias&emergency_id=${emergency.id}`, '_blank')}
                    sx={{ fontSize: '0.65rem', py: 0.15 }}
                  >
                    Ver Emergencia
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '0.5rem 1rem' }}>
        <Button onClick={onClose} variant="outlined" color="error" sx={{ fontSize: '0.7rem' }}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HospitalizationDetailModal;
