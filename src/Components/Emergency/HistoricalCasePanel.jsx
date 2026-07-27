import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { BackendAPI } from '../../services/BackendApi';
import { STATUS_CONFIG } from '../../constants';
import SectionHeader from '../../shared/ui/section-header';
import CaseDetailModal from './CaseDetailModal';

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const HistoricalCasePanel = ({ patient, currentEmergencyId }) => {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    if (!patient?.id) return;
    BackendAPI.emergencies.getAll({ patient_id: patient.id, per_page: 100 })
      .then((res) => {
        const all = res.data || [];
        setCases(all.filter((c) => c.id !== currentEmergencyId));
      })
      .catch(() => setCases([]));
  }, [patient?.id]);

  const handleRowClick = (caseId) => {
    setSelectedCaseId(caseId);
  };

  const handleCloseModal = () => {
    setSelectedCaseId(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Paper sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <SectionHeader
            icon={<RestoreIcon sx={{ fontSize: 16 }} />}
            label="HISTORIAL DE CASOS"
            color="primary.main"
          />
          <Chip
            label={cases.length}
            size="small"
            color="primary"
            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
          />
        </Box>

        {cases.length === 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            No hay casos registrados para este paciente.
          </Typography>
        ) : (
          <TableContainer sx={{ borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>
                    F. Ingreso
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>
                    Médico Tratante
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>
                    Diagnóstico
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>
                    Estatus
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.map((c) => (
                  <TableRow
                    key={c.id}
                    hover
                    onClick={() => handleRowClick(c.id)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>
                      {formatDate(c.ingress_date)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>{c.primary_doctor?.name || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>{c.diagnostic || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>
                      <Chip
                        label={STATUS_CONFIG[c.status]?.label || c.status}
                        size="small"
                        color={STATUS_CONFIG[c.status]?.chipColor || 'default'}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <CaseDetailModal
        open={!!selectedCaseId}
        emergencyId={selectedCaseId}
        onClose={handleCloseModal}
        readOnly
        hideHistory
      />
    </Box>
  );
};

export default HistoricalCasePanel;
