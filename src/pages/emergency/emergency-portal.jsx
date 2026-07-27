import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import BreadcrumbNav from '../../shared/ui/breadcrumb-nav';
import AddEmergencyModal from '../../Components/Emergency/AddEmergencyModal';
import { BackendAPI } from '../../services/BackendApi';
import { useAuth } from '../../hooks/useAuth';
import { useFetch } from '../../hooks/useFetch';
import TopBar from '../../features/emergency/top-bar';
import DeceasedBanner from '../../features/emergency/deceased-banner';
import ClinicalBar from '../../widgets/emergency-clinical-bar/clinical-bar';
import EmergencyTabPanels from '../../widgets/emergency-tab-panels/tab-panels';
import EmergencyListView from '../../features/emergency/emergency-list-view';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const EmergencyPortal = () => {
  const { user } = useAuth();
  useDocumentTitle('Emergencia');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [newIngresoOpen, setNewIngresoOpen] = useState(false);
  const [preloadPatient, setPreloadPatient] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [emergenciesData, setEmergenciesData] = useState([]);
  const [activePanel, setActivePanel] = useState('resumen');
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [doctorFilter, setDoctorFilter] = useState('all');

  const isAdmin = user?.is_admin === true;
  const loggedDoctorId = Number(user?.doctor_id) || null;
  const isPrimaryDoctor = isAdmin || (loggedDoctorId && Number(selectedEmergency?.primary_doctor?.id) === loggedDoctorId);

  const patientStatsEnabled = !!selectedPatient?.id;
  const { data: patientStats, loading: loadingStats } = useFetch(
    () => patientStatsEnabled ? BackendAPI.patients.getStats(selectedPatient.id) : Promise.resolve(null),
    [selectedPatient?.id, patientStatsEnabled],
  );

  const vitalSignsEnabled = !!selectedEmergency?.id;
  const { data: vitalSigns = [] } = useFetch(
    () => vitalSignsEnabled ? BackendAPI.vitalSigns.getAll(selectedEmergency.id) : Promise.resolve([]),
    [selectedEmergency?.id, vitalSignsEnabled],
  );

  const handleSelectEmergency = useCallback((emergency) => {
    setSelectedEmergency(emergency);
    setSelectedPatient(emergency.patient);
    setActivePanel('resumen');
  }, []);

  const handleTriggerRefresh = useCallback(() => { setRefreshKey((k) => k + 1); setLastUpdated(Date.now()); }, []);
  const handleStartEmergency = useCallback((patient) => { setPreloadPatient(patient); setNewIngresoOpen(true); }, []);
  const handleCloseNewIngreso = useCallback(() => { setNewIngresoOpen(false); setPreloadPatient(null); }, []);
  const handleClearSelection = useCallback(() => { setSelectedPatient(null); setSelectedEmergency(null); setActivePanel('resumen'); }, []);
  const handleOpenLabPanel = useCallback(() => { setActivePanel('laboratorio'); }, []);

  const handleEmergencyCreated = useCallback(() => {
    setNewIngresoOpen(false);
    setPreloadPatient(null);
    setRefreshKey((k) => k + 1);
    handleClearSelection();
  }, [handleClearSelection]);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setNewIngresoOpen(true);
      }
    }
  }, []);

  return (
    <Box component="main" role="main" aria-label="Módulo de Emergencia" onKeyDown={handleKeyDown}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default', outline: 'none' }}>
      <BreadcrumbNav
        crumbs={[
          ...(selectedPatient
            ? [{ label: 'Emergencia', onClick: handleClearSelection }, { label: `${selectedPatient.name} ${selectedPatient.lastname}` }]
            : [{ label: 'Emergencia' }]
          ),
        ]}
      />

      <TopBar
        emergencyCount={emergencyCount}
        selectedPatient={selectedPatient}
        onNewIngreso={() => setNewIngresoOpen(true)}
        lastUpdated={lastUpdated}
      />

      {selectedPatient ? (
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <DeceasedBanner patient={selectedPatient} />

          <ClinicalBar
            patient={selectedPatient}
            emergency={selectedEmergency}
            patientStats={patientStats}
            loadingStats={loadingStats}
            activePanel={activePanel}
            onTabChange={setActivePanel}
          />

          <EmergencyTabPanels
            activePanel={activePanel}
            selectedPatient={selectedPatient}
            selectedEmergency={selectedEmergency}
            patientStats={patientStats}
            vitalSigns={vitalSigns}
            loadingStats={loadingStats}
            isPrimaryDoctor={isPrimaryDoctor}
            onStartEmergency={handleStartEmergency}
            onVitalSignsCreated={handleTriggerRefresh}
            onOpenLabPanel={handleOpenLabPanel}
            onDataChange={handleTriggerRefresh}
          />
        </Box>
      ) : (
        <EmergencyListView
          refreshKey={refreshKey}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          emergenciesData={emergenciesData}
          onSelectEmergency={handleSelectEmergency}
          onCountChange={setEmergencyCount}
          onEmergenciesChange={setEmergenciesData}
          doctorId={loggedDoctorId}
          doctorFilter={doctorFilter}
          onDoctorFilterChange={setDoctorFilter}
        />
      )}

      <AddEmergencyModal
        open={newIngresoOpen}
        onClose={handleCloseNewIngreso}
        onEmergencyCreated={handleEmergencyCreated}
        preloadPatient={preloadPatient}
      />
    </Box>
  );
};

export default EmergencyPortal;
