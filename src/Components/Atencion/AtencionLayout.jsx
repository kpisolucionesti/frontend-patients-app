import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import EmergencyPortal from '../Portal/EmergencyPortal';
import HospitalizationBoard from '../Hospitalizacion/HospitalizationBoard';
import HospitalizationDetail from '../Hospitalizacion/HospitalizationDetail';
import Historial from '../Historial/Historial';
import QuirofanoBoard from '../Quirofano/QuirofanoBoard';

const AtencionLayout = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'portal';
  const [detailEmergencyId, setDetailEmergencyId] = useState(null);

  const handleBackFromDetail = () => setDetailEmergencyId(null);

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {tab === 'portal' && <EmergencyPortal />}
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
