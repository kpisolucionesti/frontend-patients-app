import { useMemo } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DescriptionIcon from '@mui/icons-material/Description';
import BiotechIcon from '@mui/icons-material/Biotech';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import InterconsultationsDetail from '../../Components/Portal/InterconsultationsDetail';
import SectionHeader from '../../shared/ui/section-header';
import VitalSignsCard from '../../features/emergency/vital-signs-card';
import NotesSection from '../../features/emergency/notes-section';
import NursingNotesSection from '../../features/emergency/nursing-notes-section';
import PatientAppointmentsSummary from '../../shared/ui/patient-appointments-summary';

const PatientDashboard = ({ patient, stats, emergencyId, vitalSigns = [], onVitalSignsCreated, onOpenLabPanel, readOnly }) => {

  const { user } = useAuth();
  const isDeceased = patient?.disabled;
  const effectiveReadOnly = readOnly || isDeceased;

  const { data: notesData, refetch: refetchNotes } = useFetch(
    () => emergencyId ? BackendAPI.notes.getAll({ emergency_id: emergencyId }) : Promise.resolve([]),
    [emergencyId],
  );
  const patientNotes = useMemo(() => (notesData || []).filter((n) => n.note_type !== 'nursing'), [notesData]);
  const nursingNotes = useMemo(() => (notesData || []).filter((n) => n.note_type === 'nursing'), [notesData]);

  const { data: documents = [] } = useFetch(
    () => emergencyId ? BackendAPI.documents.list('Emergency', emergencyId) : Promise.resolve([]),
    [emergencyId],
  );
  const odsOrders = useMemo(
    () => (documents || []).filter((d) => d.order_number).slice(0, 10),
    [documents],
  );

  const indicacionesMedicas = useMemo(
    () => (documents || []).filter((d) => d.report_type === 'indicaciones_medicas'),
    [documents],
  );

  const STATUS_CONFIG = {
    pending: { label: 'Pendiente', color: 'warning' },
    in_progress: { label: 'En Proceso', color: 'info' },
    completed: { label: 'Realizado', color: 'success' },
    delivered: { label: 'Entregado', color: 'primary' },
    cancelled: { label: 'Cancelado', color: 'default' },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {emergencyId && (
        <>
          <Paper sx={{ p: 1.5 }}>
            <SectionHeader icon={<FavoriteIcon sx={{ fontSize: 16 }} />} label="SIGNOS VITALES" color="error.main" />
            <VitalSignsCard vitalSigns={vitalSigns} />
          </Paper>

          <InterconsultationsDetail emergencyId={emergencyId} readOnly={effectiveReadOnly} />
        </>
      )}

      {emergencyId && (
        <Paper sx={{ p: 1.5 }}>
          <SectionHeader icon={<AssignmentIcon sx={{ fontSize: 16 }} />} label="INDICACIONES MÉDICAS" color="primary.main" />
          {indicacionesMedicas.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Sin indicaciones registradas</Typography>
          ) : (
            indicacionesMedicas.map((ind) => (
              <Box key={ind.id} sx={{ py: 0.4, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                  {ind.created_at ? new Date(ind.created_at).toLocaleDateString() + ' ' + new Date(ind.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  {ind.uploaded_by?.name ? ' · ' + ind.uploaded_by.name : ''}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.73rem', mt: 0.15 }}>{ind.description}</Typography>
              </Box>
            ))
          )}
        </Paper>
      )}

      {emergencyId && (
        <Paper sx={{ p: 1.5 }}>
          <SectionHeader icon={<BiotechIcon sx={{ fontSize: 16 }} />} label="ÓRDENES DE SERVICIO" color="secondary.main" />
          {odsOrders.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Sin órdenes de servicio</Typography>
          ) : (
            odsOrders.map((o) => (
              <Box key={o.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.secondary', minWidth: 130 }}>
                  {o.created_at ? new Date(o.created_at).toLocaleDateString() + ' ' + new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500, flex: 1 }}>
                  {o.study_classification?.name || o.study_type || '—'}
                </Typography>
                <Chip
                  label={STATUS_CONFIG[o.status]?.label || o.status || '—'}
                  size="small"
                  color={STATUS_CONFIG[o.status]?.color || 'default'}
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              </Box>
            ))
          )}
        </Paper>
      )}

      {emergencyId && (
        <Paper sx={{ p: 1.5 }}>
          <SectionHeader icon={<DescriptionIcon sx={{ fontSize: 16 }} />} label="NOTAS DE ENFERMERÍA" color="success.main" />
          <NursingNotesSection nursingNotes={nursingNotes} />
        </Paper>
      )}

      {emergencyId && (
        <Paper sx={{ p: 1.5 }}>
          <NotesSection
            patientNotes={patientNotes}
            emergencyId={emergencyId}
            patientId={patient?.id}
            readOnly={effectiveReadOnly}
            onRefresh={refetchNotes}
          />
        </Paper>
      )}

      <PatientAppointmentsSummary patientId={patient?.id} />
    </Box>
  );
};

export default PatientDashboard;
