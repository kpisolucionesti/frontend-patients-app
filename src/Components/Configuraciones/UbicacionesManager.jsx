import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import AreasManager from './AreasManager';
import RoomsManager from './RoomsManager';

const UbicacionesManager = () => {
  const [tab, setTab] = useState('areas');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 }, '& .Mui-selected': { color: '#1565c0', fontWeight: 700 } }}
          TabIndicatorProps={{ sx: { bgcolor: '#1565c0', height: 3 } }}
        >
          <Tab label="Áreas" value="areas" />
          <Tab label="Salas" value="salas" />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: tab === 'areas' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column' }}>
          <AreasManager />
        </Box>
        <Box sx={{ display: tab === 'salas' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column' }}>
          <RoomsManager />
        </Box>
      </Box>
    </Box>
  );
};

export default UbicacionesManager;
