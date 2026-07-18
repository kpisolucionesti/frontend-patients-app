import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, IconButton, TextField, InputAdornment, CircularProgress, Alert, Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { BackendAPI } from '../../services/BackendApi';
import usePermissions from '../../hooks/usePermissions';
import DirectAdmissionModal from './DirectAdmissionModal';

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

const HospitalizationBoard = () => {
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          <LocalHospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Hospitalización - Pacientes Ingresados
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setDirectAdmissionOpen(true)} sx={{ fontSize: '0.8rem' }}>
            Nuevo Ingreso Directo
          </Button>
          <IconButton onClick={loadCensus} color="primary" disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <TextField
        size="small"
        placeholder="Buscar paciente por nombre o CI..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, width: 350 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Cama</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Edad</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Diagnóstico Ingreso</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Médico</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ingreso</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Días</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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
                    onClick={() => navigate(`/patients/hospitalizacion/${h.emergency_id}`)}
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
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
