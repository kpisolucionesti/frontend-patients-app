import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { auditLogsApi } from '../../services/auditLogsApi';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';

const ACTION_LABELS = {
  create_emergency: 'Emergencia creada',
  update_emergency: 'Emergencia actualizada',
  create_user: 'Usuario creado',
  update_user: 'Usuario actualizado',
  delete_user: 'Usuario eliminado',
  update_email_settings: 'Config. correo',
  test_email_settings: 'Prueba correo',
  update_company_settings: 'Config. empresa',
  update_session_settings: 'Config. sesion',
  update_dynamic_settings: 'Config. dinamica',
  update_password_policy: 'Politica contrasenas',
  update_general_settings: 'Config. general',
  create_patient: 'Paciente creado',
  update_patient: 'Paciente actualizado',
  create_doctor: 'Medico creado',
  update_doctor: 'Medico actualizado',
  create_profile: 'Perfil creado',
  update_profile: 'Perfil actualizado',
  login: 'Inicio sesion',
  logout: 'Cierre sesion',
};

const formatAction = (action) => {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/Config /, 'Config. ');
};

const AuditLogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ from: '', to: '', action_name: '' });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 1, per_page: 1000 };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.action_name) params.action_name = filters.action_name;
      const data = await auditLogsApi.list(params);
      setLogs(data.data || []);
      setTotal(data.total || 0);
    } catch { setLogs([]); }
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      size: 140,
      Cell: ({ cell }) => new Date(cell.getValue()).toLocaleString(),
    },
    {
      accessorKey: 'user',
      header: 'Usuario',
      size: 130,
      Cell: ({ cell }) => cell.getValue()?.name || cell.getValue()?.username || '-',
    },
    {
      accessorKey: 'action',
      header: 'Accion',
      size: 150,
      Cell: ({ cell }) => formatAction(cell.getValue()),
    },
    {
      accessorKey: 'description',
      header: 'Descripcion',
      Cell: ({ cell }) => cell.getValue() || '-',
    },
    {
      accessorKey: 'ip_address',
      header: 'IP',
      size: 110,
      Cell: ({ cell }) => cell.getValue() || '-',
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: logs,
    ...MRT_DEFAULTS,
    enableRowActions: false,
    enablePagination: true,
    rowCount: total,
    manualPagination: false,
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <TextField variant="standard" size="small" type="date" label="Desde"
            value={filters.from} onChange={handleFilterChange('from')}
            InputLabelProps={{ shrink: true }} sx={{ width: 140 }}
            inputProps={{ style: { fontSize: '0.7rem' } }} />
          <TextField variant="standard" size="small" type="date" label="Hasta"
            value={filters.to} onChange={handleFilterChange('to')}
            InputLabelProps={{ shrink: true }} sx={{ width: 140 }}
            inputProps={{ style: { fontSize: '0.7rem' } }} />
          <TextField variant="standard" size="small" label="Accion"
            value={filters.action_name} onChange={handleFilterChange('action_name')}
            sx={{ width: 160 }} inputProps={{ style: { fontSize: '0.7rem' } }} />
          <Button size="small" variant="outlined" startIcon={<SearchIcon sx={{ fontSize: 16 }} />}
            onClick={fetchLogs} sx={{ fontSize: '0.75rem', py: 0.25 }}>
            Buscar
          </Button>
        </Box>
      ),
      [filters.from, filters.to, filters.action_name, fetchLogs],
    ),
    getRowId: (row) => row.id?.toString() || '',
    state: { isLoading: loading },
    muiTablePaperProps: {
      sx: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, boxShadow: 3, borderRadius: 1, overflow: 'hidden' },
    },
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, p: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem', mb: 0.75 }}>
        Registro de Actividad
      </Typography>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default AuditLogsViewer;
