import { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Tabs, Tab,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import BiotechIcon from '@mui/icons-material/Biotech';
import { useFetch } from '../../hooks/useFetch';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';
import EmptyState from '../../shared/ui/empty-state';
import ServiceOrderModal from '../../features/clinical-studies/service-order-modal';

const tabSx = {
  textTransform: 'none', fontWeight: 600, fontSize: '0.7rem',
  minHeight: 30, px: 1, py: 0.5,
};

const STATUS_LABELS = {
  requested: { label: 'Solicitado', color: 'warning' },
  completed: { label: 'Realizado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'default' },
};

const ClinicalStudiesPanel = ({ emergencyId, hospitalizationId, patient }) => {
  const { show: showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
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

  const { data: orders = [], loading: loadingOrders, refetch } = useFetch(
    () => {
      if (!attachableId || !selectedClass?.id) return Promise.resolve([]);
      return BackendAPI.documents.list(attachableType, attachableId, {
        study_classification_id: selectedClass.id,
      });
    },
    [attachableId, attachableType, selectedClass?.id, refreshKey],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await BackendAPI.documents.destroy(deleteTarget.id);
      showSnackbar('Orden eliminada', 'success');
      refetch();
    } catch {
      showSnackbar('Error al eliminar', 'error');
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BiotechIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: 'secondary.main', fontSize: '0.8rem' }}>
            ESTUDIOS CLÍNICOS
          </Typography>
        </Box>
        <Button variant="outlined" size="small" color="secondary"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={() => setModalOpen(true)}
          sx={{ fontSize: '0.7rem', py: 0.25 }}>
          + Orden de Servicio
        </Button>
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
        ) : orders.length === 0 ? (
          <EmptyState
            title="Sin órdenes de servicio"
            description="Usa el botón '+ Orden de Servicio' para registrar un nuevo estudio"
            action={
              <Button variant="outlined" size="small" color="secondary"
                startIcon={<AddIcon />}
                onClick={() => setModalOpen(true)}
                sx={{ fontSize: '0.7rem' }}>
                Nueva Orden
              </Button>
            }
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
                  <TableCell sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }} align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((o) => (
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
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }} align="center">
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error"
                          onClick={() => setDeleteTarget(o)}
                          sx={{ p: 0.25 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <DeleteConfirmModal
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} loading={deleting}
        message="¿Eliminar esta orden de servicio?"
      />

      <ServiceOrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { refetch(); setRefreshKey((k) => k + 1); }}
        attachableType={attachableType}
        attachableId={attachableId}
        patient={patient}
      />
    </Box>
  );
};

export default ClinicalStudiesPanel;
