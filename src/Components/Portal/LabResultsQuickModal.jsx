import { useEffect, useMemo, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import { BackendAPI } from '../../services/BackendApi';

const LabResultsQuickModal = ({ open, onClose, emergencyId, onGoToFullPanel }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !emergencyId) return;
    setLoading(true);
    BackendAPI.laboratoryResults.getByEmergency(emergencyId)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [open, emergencyId]);

  const allParams = useMemo(() => {
    const set = new Set();
    results.forEach((r) => (r.lab_result_values || []).forEach((v) => set.add(v.parameter_name)));
    return Array.from(set);
  }, [results]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: '#1565c0', color: 'white', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <ScienceIcon /> RESULTADOS DE LABORATORIO
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>Cargando...</Typography>
        ) : results.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No hay resultados de laboratorio registrados.
          </Typography>
        ) : (
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, p: 0.5 }}>Fecha</TableCell>
                  {allParams.map((p) => (
                    <TableCell key={p} sx={{ fontSize: '0.7rem', fontWeight: 600, p: 0.5 }}>{p}</TableCell>
                  ))}
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, p: 0.5 }}>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((r) => {
                  const valMap = {};
                  (r.lab_result_values || []).forEach((v) => {
                    valMap[v.parameter_name] = v.value;
                  });
                  return (
                    <TableRow key={r.id}>
                      <TableCell sx={{ fontSize: '0.75rem', p: 0.5, whiteSpace: 'nowrap' }}>
                        {r.result_date ? new Date(r.result_date).toLocaleString('es-VE') : '—'}
                      </TableCell>
                      {allParams.map((p) => (
                        <TableCell key={p} sx={{ fontSize: '0.75rem', p: 0.5 }}>{valMap[p] || '—'}</TableCell>
                      ))}
                      <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>{r.notes || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        {onGoToFullPanel && (
          <Button variant="outlined" onClick={onGoToFullPanel} startIcon={<ScienceIcon />}>
            Panel completo
          </Button>
        )}
        <Button onClick={onClose} variant="outlined" color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabResultsQuickModal;
