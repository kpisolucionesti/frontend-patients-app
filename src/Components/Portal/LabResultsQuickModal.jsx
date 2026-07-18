import { useEffect, useMemo, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box,
} from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import RemoveIcon from '@mui/icons-material/Remove';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { isOutOfRange } from '../../utils/labUtils';

const LabResultsQuickModal = ({ open, onClose, emergencyId, onGoToFullPanel, patientGender }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: allLabParams } = useFetch(
    () => (open && emergencyId) ? BackendAPI.labParameters.getAll() : Promise.resolve([]),
    [open, emergencyId],
  );

  const paramMap = useMemo(() => {
    const map = {};
    (allLabParams || []).forEach((p) => { map[p.name] = p; });
    return map;
  }, [allLabParams]);

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
                {(() => {
                  const sorted = [...results].sort((a, b) => new Date(a.result_date) - new Date(b.result_date));
                  const lastValues = {};
                  return sorted.map((r) => {
                    const valMap = {};
                    (r.lab_result_values || []).forEach((v) => {
                      const prev = lastValues[v.parameter_name];
                      const curr = parseFloat(v.value);
                      let arrow = null;
                      if (prev !== undefined && !isNaN(curr) && !isNaN(prev)) {
                        if (curr > prev) arrow = 'up';
                        else if (curr < prev) arrow = 'down';
                        else arrow = 'flat';
                      }
                      valMap[v.parameter_name] = { value: v.value, arrow };
                      if (!isNaN(curr)) lastValues[v.parameter_name] = curr;
                    });
                    return (
                      <TableRow key={r.id}>
                        <TableCell sx={{ fontSize: '0.75rem', p: 0.5, whiteSpace: 'nowrap' }}>
                          {r.result_date ? new Date(r.result_date).toLocaleString('es-VE') : '—'}
                        </TableCell>
                        {allParams.map((p) => {
                          const cell = valMap[p];
                          const raw = cell?.value;
                          const display = raw || '—';
                          const paramConf = paramMap[p];
                          const outOfRange = raw ? isOutOfRange(raw, paramConf, patientGender) : false;
                          return (
                            <TableCell
                              key={p}
                              sx={{
                                fontSize: '0.75rem',
                                p: 0.5,
                                bgcolor: outOfRange ? '#ffebee' : undefined,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                {outOfRange && (
                                  <WarningAmberIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                                )}
                                {display}
                                {cell?.arrow === 'up' && (
                                  <ArrowDropUpIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
                                )}
                                {cell?.arrow === 'down' && (
                                  <ArrowDropDownIcon sx={{ fontSize: 18, color: '#d32f2f' }} />
                                )}
                                {cell?.arrow === 'flat' && (
                                  <RemoveIcon sx={{ fontSize: 14, color: '#9e9e9e' }} />
                                )}
                              </Box>
                            </TableCell>
                          );
                        })}
                        <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>{r.notes || '—'}</TableCell>
                      </TableRow>
                    );
                  });
                })()}
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
