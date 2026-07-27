import React from 'react';
import { Box, Paper, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useFetch } from '../../hooks/useFetch';
import { BackendAPI } from '../../services/BackendApi';
import { STATUS_CONFIG } from '../../constants';
import SectionHeader from '../../shared/ui/section-header';

const EmergencyHistorySection = React.memo(function EmergencyHistorySection({ patient, onStartEmergency }) {
  const isDeceased = patient?.disabled;

  const { data: emergencyHistory } = useFetch(
    () => patient?.id ? BackendAPI.emergencies.getAll({ patient_id: patient.id, per_page: 50 }) : Promise.resolve({ data: [] }),
    [patient?.id],
  );

  if (!patient || isDeceased) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <SectionHeader icon={<MedicalServicesIcon sx={{ fontSize: 16 }} />} label="EMERGENCIAS ANTERIORES" color="primary.main" />
        <Button variant="outlined" size="small" color="success" startIcon={<AddCircleOutlineIcon />}
          onClick={() => onStartEmergency?.(patient)}>Nueva Emergencia</Button>
      </Box>
      {emergencyHistory?.data?.length > 0 ? (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Fecha</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Diagnóstico</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emergencyHistory.data.map((e) => (
                <TableRow key={e.id}>
                  <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>{e.ingress_date}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>{e.diagnostic}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>
                    <Chip label={STATUS_CONFIG[e.status]?.label || e.status} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center', py: 2 }}>
          Este paciente no tiene emergencias registradas
        </Typography>
      )}
    </Paper>
  );
});

export default EmergencyHistorySection;
