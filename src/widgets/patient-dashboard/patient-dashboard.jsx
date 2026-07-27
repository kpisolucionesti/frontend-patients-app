import { useState, useMemo } from 'react';
import { Box, Paper, Button } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DescriptionIcon from '@mui/icons-material/Description';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import MedicalPlansDetail from '../../Components/Emergency/MedicalPlansDetail';
import LabResultsQuickModal from '../../Components/Emergency/LabResultsQuickModal';
import InterconsultationsDetail from '../../Components/Portal/InterconsultationsDetail';
import ParaclinicalStudiesDetail from '../../Components/Portal/ParaclinicalStudiesDetail';
import SectionHeader from '../../shared/ui/section-header';
import VitalSignsCard from '../../features/emergency/vital-signs-card';
import NotesSection from '../../features/emergency/notes-section';
import NursingNotesSection from '../../features/emergency/nursing-notes-section';
import PatientAppointmentsSummary from '../../shared/ui/patient-appointments-summary';

const PatientDashboard = ({ patient, stats, emergencyId, vitalSigns = [], onVitalSignsCreated, onOpenLabPanel, readOnly }) => {
  const [labQuickOpen, setLabQuickOpen] = useState(false);

  const { user } = useAuth();
  const isDeceased = patient?.disabled;
  const effectiveReadOnly = readOnly || isDeceased;

  const { data: notesData, refetch: refetchNotes } = useFetch(
    () => emergencyId ? BackendAPI.notes.getAll({ emergency_id: emergencyId }) : Promise.resolve([]),
    [emergencyId],
  );
  const patientNotes = useMemo(() => (notesData || []).filter((n) => n.note_type !== 'nursing'), [notesData]);
  const nursingNotes = useMemo(() => (notesData || []).filter((n) => n.note_type === 'nursing'), [notesData]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {emergencyId && (
        <>
          {/* ── Signos Vitales ── */}
          <Paper sx={{ p: 1.5 }}>
            <SectionHeader icon={<FavoriteIcon sx={{ fontSize: 16 }} />} label="SIGNOS VITALES" color="error.main" />
            <VitalSignsCard vitalSigns={vitalSigns} />
          </Paper>

          {/* ── Laboratorios ── */}
          <Paper sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <SectionHeader icon={<ScienceIcon sx={{ fontSize: 16 }} />} label="LABORATORIOS" color="primary.main" />
              <Button size="small" sx={{ fontSize: '0.7rem', minWidth: 'auto' }} onClick={() => setLabQuickOpen(true)}>
                Ver resultados
              </Button>
            </Box>
          </Paper>

          <MedicalPlansDetail emergencyId={emergencyId} readOnly={effectiveReadOnly} doctorId={Number(user?.doctor_id) || null} />
          <InterconsultationsDetail emergencyId={emergencyId} readOnly={effectiveReadOnly} />
          <ParaclinicalStudiesDetail emergencyId={emergencyId} readOnly={effectiveReadOnly} />
        </>
      )}

      {/* ── Notas ── */}
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

      {/* ── Notas de Enfermería ── */}
      {emergencyId && (
        <Paper sx={{ p: 1.5 }}>
          <SectionHeader icon={<DescriptionIcon sx={{ fontSize: 16 }} />} label="NOTAS DE ENFERMERÍA" color="success.main" />
          <NursingNotesSection nursingNotes={nursingNotes} />
        </Paper>
      )}

      <PatientAppointmentsSummary patientId={patient?.id} />

      {emergencyId && (
        <LabResultsQuickModal open={labQuickOpen} onClose={() => setLabQuickOpen(false)}
          emergencyId={emergencyId} patientGender={patient?.gender}
          onGoToFullPanel={() => { setLabQuickOpen(false); onOpenLabPanel?.(); }} />
      )}
    </Box>
  );
};

export default PatientDashboard;
