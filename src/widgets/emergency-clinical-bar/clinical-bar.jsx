import React from 'react';
import { Box, Typography, Tabs, Tab, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RepeatIcon from '@mui/icons-material/Repeat';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import InfoIcon from '@mui/icons-material/Info';
import ScienceIcon from '@mui/icons-material/Science';
import DescriptionIcon from '@mui/icons-material/Description';
import RestoreIcon from '@mui/icons-material/Restore';
import { GENDER_MAP } from '../../entities/emergency/config';

const tabSx = {
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.7rem',
  minHeight: 30,
  px: 1.25,
  py: 0.5,
  gap: 0.5,
  '& .MuiTab-iconWrapper': { fontSize: '0.9rem', m: '0 !important' },
};

const ClinicalBar = React.memo(function ClinicalBar({
  patient,
  emergency,
  patientStats,
  loadingStats,
  activePanel,
  onTabChange,
}) {
  return (
    <Box sx={{ flexShrink: 0, bgcolor: 'white', borderBottom: 1, borderColor: 'divider', px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, pb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <PersonIcon sx={{ color: 'primary.main', fontSize: 18, flexShrink: 0 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {patient.name} {patient.lastname}
          </Typography>
          <Chip label={`CI: ${patient.ci || '—'}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', flexShrink: 0 }}>
            {patient.age || '?'}a · {GENDER_MAP[patient.gender] || '—'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto', flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {loadingStats ? '...' : (patientStats?.last_visit_date || '—')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RepeatIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {loadingStats ? '...' : (patientStats?.total_visits ?? '0')} visitas
            </Typography>
          </Box>
        </Box>
      </Box>

      {emergency && (
        <Tabs
          value={activePanel}
          onChange={(_, v) => onTabChange(v)}
          TabIndicatorProps={{ sx: { bgcolor: 'primary.main', height: 2 } }}
          sx={{ minHeight: 0 }}
        >
          <Tab label="Resumen" value="resumen" icon={<AssignmentIcon fontSize="small" />} iconPosition="start" aria-label="Resumen del paciente" sx={tabSx} />
          <Tab label="Evaluaciones" value="evaluaciones" icon={<MedicalServicesIcon fontSize="small" />} iconPosition="start" aria-label="Evaluaciones médicas" sx={tabSx} />
          <Tab label="Antecedentes" value="antecedentes" icon={<InfoIcon fontSize="small" />} iconPosition="start" aria-label="Antecedentes del paciente" sx={tabSx} />
          <Tab label="Laboratorio" value="laboratorio" icon={<ScienceIcon fontSize="small" />} iconPosition="start" aria-label="Resultados de laboratorio" sx={tabSx} />
          <Tab label="Documentos" value="documentos" icon={<DescriptionIcon fontSize="small" />} iconPosition="start" aria-label="Documentos" sx={tabSx} />
          <Tab label="Historial" value="historial_casos" icon={<RestoreIcon fontSize="small" />} iconPosition="start" aria-label="Historial de casos anteriores" sx={tabSx} />
        </Tabs>
      )}
    </Box>
  );
});

export default ClinicalBar;
