import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HotelIcon from '@mui/icons-material/Hotel';
import HistoryIcon from '@mui/icons-material/History';
import SectionSidebar from '../Commons/SectionSidebar';
import EmergencyPortal from '../Portal/EmergencyPortal';
import HospitalizationBoard from '../Hospitalizacion/HospitalizationBoard';
import HospitalizationDetail from '../Hospitalizacion/HospitalizationDetail';
import Historial from '../Historial/Historial';

const SECTIONS = [
  { key: 'portal', label: 'Emergencia', icon: <LocalHospitalIcon /> },
  { key: 'hospitalizacion', label: 'Hospitalización', icon: <HotelIcon /> },
  { key: 'historial', label: 'Historial', icon: <HistoryIcon /> },
];

const AtencionLayout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'portal';
  const [activeSection, setActiveSection] = useState(tab);
  const [detailEmergencyId, setDetailEmergencyId] = useState(null);

  useEffect(() => {
    if (tab !== activeSection) {
      setSearchParams({ tab: activeSection }, { replace: true });
      setDetailEmergencyId(null);
    }
  }, [activeSection, tab, setSearchParams]);

  const handleBackFromDetail = () => setDetailEmergencyId(null);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <SectionSidebar
        sections={SECTIONS}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsible
      />
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {activeSection === 'portal' && <EmergencyPortal />}
        {activeSection === 'hospitalizacion' && (detailEmergencyId ? (
          <HospitalizationDetail emergencyId={detailEmergencyId} onBack={handleBackFromDetail} />
        ) : (
          <HospitalizationBoard onSelectPatient={setDetailEmergencyId} />
        ))}
        {activeSection === 'historial' && <Historial />}
      </Box>
    </Box>
  );
};

export default AtencionLayout;
