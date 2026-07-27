import React from 'react';
import { Box, Paper, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PatientInfoPanel from '../../Components/Portal/PatientInfoPanel';
import PatientDashboard from '../../Components/Portal/PatientDashboard';
import EvaluationsTab from '../../Components/Emergency/EvaluationsTab';
import LabResultsPanel from '../../Components/Emergency/LabResultsPanel';
import HistoricalCasePanel from '../../Components/Emergency/HistoricalCasePanel';
import DocumentsPanel from '../../shared/ui/documents-panel';
import MedicationAdminPanel from '../../Components/Hospitalizacion/MedicationAdminPanel';
import AllergiesSection from '../../Components/Emergency/AllergiesSection';
import AntecedentsSection from '../../Components/Emergency/AntecedentsSection';
import FamilyAntecedentsSection from '../../Components/Emergency/FamilyAntecedentsSection';
import GynecologicalHistorySection from '../../Components/Emergency/GynecologicalHistorySection';
import LifestyleHabitsSection from '../../Components/Emergency/LifestyleHabitsSection';
import { medicalHistoryApi } from '../../services/medicalHistoryApi';
import { generateEmergencyReport } from '../../services/medicalHistoryReport';

const TAB_PANELS = {
  historial_casos: { label: 'Historial de casos', component: HistoricalCasePanel, props: (sel) => ({ patient: sel.patient, currentEmergencyId: sel.emergencyId }) },
  laboratorio:      { label: 'Laboratorio', component: LabResultsPanel, props: (sel) => ({ emergencyId: sel.emergencyId, patientGender: sel.patientGender }) },
  evaluaciones:     { label: 'Evaluaciones', component: EvaluationsTab, props: (sel) => ({ emergency: sel.emergency, readOnly: sel.readOnly, onDataChange: sel.onRefresh }) },
  tratamientos:     { label: 'Tratamientos', component: MedicationAdminPanel, props: (sel) => ({ emergencyId: sel.emergencyId, readOnly: true }) },
};

const EmergencyTabPanels = React.memo(function EmergencyTabPanels({
  activePanel,
  selectedPatient,
  selectedEmergency,
  patientStats,
  vitalSigns,
  loadingStats,
  isPrimaryDoctor,
  onStartEmergency,
  onVitalSignsCreated,
  onOpenLabPanel,
  onDataChange,
}) {
  if (activePanel === 'resumen') {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, flex: 1, minHeight: 0, overflow: 'auto', px: 2, pt: 1.5 }}>
        <Box component="section" aria-label="Información del paciente" sx={{ flex: 1, minWidth: 0 }}>
          <PatientInfoPanel
            patient={selectedPatient}
            emergency={selectedEmergency}
            onStartEmergency={onStartEmergency}
            readOnly={selectedPatient?.disabled || !isPrimaryDoctor}
            onDataChange={onDataChange}
            key={selectedEmergency?.id}
          />
        </Box>
        <Box component="section" aria-label="Dashboard del paciente" sx={{ flex: 1, minWidth: 0 }}>
          <PatientDashboard
            patient={selectedPatient}
            stats={patientStats}
            emergencyId={selectedEmergency?.id}
            vitalSigns={vitalSigns}
            onVitalSignsCreated={onVitalSignsCreated}
            onOpenLabPanel={onOpenLabPanel}
            readOnly={selectedPatient?.disabled || !isPrimaryDoctor}
            loadingStats={loadingStats}
          />
        </Box>
      </Box>
    );
  }

  if (activePanel === 'antecedentes') {
    return (
      <Box component="section" aria-label="Antecedentes" sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: 'background.default', px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <AllergiesSection patientId={selectedPatient?.id} readOnly={selectedPatient?.disabled} />
        <AntecedentsSection patientId={selectedPatient?.id} readOnly={selectedPatient?.disabled} />
        <FamilyAntecedentsSection patientId={selectedPatient?.id} readOnly={selectedPatient?.disabled} />
        <GynecologicalHistorySection patientId={selectedPatient?.id} readOnly={selectedPatient?.disabled} patientGender={selectedPatient?.gender} />
        <LifestyleHabitsSection patientId={selectedPatient?.id} readOnly={selectedPatient?.disabled} />
      </Box>
    );
  }

  if (activePanel === 'documentos') {
    return (
      <Box component="section" aria-label="Documentos" sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: 'background.default', px: 2, py: 1.5 }}>
        <Paper sx={{ p: 1.5 }}>
          <DocumentsPanel attachableType="Emergency" attachableId={selectedEmergency?.id} managePermission="emergencia.documentos" />
        </Paper>
        {selectedEmergency?.status === 2 && (
          <Box sx={{ mt: 1.5 }}>
            <Button variant="contained" color="success" startIcon={<DownloadIcon />}
              onClick={async () => { const data = await medicalHistoryApi.getForEmergency(selectedEmergency.id); generateEmergencyReport(data); }}
              sx={{ fontSize: '0.8rem' }}>
              Descargar Historia Clínica (PDF)
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  const def = TAB_PANELS[activePanel];
  if (def?.component) {
    const sel = {
      patient: selectedPatient,
      emergencyId: selectedEmergency?.id,
      patientGender: selectedPatient?.gender,
      emergency: selectedEmergency,
      readOnly: selectedPatient?.disabled,
      onRefresh: onDataChange,
    };
    const Comp = def.component;
    return (
      <Box component="section" aria-label={def.label} sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: 'background.default', px: 2, py: 1.5 }}>
        <Comp {...def.props(sel)} />
      </Box>
    );
  }

  return null;
});

export default EmergencyTabPanels;
