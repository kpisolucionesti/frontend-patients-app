import { useState, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BiotechIcon from '@mui/icons-material/Biotech';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import EmptyState from '../../shared/ui/empty-state';
import SectionHeader from '../../shared/ui/section-header';
import OrdenServicioModal from './orden-servicio-modal';

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'warning' },
  in_progress: { label: 'En Proceso', color: 'info' },
  completed: { label: 'Realizado', color: 'success' },
  delivered: { label: 'Entregado', color: 'primary' },
  cancelled: { label: 'Cancelado', color: 'default' },
};

const IndicacionesTab = ({ emergencyId, hospitalizationId, patient }) => {
  const { user } = useAuth();
  const { show: showSnackbar } = useSnackbar();
  const attachableType = hospitalizationId ? 'Hospitalization' : 'Emergency';
  const attachableId = hospitalizationId || emergencyId;

  const [ordenModalOpen, setOrdenModalOpen] = useState(false);
  const [indicacionDialogOpen, setIndicacionDialogOpen] = useState(false);
  const [indicacionText, setIndicacionText] = useState('');
  const [savingIndicacion, setSavingIndicacion] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: orders = [], loading, refetch } = useFetch(
    () => attachableId ? BackendAPI.documents.list(attachableType, attachableId) : Promise.resolve([]),
    [attachableId, attachableType, refreshKey],
  );

  const odsOrders = (orders || []).filter((doc) => doc.order_number);

  const handleSaveIndicacion = async () => {
    if (!indicacionText.trim()) return;
    setSavingIndicacion(true);
    try {
      const fd = new FormData();
      fd.append('attachable_type', attachableType);
      fd.append('attachable_id', String(attachableId));
      fd.append('report_type', 'indicaciones_medicas');
      fd.append('description', indicacionText.trim());
      fd.append('file_type', 'text/plain');
      await BackendAPI.documents.create(fd);
      showSnackbar('Indicación médica guardada', 'success');
      setIndicacionText('');
      setIndicacionDialogOpen(false);
    } catch {
      showSnackbar('Error al guardar indicación', 'error');
    } finally {
      setSavingIndicacion(false);
    }
  };

  const handleCancelOds = async (doc) => {
    try {
      await BackendAPI.documents.update(doc.id, { status: 'cancelled' });
      showSnackbar('ODS cancelada', 'success');
      setRefreshKey((k) => k + 1);
      refetch();
    } catch {
      showSnackbar('Error al cancelar ODS', 'error');
    }
  };

  const handleSendEmail = async (doc) => {
    try {
      await BackendAPI.documents.send(doc.id);
      showSnackbar('ODS enviada por email', 'success');
    } catch {
      showSnackbar('Error al enviar ODS por email', 'error');
    }
  };

  const handleDownload = (doc) => {
    if (doc.file_url) window.open(doc.file_url, '_blank');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Paper sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <AssignmentIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: 'primary.main', fontSize: '0.8rem' }}>
            INDICACIONES
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant="outlined" size="small"
            startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />}
            onClick={() => setIndicacionDialogOpen(true)}
            sx={{ fontSize: '0.7rem', py: 0.25 }}>
            Indicaciones Médicas
          </Button>
          <Button variant="outlined" size="small" color="primary"
            startIcon={<BiotechIcon sx={{ fontSize: 16 }} />}
            onClick={() => setOrdenModalOpen(true)}
            sx={{ fontSize: '0.7rem', py: 0.25 }}>
            Órdenes de Servicio
          </Button>
        </Box>

        <SectionHeader icon={<AssignmentIcon sx={{ fontSize: 16 }} />} label="ÓRDENES DE SERVICIO EMITIDAS" color="primary.main" />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
        ) : odsOrders.length === 0 ? (
          <EmptyState
            title="Sin órdenes de servicio"
            description="Usa el botón 'Órdenes de Servicio' para crear una nueva orden"
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>Nro. ODS</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>Servicio</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>Estatus</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>Fecha</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem', p: 0.5 }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {odsOrders.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5, fontWeight: 600 }}>{doc.order_number || '—'}</TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>
                      {doc.study_classification ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: doc.study_classification.color || '#999' }} />
                          {doc.study_classification.name}
                        </Box>
                      ) : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }}>
                      <Chip label={STATUS_CONFIG[doc.status]?.label || doc.status || '—'}
                        size="small" color={STATUS_CONFIG[doc.status]?.color || 'default'}
                        sx={{ height: 20, fontSize: '0.65rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5, whiteSpace: 'nowrap' }}>
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', p: 0.5 }} align="center">
                      <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                        <Tooltip title="Editar estado">
                          <IconButton size="small" onClick={() => {
                            setOrdenModalOpen(true);
                          }} sx={{ p: 0.15 }}>
                            <EditIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        {doc.status !== 'cancelled' && (
                          <Tooltip title="Cancelar">
                            <IconButton size="small" onClick={() => handleCancelOds(doc)}
                              sx={{ p: 0.15, color: 'error.main' }}>
                              <CancelIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Descargar ODS">
                          <IconButton size="small" color="primary"
                            onClick={() => handleDownload(doc)} sx={{ p: 0.15 }}>
                            <DownloadIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Enviar ODS">
                          <IconButton size="small" color="info"
                            onClick={() => handleSendEmail(doc)} sx={{ p: 0.15 }}>
                            <EmailIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={indicacionDialogOpen} onClose={() => setIndicacionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
          INDICACIONES MÉDICAS
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {patient && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  {patient.name} {patient.lastname}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  CI: {patient.ci || '—'} · HC: {patient.medical_history_number || '—'}
                </Typography>
              </Box>
            )}
            <TextField variant="standard" size="small" placeholder="Escribir indicación médica..."
              value={indicacionText} onChange={(e) => setIndicacionText(e.target.value)}
              multiline rows={4} fullWidth autoFocus
              inputProps={{ style: { fontSize: '0.75rem' } }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIndicacionDialogOpen(false)} variant="outlined" color="error" size="small">Cancelar</Button>
          <Button onClick={handleSaveIndicacion} variant="contained" color="primary" size="small"
            disabled={savingIndicacion || !indicacionText.trim()}>
            {savingIndicacion ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <OrdenServicioModal
        open={ordenModalOpen}
        onClose={() => setOrdenModalOpen(false)}
        onSaved={() => { setRefreshKey((k) => k + 1); refetch(); }}
        attachableType={attachableType}
        attachableId={attachableId}
        patient={patient}
      />
    </Box>
  );
};

export default IndicacionesTab;
