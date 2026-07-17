import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';

const EVENT_TYPE_LABELS = {
  created: 'Creada',
  updated: 'Actualizada',
  pin_changed: 'PIN cambiado',
  connected: 'Conectada',
  disconnected: 'Desconectada',
  activated: 'Activada',
  deactivated: 'Desactivada',
  error: 'Error',
};

const EVENT_TYPE_COLORS = {
  created: 'default',
  updated: 'info',
  pin_changed: 'warning',
  connected: 'success',
  disconnected: 'error',
  activated: 'success',
  deactivated: 'error',
  error: 'error',
};

const TvScreenEventLog = ({ open, onClose, screen }) => {
  const { data: events, loading, refetch } = useFetch(
    () => BackendAPI.tvScreens.getEvents(screen.id),
    [screen.id],
  );

  const columns = useMemo(() => [
    {
      header: 'Fecha',
      accessorKey: 'created_at',
      size: 180,
      Cell: ({ cell }) => new Date(cell.getValue()).toLocaleString('es-PY'),
    },
    {
      header: 'Tipo',
      accessorKey: 'event_type',
      size: 140,
      Cell: ({ cell }) => (
        <Chip
          label={EVENT_TYPE_LABELS[cell.getValue()] || cell.getValue()}
          color={EVENT_TYPE_COLORS[cell.getValue()] || 'default'}
          size="small"
        />
      ),
    },
    {
      header: 'Detalle',
      accessorKey: 'metadata',
      grow: true,
      Cell: ({ cell }) => {
        const meta = cell.getValue() || {};
        const parts = [];
        if (meta.by) parts.push(`Por: ${meta.by}`);
        if (meta.ip) parts.push(`IP: ${meta.ip}`);
        if (meta.reason) parts.push(`Motivo: ${meta.reason}`);
        if (meta.regenerated) parts.push('(Regenerado automáticamente)');
        if (meta.sessions_revoked) parts.push(`${meta.sessions_revoked} sesión(es) revocada(s)`);
        return parts.length > 0 ? parts.join(' | ') : '-';
      },
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: events || [],
    ...MRT_DEFAULTS,
    initialState: { pagination: { pageSize: 25 }, density: 'compact', sorting: [{ id: 'created_at', desc: true }] },
    state: { isLoading: loading },
    enableSorting: true,
    enableColumnActions: false,
  });

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', fontWeight: 'bold' }}>
        Log de Eventos — {screen.name}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Ubicación: {screen.location}
          </Typography>
        </Box>
        <MaterialReactTable table={table} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TvScreenEventLog;
