import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, IconButton, TextField, InputAdornment, CircularProgress, Alert, Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';
import DirectAdmissionModal from './DirectAdmissionModal';
import BreadcrumbNav from '../Commons/BreadcrumbNav';
import ExportModal from '../Commons/ExportModal';

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
    } catch (err) {
      setError('Error al cargar el censo de hospitalización');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCensus(); }, [loadCensus]);

  const filtered = hospitalizations.filter((h) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const p = h.emergency?.patient || {};
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.lastname || '').toLowerCase().includes(q) ||
      (p.ci || '').includes(q)
    );
  });

  const canEdit = permissions.includes('hospitalizacion.edit');

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
      <BreadcrumbNav crumbs={[{ label: 'Hospitalización' }]} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
            Pacientes Hospitalizados
          </Typography>
          <Chip label={filtered.length} size="small" color="primary" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setDirectAdmissionOpen(true)} sx={{ fontSize: '0.8rem' }}>
            Nuevo Ingreso Directo
          </Button>
          <IconButton onClick={loadCensus} color="primary" disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 1, flexShrink: 0, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar paciente por nombre o CI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 350 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />
        <ExportModal data={filtered} columns={EXPORT_COLUMNS} filename="Hospitalizacion" buttonLabel="Descarga" />
      </Box>

      {error && <Alert severity="error" sx={{ mx: 2, mb: 1 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 2, pb: 2 }}>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Cama</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Paciente</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Edad</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Diagnóstico Ingreso</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Médico</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Ingreso</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Días</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>Estado</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, width: 70, fontSize: '0.75rem' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay pacientes hospitalizados
                    </TableCell>
                  </TableRow>
                ) : filtered.map((h) => {
                  const p = h.emergency?.patient || {};
                  const stay = getStayCategory(h.length_of_stay_days || 0);
                  return (
                    <TableRow
                      key={h.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onSelectPatient ? onSelectPatient(h.emergency_id) : navigate(`/patients/hospitalizacion/${h.emergency_id}`)}
                    >
                      <TableCell>
                        <Chip
                          icon={<MeetingRoomIcon />}
                          label={h.room?.name || 'Sin asignar'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {(p.name || '') + ' ' + (p.lastname || '')}
                        <Typography variant="caption" display="block" color="text.secondary">
                          CI: {p.ci || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{p.age || '-'}</TableCell>
                      <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {h.admission_diagnosis || h.emergency?.diagnostic || '-'}
                      </TableCell>
                      <TableCell>
                        {h.attending_doctor?.name || h.admitting_doctor?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {h.admission_date ? new Date(h.admission_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<AccessTimeIcon />}
                          label={`${h.length_of_stay_days || 0}d`}
                          size="small"
                          color={stay.color}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={h.status === 'active' ? 'Activo' : 'Alta'}
                          size="small"
                          color={h.status === 'active' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {isRecent(h.updated_at) && (
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

      <DirectAdmissionModal
        open={directAdmissionOpen}
        onClose={() => setDirectAdmissionOpen(false)}
        onSuccess={loadCensus}
      />
    </Box>
  );
};

export default HospitalizationBoard;
