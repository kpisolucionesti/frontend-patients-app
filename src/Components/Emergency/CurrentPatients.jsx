import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, CircularProgress, Button, TableSortLabel,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { CLASSIFICATION_OPTIONS, STATUS_CONFIG } from '../../constants';
import CaseDetailModal from '../Emergency/CaseDetailModal';
import AddEmergencyModal from './AddEmergencyModal';
import usePermissions from '../../hooks/usePermissions';

const RECENT_THRESHOLD_MS = 60 * 60 * 1000;
const TRIAGE_ORDER = { red: 0, orange: 1, yellow: 2, green: 3, blue: 4 };

const isRecent = (dateStr) => {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < RECENT_THRESHOLD_MS;
};

const parseTime = (dateStr) => {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  return d.getTime();
};

const elapsedMinutes = (dateStr) => {
  if (!dateStr) return null;
  return Math.floor((Date.now() - parseTime(dateStr)) / 60000);
};

const triagePriority = (emergency) => {
  const cls = emergency.classification;
  return TRIAGE_ORDER[cls] ?? 99;
};

const triageAccent = (classification) => {
  const cls = CLASSIFICATION_OPTIONS.find((c) => c.key === classification);
  return cls?.color || 'transparent';
};

const triageChipStyle = (classification) => {
  const cls = CLASSIFICATION_OPTIONS.find((c) => c.key === classification);
  if (!cls) return {};
  const needsDarkText = ['yellow', 'green'].includes(classification);
  return {
    bgcolor: cls.color,
    color: needsDarkText ? '#212121' : 'white',
    fontWeight: 700,
    fontSize: '0.7rem',
  };
};

