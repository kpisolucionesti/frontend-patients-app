import React, { useCallback, useMemo, useState } from 'react';
import { Box, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { Add, Delete, Edit, History, PowerSettingsNew, VpnKey } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import TvScreenFormModal from './TvScreenFormModal';
import TvScreenEventLog from './TvScreenEventLog';

const TvScreensManager = () => {
  const { data: screens, loading, refetch } = useFetch(
    () => BackendAPI.tvScreens.getAll(), [],
  );
  const { show } = useSnackbar();

  const [formModal, setFormModal] = useState(null);
  const [eventLog, setEventLog] = useState(null);

  const handleSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDelete = useCallback(async (screen) => {
    if (!window.confirm(`Eliminar la pantalla "${screen.name}"?`)) return;
    try {
      await BackendAPI.tvScreens.delete(screen.id);
      show('Pantalla eliminada', 'success');
      refetch();
    } catch (err) {
      show(err.response?.data?.error || 'Error al eliminar pantalla', 'error');
    }
  }, [refetch, show]);

  const handleRegeneratePin = useCallback(async (screen) => {
    if (!window.confirm(`Regenerar PIN para "${screen.name}"? Se revocarán todas las sesiones activas.`)) return;
    try {
      const res = await BackendAPI.tvScreens.regeneratePin(screen.id);
      show(`Nuevo PIN: ${res.pin}`, 'info');
      refetch();
    } catch (err) {
      show(err.response?.data?.error || 'Error al regenerar PIN', 'error');
    }
  }, [refetch, show]);

  const handleRevokeSessions = useCallback(async (screen) => {
    if (!window.confirm(`Desconectar "${screen.name}"? Se revocarán todas las sesiones activas.`)) return;
    try {
      await BackendAPI.tvScreens.revokeSessions(screen.id);
      show('Sesiones revocadas', 'success');
      refetch();
    } catch (err) {
      show(err.response?.data?.error || 'Error al revocar sesiones', 'error');
    }
  }, [refetch, show]);

  const columns = useMemo(() => [
    {
      header: 'Nombre',
      accessorKey: 'name',
      grow: true,
    },
    {
      header: 'Ubicación',
      accessorKey: 'location',
      size: 150,
    },
    {
      header: 'Ruta',
      accessorKey: 'route',
      size: 120,
    },
    {
      header: 'Estado',
      accessorKey: 'is_connected',
      size: 120,
      Cell: ({ cell }) => {
        const connected = cell.getValue();
        return connected ? (
          <Chip label="Conectada" color="success" size="small" />
        ) : (
          <Chip label="Desconectada" color="default" size="small" />
        );
      },
    },
    {
      header: 'Última conexión',
      accessorKey: 'last_session',
      size: 180,
      Cell: ({ cell }) => {
        const session = cell.getValue();
        if (!session?.last_seen_at) return '-';
        return new Date(session.last_seen_at).toLocaleString('es-PY');
      },
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: screens || [],
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => {
      const screen = row.original;
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Ver eventos" arrow>
            <IconButton color="info" size="small" onClick={() => setEventLog(screen)}>
              <History fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar" arrow>
            <IconButton size="small" onClick={() => setFormModal(screen)}>
              <Edit sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Regenerar PIN" arrow>
            <IconButton color="info" size="small" onClick={() => handleRegeneratePin(screen)}>
              <VpnKey fontSize="small" />
            </IconButton>
          </Tooltip>
          {screen.is_connected && (
            <Tooltip title="Desconectar" arrow>
              <IconButton color="error" size="small" onClick={() => handleRevokeSessions(screen)}>
                <PowerSettingsNew fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Eliminar" arrow>
            <IconButton size="small" onClick={() => handleDelete(screen)} sx={{ p: 0.25, color: 'error.main' }}>
              <Delete sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Tooltip title="Agregar pantalla TV" arrow>
          <IconButton size="small" color="primary" onClick={() => setFormModal({})}><Add fontSize="small" /></IconButton>
        </Tooltip>
      ),
      [],
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ px: 2, py: 1.25, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem' }}>Pantallas TV</Typography>
      </Box>
      <Paper sx={{ bgcolor: 'background.paper', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', '& .MuiTablePagination-root': { marginTop: 0 } }}>
        <MaterialReactTable table={table} />
      </Paper>
      {formModal && (
        <TvScreenFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          screen={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
      {eventLog && (
        <TvScreenEventLog
          open={!!eventLog}
          onClose={() => setEventLog(null)}
          screen={eventLog}
        />
      )}
    </Box>
  );
};

export default TvScreensManager;
