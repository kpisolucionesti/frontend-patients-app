import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import EmergencyPortal from '../../Components/Portal/EmergencyPortal';
import HospitalizationBoard from '../../Components/Hospitalizacion/HospitalizationBoard';
import HospitalizationDetail from '../../Components/Hospitalizacion/HospitalizationDetail';
import Historial from '../../pages/history/history-page';
import QuirofanoBoard from '../../Components/Quirofano/QuirofanoBoard';
import NursingDashboard from '../../Components/Enfermeria/Dashboard/NursingDashboard';

const TAB_TITLES = { portal: 'Emergencia', enfermeria: 'Enfermería', hospitalizacion: 'Hospitalización', quirofano: 'Quirófano', historial: 'Historial' };

const AtencionLayout = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'portal';
  const [detailEmergencyId, setDetailEmergencyId] = useState(null);
  useDocumentTitle(TAB_TITLES[tab] || 'Atención');

  useEffect(() => {
    setDetailEmergencyId(null);
  }, [tab]);

  const handleBackFromDetail = () => setDetailEmergencyId(null);

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {tab === 'portal' && <EmergencyPortal />}
        {tab === 'enfermeria' && <NursingDashboard />}
        {tab === 'hospitalizacion' && (detailEmergencyId ? (
          <HospitalizationDetail emergencyId={detailEmergencyId} onBack={handleBackFromDetail} />
        ) : (
          <HospitalizationBoard onSelectPatient={setDetailEmergencyId} />
        ))}
        {tab === 'quirofano' && <QuirofanoBoard />}
        {tab === 'historial' && <Historial />}
      </Box>
    </Box>
  );
};

export default AtencionLayout;