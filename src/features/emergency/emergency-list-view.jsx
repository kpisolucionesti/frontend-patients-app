import React from 'react';
import { Box, TextField, InputAdornment, Select, MenuItem, FormControl } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
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
  doctorId,
  doctorFilter,
  onDoctorFilterChange,
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
          sx={{ width: 280, flexShrink: 0 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        {doctorId && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={doctorFilter}
              onChange={(e) => onDoctorFilterChange(e.target.value)}
              displayEmpty
              startAdornment={<FilterListIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />}
            >
              <MenuItem value="all">Todos los pacientes</MenuItem>
              <MenuItem value="mine">Mis pacientes</MenuItem>
            </Select>
          </FormControl>
        )}
        <Box sx={{ flex: 1 }} />
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
          doctorId={doctorFilter === 'mine' ? doctorId : null}
        />
      </Box>
    </Box>
  );
});

export default EmergencyListView;
