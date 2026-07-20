import { useState } from 'react';
import {
  Box, Tabs, Tab, Button, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ScheduleBoard from './ScheduleBoard';
import WeeklySchedule from './WeeklySchedule';
import SurgeryPlanningModal from './SurgeryPlanningModal';
import QuirofanoDetail from './QuirofanoDetail';

export default function QuirofanoBoard() {
  const [tabIndex, setTabIndex] = useState(0);
  const [planningOpen, setPlanningOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [editingSurgery, setEditingSurgery] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (_, newValue) => setTabIndex(newValue);

  const handleSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSelectSurgery = (surgery) => {
    setSelectedSurgery(surgery);
    setDetailOpen(true);
  };

  const handleEditSurgery = (surgery) => {
    setEditingSurgery(surgery);
    setPlanningOpen(true);
  };

  const handleClosePlanning = () => {
    setPlanningOpen(false);
    setEditingSurgery(null);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedSurgery(null);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f0f4ff', minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.9rem' }}>Módulo Quirófano</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingSurgery(null); setPlanningOpen(true); }}>
          Planificar Cirugía
        </Button>
      </Box>

      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Programación Diaria" />
        <Tab label="Vista Semanal" />
      </Tabs>

      {tabIndex === 0 && (
        <ScheduleBoard key={`daily-${refreshKey}`} onSelectSurgery={handleSelectSurgery} onEditSurgery={handleEditSurgery} />
      )}
      {tabIndex === 1 && (
        <WeeklySchedule key={`weekly-${refreshKey}`} onSelectSurgery={handleSelectSurgery} onEditSurgery={handleEditSurgery} />
      )}

      <SurgeryPlanningModal
        open={planningOpen}
        onClose={handleClosePlanning}
        onSaved={handleSaved}
        surgery={editingSurgery}
      />

      <QuirofanoDetail
        open={detailOpen}
        onClose={handleCloseDetail}
        surgery={selectedSurgery}
        onSaved={handleSaved}
        onEdit={handleEditSurgery}
      />
    </Box>
  );
}
