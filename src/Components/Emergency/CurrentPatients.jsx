import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, CircularProgress, Alert
} from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { CLASSIFICATION_OPTIONS } from '../../constants';
import CaseDetailModal from './CaseDetailModal';
import AddEmergencyModal from './AddEmergencyModal';
import usePermissions from '../../hooks/usePermissions';

const STATUS_STYLES = {
  0: { label: 'Esperando', chipColor: 'warning' },
  1: { label: 'Atendido', chipColor: 'info' },
  2: { label: 'Alta Médica', chipColor: 'success' },
  3: { label: 'Ingreso a Hospitalización', chipColor: 'secondary' },
  4: { label: 'Anulada', chipColor: 'default' },
  5: { label: 'Fallecido', chipColor: 'default' },
};

const isRecent = (dateStr) => {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 3600000;
};

const CurrentPatients = ({ onSelectEmergency, embedded, refreshKey, searchQuery, onCountChange, onEmergenciesChange }) => {
  const [detailEmergencyId, setDetailEmergencyId] = useState(null);
  const { data, loading, error, refetch } = useFetch(
    () => {
      const params = { status: 1, per_page: 200 };
      if (searchQuery) params.q = searchQuery;
      return BackendAPI.emergencies.getAll(params);
    },
    [refreshKey, searchQuery],
  );

  const emergencies = useMemo(() => data?.data || [], [data]);

  useEffect(() => {
    if (onCountChange) onCountChange(emergencies.length);
    if (onEmergenciesChange) onEmergenciesChange(emergencies);
  }, [emergencies.length, emergencies, onCountChange, onEmergenciesChange]);

  const permissions = usePermissions();
  const canCreateEmergency = useMemo(() => permissions.includes('emergencia.create'), [permissions]);

  const handleRowClick = useCallback((emergency) => {
    if (embedded && onSelectEmergency) {
      onSelectEmergency(emergency);
    } else {
      setDetailEmergencyId(emergency.id);
    }
  }, [embedded, onSelectEmergency]);

  const handleCloseDetail = useCallback(() => setDetailEmergencyId(null), []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {!embedded && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, flexShrink: 0 }}>
          <AddEmergencyModal onEmergencyCreated={refetch} disabled={!canCreateEmergency} />
        </Box>
      )}
      {error && (
        <Box sx={{ p: 1 }}>
          <Alert severity="error" onClose={refetch}>
            Error al cargar emergencias. <strong>Haz clic aquí para reintentar.</strong>
          </Alert>
        </Box>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: embedded ? 0 : 2, pb: 2 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Cédula</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Paciente</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Edad</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Médico Tratante</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Diagnóstico</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Clasificación</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, width: 70, fontSize: '0.75rem' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emergencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay emergencias activas
                    </TableCell>
                  </TableRow>
                ) : emergencies.map((e) => {
                  const st = STATUS_STYLES[e.status] || {};
                  const cls = CLASSIFICATION_OPTIONS.find((c) => c.key === e.classification);
                  return (
                    <TableRow
                      key={e.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleRowClick(e)}
                    >
                      <TableCell>{e.patient?.ci || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {(e.patient?.name || '') + ' ' + (e.patient?.lastname || '')}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {e.patient?.age ? `${e.patient.age} años` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>{e.patient?.age || '-'}</TableCell>
                      <TableCell>{e.primary_doctor?.name || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {e.diagnostic || '-'}
                      </TableCell>
                      <TableCell>
                        {cls ? (
                          <Chip label={cls.label} size="small" sx={{ bgcolor: cls.color, color: 'white', fontWeight: 600, fontSize: '0.65rem' }} />
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip label={st.label || '?'} size="small" color={st.chipColor || 'default'} />
                      </TableCell>
                      <TableCell>
                        {isRecent(e.updated_at) && (
                          <Chip label="Nuevo" size="small" color="info" sx={{ fontSize: '0.6rem', height: 20 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {detailEmergencyId && (
        <CaseDetailModal
          open={!!detailEmergencyId}
          emergencyId={detailEmergencyId}
          onClose={handleCloseDetail}
          onDataChange={refetch}
        />
      )}
    </Box>
  );
};

export default CurrentPatients;
