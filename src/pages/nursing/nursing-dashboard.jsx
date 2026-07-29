import { useState, useMemo } from 'react';
import { Box, Paper, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HotelIcon from '@mui/icons-material/Hotel';
import { BackendAPI } from '../../services/BackendApi';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFetch } from '../../hooks/useFetch';
import { useRooms } from '../../hooks/useApiData';
import { CLASSIFICATION_OPTIONS } from '../../constants';
import SectionHeader from '../../shared/ui/section-header';
import NursingDetail from '../../Components/Enfermeria/Detalle/NursingDetail';

const TRIAGE_ORDER = { red: 0, orange: 1, yellow: 2, green: 3, blue: 4 };

const triageChipStyle = (classification) => {
  const cls = CLASSIFICATION_OPTIONS.find((c) => c.key === classification);
  if (!cls) return {};
  const needsDarkText = ['yellow', 'green'].includes(classification);
  return {
    bgcolor: cls.color,
    color: needsDarkText ? '#212121' : 'white',
    fontWeight: 700,
    fontSize: '0.7rem',
    height: 20,
  };
};

const triageAccent = (classification) => {
  return CLASSIFICATION_OPTIONS.find((c) => c.key === classification)?.color || 'transparent';
};

const elapsedMinutes = (dateStr) => {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
};

const NursingDashboard = () => {
  useDocumentTitle('Enfermería');
  const [selected, setSelected] = useState(null);

  const { data: emergenciesData } = useFetch(
    () => BackendAPI.emergencies.getAll({ status: 1, per_page: 200 }),
    [],
  );
  const { data: hospitalizationsData } = useFetch(
    () => BackendAPI.hospitalizations.census(),
    [],
  );
  const { data: rooms } = useRooms();

  const sortedEmergencies = useMemo(() => {
    const list = emergenciesData?.data || [];
    return [...list].sort((a, b) => {
      const diff = (TRIAGE_ORDER[a.classification] ?? 99) - (TRIAGE_ORDER[b.classification] ?? 99);
      if (diff !== 0) return diff;
      return new Date(a.created_at || a.ingress_date).getTime() - new Date(b.created_at || b.ingress_date).getTime();
    });
  }, [emergenciesData]);

  const hospitalizations = useMemo(() => hospitalizationsData?.data || [], [hospitalizationsData]);

  const getEmergencyRoom = (patientId) => {
    if (!rooms || !patientId) return '—';
    const room = rooms.find((r) => r.patient_id === patientId);
    return room?.name || '—';
  };

  const handleSelect = (item) => {
    setSelected(item);
  };

  const handleClosePanel = () => {
    setSelected(null);
  };

  if (selected) {
    return (
      <NursingDetail
        emergencyId={selected.emergencyId}
        hospitalizationId={selected.hospitalizationId}
        patient={selected.patient}
        onBack={handleClosePanel}
      />
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto', flex: 1 }}>
      <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', color: 'primary.main' }}>
        Dashboard de Enfermería
      </Typography>

      <Paper sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <SectionHeader
            icon={<LocalHospitalIcon sx={{ fontSize: 16 }} />}
            label="EMERGENCIAS ACTIVAS (por triaje)"
            color="warning.dark"
          />
          <Chip label={sortedEmergencies.length} size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
        </Box>
        {sortedEmergencies.length > 0 ? (
          <TableContainer sx={{ borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Triage</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Paciente</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Cama</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Tiempo</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Médico</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Diagnóstico</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedEmergencies.map((e) => {
                  const cls = CLASSIFICATION_OPTIONS.find((c) => c.key === e.classification);
                  const mins = elapsedMinutes(e.created_at || e.ingress_date);
                  return (
                    <TableRow
                      key={e.id}
                      hover
                      onClick={() => handleSelect({ emergencyId: e.id, patient: e.patient })}
                      sx={{
                        cursor: 'pointer',
                        borderLeft: 3,
                        borderColor: triageAccent(e.classification),
                      }}
                    >
                      <TableCell sx={{ py: 0.5 }}>
                        {cls ? (
                          <Chip label={cls.label} size="small" sx={triageChipStyle(e.classification)} />
                        ) : (
                          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', py: 0.5, fontWeight: 600 }}>{e.patient?.name} {e.patient?.lastname}</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{getEmergencyRoom(e.patient?.id)}</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', py: 0.5, fontWeight: mins !== null && mins > 60 ? 700 : 400, color: mins !== null && mins > 60 ? 'error.main' : 'text.primary' }}>
                        {mins !== null ? (mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`) : '—'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{e.primary_doctor?.name || '—'}</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', py: 0.5, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.diagnostic || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Sin emergencias activas</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <SectionHeader
            icon={<HotelIcon sx={{ fontSize: 16 }} />}
            label="HOSPITALIZACIONES ACTIVAS"
            color="success.main"
          />
          <Chip label={hospitalizations.length} size="small" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
        </Box>
        {hospitalizations.length > 0 ? (
          <TableContainer sx={{ borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Paciente</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Cama</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Médico</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Ingreso</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Días Est.</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Diag. Ingreso</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hospitalizations.map((h) => (
                  <TableRow key={h.id} hover onClick={() => handleSelect({ emergencyId: h.emergency_id, hospitalizationId: h.id, patient: h.emergency?.patient })} sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{h.emergency?.patient?.name} {h.emergency?.patient?.lastname}</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{h.room?.name || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{h.attending_doctor?.name || h.admitting_doctor?.name || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{h.admission_date?.split('T')[0] || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{h.length_of_stay_days || 0}</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{h.admission_diagnosis || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Sin hospitalizaciones activas</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default NursingDashboard;
