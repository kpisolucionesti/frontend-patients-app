import React from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CurrentPatients from '../../Components/Emergency/CurrentPatients';
import ExportModal from '../../shared/ui/export-modal';
import { EMERGENCY_EXPORT_COLUMNS } from '../../entities/emergency/config';

const EmergencyListView = React.memo(function EmergencyListView({
  refreshKey,
  searchQuery,
  onSearchChange,
  emergenciesData,
  onSelectEmergency,
  onCountChange,
  onEmergenciesChange,
}) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 2, pb: 1, flexShrink: 0, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar por nombre o CI..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          inputProps={{ 'aria-label': 'Buscar paciente por nombre o cédula' }}
          sx={{ width: 320 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <ExportModal data={emergenciesData} columns={EMERGENCY_EXPORT_COLUMNS} filename="Emergencias_Activas" buttonLabel="Exportar" />
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: 2, display: 'flex', flexDirection: 'column' }}>
        <CurrentPatients
          refreshKey={refreshKey}
          searchQuery={searchQuery}
          onSelectEmergency={onSelectEmergency}
          embedded
          onCountChange={onCountChange}
          onEmergenciesChange={onEmergenciesChange}
        />
      </Box>
    </Box>
  );
});

export default EmergencyListView;
