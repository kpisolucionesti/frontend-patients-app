import { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Tabs, Tab,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BiotechIcon from '@mui/icons-material/Biotech';
import { useFetch } from '../../hooks/useFetch';
import { BackendAPI } from '../../services/BackendApi';
import EmptyState from '../../shared/ui/empty-state';

const tabSx = {
  textTransform: 'none', fontWeight: 600, fontSize: '0.7rem',
  minHeight: 30, px: 1, py: 0.5,
};

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: 'warning' },
  in_progress: { label: 'En Progreso', color: 'info' },
  completed: { label: 'Realizado', color: 'success' },
  delivered: { label: 'Entregado', color: 'primary' },
  cancelled: { label: 'Cancelado', color: 'default' },
};

const ClinicalStudiesPanel = ({ emergencyId, hospitalizationId, patient }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const attachableType = hospitalizationId ? 'Hospitalization' : 'Emergency';
  const attachableId = hospitalizationId || emergencyId;

  const { data: classifications = [], loading: loadingClass } = useFetch(
    () => BackendAPI.clinicalStudyClassifications.getAll(),
    [],
  );

  const activeClassifications = useMemo(
    () => (classifications || []).filter((c) => c.is_active !== false),
    [classifications],
  );

  const selectedClass = activeClassifications[activeTab] || null;

  const { data: orders = [], loading: loadingOrders } = useFetch(
    () => {
      if (!attachableId || !selectedClass?.id) return Promise.resolve([]);
      return BackendAPI.documents.list(attachableType, attachableId, {
        study_classification_id: selectedClass.id,
      });
    },
    [attachableId, attachableType, selectedClass?.id, refreshKey],
  );

  const completedOrders = useMemo(
    () => (orders || []).filter((o) => o.status === 'completed' || o.status === 'delivered'),
    [orders],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <BiotechIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
        <Typography variant="caption" fontWeight={600} sx={{ color: 'secondary.main', fontSize: '0.8rem' }}>
          RESULTADOS DE ESTUDIOS CLÍNICOS
        </Typography>
      </Box>

      {activeClassifications.length > 0 && (
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ sx: { bgcolor: 'secondary.main', height: 2 } }}
          sx={{ minHeight: 0, mb: 1, borderBottom: 1, borderColor: 'divider' }}
        >
          {activeClassifications.map((c) => (
            <Tab
              key={c.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color }} />
                  {c.name}
                </Box>
              }
              sx={tabSx}
            />
          ))}
        </Tabs>
      )}

      <Paper sx={{ borderLeft: 3, borderColor: 'secondary.main' }}>
        {loadingOrders || loadingClass ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
        ) : completedOrders.length === 0 ? (
          <EmptyState
            title="Sin resultados disponibles"
            description="Los resultados de estudios realizados aparecerán aquí cuando estén completos"
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>Nro. Orden</TableCell>
                  <TableCell sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>Estudio</TableCell>
                  <TableCell sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>Estado</TableCell>
                  <TableCell sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>Fecha</TableCell>
                  <TableCell sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>PDF</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedOrders.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5, fontWeight: 600 }}>{o.order_number || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>{o.study_type || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>
                      <Chip label={STATUS_LABELS[o.status]?.label || o.status}
                        size="small" color={STATUS_LABELS[o.status]?.color || 'default'}
                        sx={{ height: 20, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5, whiteSpace: 'nowrap' }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>
                      {o.file_url ? (
                        <Tooltip title="Descargar PDF">
                          <IconButton size="small" color="primary"
                            onClick={() => window.open(o.file_url, '_blank')}
                            sx={{ p: 0.25 }}>
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default ClinicalStudiesPanel;
