import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, IconButton, TextField, InputAdornment, CircularProgress, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';
import DirectAdmissionModal from '../../Components/Hospitalizacion/DirectAdmissionModal';
import BreadcrumbNav from '../../Components/Commons/BreadcrumbNav';
import ExportModal from '../../Components/Commons/ExportModal';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MRT_DEFAULTS } from '../../shared/ui/mrt-config';

const LENGTH_COLOR = {
  short: { color: 'success', label: 'Corta' },
  medium: { color: 'warning', label: 'Media' },
  long: { color: 'error', label: 'Prolongada' },
};

const getStayCategory = (days) => {
  if (days <= 3) return LENGTH_COLOR.short;
  if (days <= 7) return LENGTH_COLOR.medium;
  return LENGTH_COLOR.long;
};

const isRecent = (dateStr) => {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 3600000;
};

const EXPORT_COLUMNS = [
  { header: 'Cedula', accessorKey: 'emergency.patient.ci' },
  { header: 'Nombre', accessorKey: 'emergency.patient.name' },
  { header: 'Apellido', accessorKey: 'emergency.patient.lastname' },
  { header: 'Cama', accessorKey: 'room.name' },
  { header: 'Diagnóstico', accessorKey: 'admission_diagnosis' },
  { header: 'Médico', accessorKey: 'attending_doctor.name' },
  { header: 'Ingreso', accessorKey: 'admission_date' },
  { header: 'Días', accessorKey: 'length_of_stay_days' },
  { header: 'Estado', accessorKey: 'status' },
];

const HospitalizationBoard = ({ onSelectPatient }) => {
  const navigate = useNavigate();
  useDocumentTitle('Hospitalización');
  const permissions = usePermissions();
  const [hospitalizations, setHospitalizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [directAdmissionOpen, setDirectAdmissionOpen] = useState(false);

  const loadCensus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await BackendAPI.hospitalizations.census();
      setHospitalizations(res.data || []);
    } catch {
      setError('Error al cargar el censo de hospitalización');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCensus(); }, [loadCensus]);

  const filtered = useMemo(() => {
    if (!search) return hospitalizations;
    const q = search.toLowerCase();
    return hospitalizations.filter((h) => {
      const p = h.emergency?.patient || {};
      return (p.name || '').toLowerCase().includes(q) ||
        (p.lastname || '').toLowerCase().includes(q) ||
        (p.ci || '').includes(q);
    });
  }, [hospitalizations, search]);

  const columns = useMemo(() => [
    {
      accessorKey: 'room.name', header: 'Cama', size: 120,
      Cell: ({ row }) => (
        <Chip icon={<MeetingRoomIcon />} label={row.original.room?.name || 'Sin asignar'}
          size="small" variant="outlined" />
      ),
    },
    {
      accessorKey: 'emergency.patient.name', header: 'Paciente', size: 180,
      Cell: ({ row }) => {
        const p = row.original.emergency?.patient || {};
        return (
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
              {(p.name || '') + ' ' + (p.lastname || '')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              CI: {p.ci || '-'}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: 'emergency.patient.age', header: 'Edad', size: 60,
      Cell: ({ row }) => row.original.emergency?.patient?.age || '-',
    },
    {
      accessorKey: 'admission_diagnosis', header: 'Diagnóstico Ingreso', size: 200,
      Cell: ({ row }) => {
        const d = row.original.admission_diagnosis || row.original.emergency?.diagnostic || '-';
        return (
          <Typography sx={{ fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'attending_doctor.name', header: 'Médico', size: 140,
      Cell: ({ row }) => row.original.attending_doctor?.name || row.original.admitting_doctor?.name || '-',
    },
    {
      accessorKey: 'admission_date', header: 'Ingreso', size: 100,
      Cell: ({ row }) => row.original.admission_date
        ? new Date(row.original.admission_date).toLocaleDateString() : '-',
    },
    {
      accessorKey: 'length_of_stay_days', header: 'Días', size: 80,
      Cell: ({ row }) => {
        const days = row.original.length_of_stay_days || 0;
        const stay = getStayCategory(days);
        return <Chip icon={<AccessTimeIcon />} label={`${days}d`} size="small" color={stay.color} />;
      },
    },
    {
      accessorKey: 'status', header: 'Estado', size: 80,
      Cell: ({ row }) => (
        <Chip label={row.original.status === 'active' ? 'Activo' : 'Alta'}
          size="small" color={row.original.status === 'active' ? 'primary' : 'default'} />
      ),
    },
    {
      accessorKey: 'updated_at', header: '', size: 70, enableSorting: false,
      Cell: ({ row }) => isRecent(row.original.updated_at)
        ? <Chip label="Nuevo" size="small" color="info" sx={{ fontSize: '0.6rem', height: 20 }} /> : null,
    },
  ], []);

  const table = useMaterialReactTable({
    ...MRT_DEFAULTS,
    columns,
    data: filtered,
    state: { isLoading: loading },
    muiTableBodyRowProps: ({ row }) => ({
      hover: true,
      sx: { cursor: 'pointer' },
      onClick: () => onSelectPatient
        ? onSelectPatient(row.original.emergency_id)
        : navigate(`/patients/hospitalizacion/${row.original.emergency_id}`),
    }),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
          Pacientes Hospitalizados
        </Typography>
        <Chip label={filtered.length} size="small" color="primary" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
        <TextField size="small" placeholder="Buscar paciente por nombre o CI..." value={search}
          onChange={(e) => setSearch(e.target.value)} sx={{ ml: 2, width: 350 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setDirectAdmissionOpen(true)} sx={{ fontSize: '0.8rem' }}>
          Nuevo Ingreso Directo
        </Button>
        <ExportModal data={filtered} columns={EXPORT_COLUMNS} filename="Hospitalizacion" buttonLabel="Descarga" />
        <IconButton onClick={loadCensus} color="primary" disabled={loading}><RefreshIcon /></IconButton>
      </Box>
    ),
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
      <BreadcrumbNav crumbs={[{ label: 'Hospitalización' }]} />
      {error && <Alert severity="error" sx={{ mx: 2, mt: 1 }}>{error}</Alert>}
      <MaterialReactTable table={table} />
      <DirectAdmissionModal open={directAdmissionOpen} onClose={() => setDirectAdmissionOpen(false)} onSuccess={loadCensus} />
    </Box>
  );
};

export default HospitalizationBoard;
