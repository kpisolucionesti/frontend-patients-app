import { useState, useMemo } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PhysicalExamModal from './PhysicalExamModal';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';

const ROWS = [
  { label: 'Cabeza', key: 'cabeza' },
  { label: 'Ojo', key: 'ojo' },
  { label: 'Cuello', key: 'cuello' },
  { label: 'ORL', key: 'orl' },
  { label: 'Tórax', key: 'torax' },
  { label: 'Cardiovascular', key: 'cardiovascular' },
  { label: 'Abdomen', key: 'abdomen' },
  { label: 'Genitales', key: 'genitales' },
  { label: 'Extremidades', key: 'extremidades' },
  { label: 'Neurológico', key: 'neurologico' },
];

const PhysicalExamTable = ({ emergencyId, readOnly, doctorId }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: exam, loading, refetch } = useFetch(
    () => emergencyId ? BackendAPI.physicalExams.getByEmergency(emergencyId).then(d => d?.id ? d : null) : Promise.resolve(null),
    [emergencyId],
  );

  const hasData = useMemo(() => {
    if (!exam) return false;
    return ROWS.some((r) => exam[r.key] && typeof exam[r.key] === 'string' && exam[r.key].trim());
  }, [exam]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      if (exam?.id) {
        await BackendAPI.physicalExams.update(emergencyId, exam.id, values);
      } else {
        await BackendAPI.physicalExams.create(emergencyId, values);
      }
      setModalOpen(false);
      refetch();
    } catch { /* handled by interceptor */ }
    setSaving(false);
  };

  return (
    <>
      <Paper sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: hasData ? 1 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <AssignmentIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.75rem', letterSpacing: '0.03em' }}>
              EXAMEN FÍSICO
            </Typography>
          </Box>
          {!readOnly && (
            <Button size="small" variant="outlined"
              startIcon={hasData ? <EditIcon /> : null}
              onClick={() => setModalOpen(true)} disabled={loading}
              sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}>
              {loading ? '...' : hasData ? 'Editar' : 'Agregar'}
            </Button>
          )}
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
            <CircularProgress size={18} />
          </Box>
        ) : hasData ? (
          <TableContainer sx={{ borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5, width: '30%' }}>Área</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Hallazgo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ROWS.map((r) => (
                  <TableRow key={r.key}>
                    <TableCell sx={{ fontSize: '0.72rem', p: 0.5, fontWeight: 500, color: 'text.secondary' }}>
                      {r.label}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', p: 0.5 }}>
                      {exam[r.key] && typeof exam[r.key] === 'string' && exam[r.key].trim() ? exam[r.key] : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 1, fontSize: '0.7rem' }}>
            Sin examen físico registrado
          </Typography>
        )}
      </Paper>

      <PhysicalExamModal open={modalOpen} onClose={() => setModalOpen(false)}
        initialValues={exam || {}} onSave={handleSave} saving={saving} />
    </>
  );
};

export default PhysicalExamTable;
