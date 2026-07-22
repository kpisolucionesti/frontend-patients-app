import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PhysicalExamModal from './PhysicalExamModal';
import { BackendAPI } from '../../services/BackendApi';

const ROWS = [
  { label: 'Cabeza', key: 'cabeza' },
  { label: 'Ojo', key: 'ojo' },
  { label: 'Cuello', key: 'cuello' },
  { label: 'ORL', key: 'orl' },
  { label: 'Torax', key: 'torax' },
  { label: 'Cardiovascular', key: 'cardiovascular' },
  { label: 'Abdomen', key: 'abdomen' },
  { label: 'Genitales', key: 'genitales' },
  { label: 'Extremidades', key: 'extremidades' },
  { label: 'Neurológico', key: 'neurologico' },
];

const PhysicalExamTable = ({ emergencyId, readOnly }) => {
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchExam = useCallback(async () => {
    if (!emergencyId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.physicalExams.getByEmergency(emergencyId);
      setExam(data?.id ? data : null);
    } catch {
      setExam(null);
    }
    setLoading(false);
  }, [emergencyId]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

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
      await fetchExam();
    } catch {
      // error handled by interceptor
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <>
      <Paper sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AssignmentIcon sx={{ fontSize: 18, color: '#1565c0' }} />
            <Typography variant="caption" fontWeight={600} sx={{ color: '#1565c0' }}>
              EXAMEN FÍSICO
            </Typography>
          </Box>
          {!readOnly && (
            <Button
              size="small"
              variant="outlined"
              startIcon={hasData ? <EditIcon /> : null}
              onClick={() => setModalOpen(true)}
              sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}
            >
              {hasData ? 'Editar' : 'Agregar'}
            </Button>
          )}
        </Box>
        {hasData ? (
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5, width: '30%' }}>Área</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Hallazgo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ROWS.map((r) => (
                  <TableRow key={r.key}>
                    <TableCell sx={{ fontSize: '0.75rem', p: 0.5, fontWeight: 500, color: 'text.secondary' }}>
                      {r.label}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>
                      {exam[r.key] && typeof exam[r.key] === 'string' && exam[r.key].trim() ? exam[r.key] : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 1 }}>
            Sin examen físico registrado
          </Typography>
        )}
      </Paper>

      <PhysicalExamModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialValues={exam || {}}
        onSave={handleSave}
        saving={saving}
      />
    </>
  );
};

export default PhysicalExamTable;