const CurrentPatients = ({ onSelectEmergency, embedded, refreshKey, searchQuery, onCountChange, onEmergenciesChange }) => {
  const [detailEmergencyId, setDetailEmergencyId] = useState(null);
  const [sortBy, setSortBy] = useState('triage');
  const [sortDir, setSortDir] = useState('asc');
  const { data, loading, error, refetch } = useFetch(
    () => {
      const params = { status: 1, per_page: 200 };
      if (searchQuery) params.q = searchQuery;
      return BackendAPI.emergencies.getAll(params);
    },
    [refreshKey, searchQuery],
  );

  const sortedEmergencies = useMemo(() => {
    const list = [...(data?.data || [])];
    if (sortBy === 'triage') {
      list.sort((a, b) => {
        const diff = triagePriority(a) - triagePriority(b);
        return sortDir === 'asc' ? diff : -diff;
      });
    } else if (sortBy === 'time') {
      list.sort((a, b) => {
        const ta = parseTime(a.created_at || a.ingress_date);
        const tb = parseTime(b.created_at || b.ingress_date);
        return sortDir === 'asc' ? ta - tb : tb - ta;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => {
        const na = (a.patient?.name || '').toLowerCase();
        const nb = (b.patient?.name || '').toLowerCase();
        return sortDir === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
      });
    }
    return list;
  }, [data, sortBy, sortDir]);

  const triageCounts = useMemo(() => {
    const counts = { red: 0, orange: 0, yellow: 0, green: 0, blue: 0 };
    (data?.data || []).forEach((e) => {
      if (counts[e.classification] !== undefined) counts[e.classification]++;
    });
    return counts;
  }, [data]);

  const redCount = triageCounts.red;

  const emergenciesRef = React.useRef(sortedEmergencies);
  useEffect(() => {
    if (onCountChange) onCountChange(sortedEmergencies.length);
  }, [sortedEmergencies.length, onCountChange]);

  useEffect(() => {
    if (onEmergenciesChange && sortedEmergencies !== emergenciesRef.current) {
      emergenciesRef.current = sortedEmergencies;
      onEmergenciesChange(sortedEmergencies);
    }
  }, [sortedEmergencies, onEmergenciesChange]);

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

  const handleRetry = useCallback(() => {
    if (refetch) refetch();
  }, [refetch]);

  const handleSort = useCallback((column) => {
    setSortBy((prev) => {
      if (prev === column) {
        setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
        return prev;
      }
      setSortDir('asc');
      return column;
    });
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {!embedded && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, flexShrink: 0 }}>
          <AddEmergencyModal onEmergencyCreated={refetch} disabled={!canCreateEmergency} />
        </Box>
      )}

      {/* urgency strip */}
      {!loading && !error && sortedEmergencies.length > 0 && (
        <Box sx={{ px: embedded ? 0 : 2, pb: 0.5, flexShrink: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }} aria-label="Resumen de urgencia">
          {redCount > 0 && (
            <Chip
              icon={<Typography sx={{ fontSize: '0.65rem', fontWeight: 800, ml: 0.5 }}>!</Typography>}
              label={`${redCount} crítico${redCount > 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: '#e53935', color: 'white', fontWeight: 700, fontSize: '0.7rem', height: 22 }}
            />
          )}
          {CLASSIFICATION_OPTIONS.filter(o => o.key !== 'red').map((opt) => {
            const count = triageCounts[opt.key];
            if (!count) return null;
            return (
              <Chip
                key={opt.key}
                label={`${opt.label}: ${count}`}
                size="small"
                variant="outlined"
                sx={{ borderColor: opt.color, color: opt.key === 'yellow' ? '#212121' : opt.color, fontWeight: 500, fontSize: '0.7rem', height: 22 }}
              />
            );
          })}
        </Box>
      )}

      {error && (
        <Box sx={{ p: 1 }} role="alert">
          <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'error.light' }}>
            <Typography variant="caption" color="error.dark" fontWeight={500}>
              Error al cargar emergencias.
            </Typography>
            <Button size="small" variant="outlined" color="error" onClick={handleRetry}>Reintentar</Button>
          </Paper>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} aria-live="polite" aria-busy="true">
          <CircularProgress aria-label="Cargando emergencias" />
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: embedded ? 0 : 2, pb: 2 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
            <Table stickyHeader size="small" aria-label="Lista de emergencias activas ordenadas por prioridad">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', px: 1 }}>
                    <TableSortLabel active={sortBy === 'triage'} direction={sortBy === 'triage' ? sortDir : 'asc'} onClick={() => handleSort('name')} sx={{ color: 'white !important', '&.Mui-active': { color: 'white !important' }, '& .MuiTableSortLabel-icon': { color: 'white !important' } }}>
                      Paciente
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>CI / Edad</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                    <TableSortLabel active={sortBy === 'time'} direction={sortBy === 'time' ? sortDir : 'asc'} onClick={() => handleSort('time')} sx={{ color: 'white !important', '&.Mui-active': { color: 'white !important' }, '& .MuiTableSortLabel-icon': { color: 'white !important' } }}>
                      Tiempo
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                    <TableSortLabel active={sortBy === 'triage'} direction={sortBy === 'triage' ? sortDir : 'asc'} onClick={() => handleSort('triage')} sx={{ color: 'white !important', '&.Mui-active': { color: 'white !important' }, '& .MuiTableSortLabel-icon': { color: 'white !important' } }}>
                      Triage
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Médico</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Diagnóstico</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, width: 60, fontSize: '0.75rem' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedEmergencies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '0.75rem' }}>
                      No hay emergencias activas
                    </TableCell>
                  </TableRow>
                ) : sortedEmergencies.map((e) => {
                  const st = STATUS_CONFIG[e.status] || {};
                  const cls = CLASSIFICATION_OPTIONS.find((c) => c.key === e.classification);
                  const mins = elapsedMinutes(e.created_at || e.ingress_date);
                  const isRed = e.classification === 'red';
                  return (
                    <TableRow
                      key={e.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isRed ? 'rgba(229,57,53,0.06)' : 'inherit',
                        borderLeft: 3,
                        borderColor: triageAccent(e.classification),
                        '&:hover': { bgcolor: isRed ? 'rgba(229,57,53,0.12)' : 'action.hover' },
                      }}
                      onClick={() => handleRowClick(e)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Emergencia ${isRed ? 'crítica ' : ''}de ${e.patient?.name || ''} ${e.patient?.lastname || ''}, ${st.label}, ${mins !== null ? mins + ' minutos' : ''}`}
                      onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); handleRowClick(e); } }}
                    >
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', px: 1 }}>
                        {(e.patient?.name || '') + ' ' + (e.patient?.lastname || '')}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>
                        {e.patient?.ci || '-'}{e.patient?.age ? ` · ${e.patient.age}a` : ''}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: mins !== null && mins > 60 ? 700 : 400, color: mins !== null && mins > 60 ? 'error.main' : 'text.primary' }}>
                        {mins !== null ? (mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`) : '—'}
                      </TableCell>
                      <TableCell>
                        {cls ? (
                          <Chip label={cls.label} size="small" sx={triageChipStyle(e.classification)} />
                        ) : (
                          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{e.primary_doctor?.name || '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                        {e.diagnostic || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip label={st.label || '?'} size="small" color={st.chipColor || 'default'} />
                      </TableCell>
                      <TableCell>
                        {isRecent(e.updated_at) && (
                          <Chip label="Nuevo" size="small" color="info" sx={{ fontSize: '0.7rem', height: 20 }} />
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
