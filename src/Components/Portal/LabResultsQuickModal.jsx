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
import { useLabParameters } from '../../hooks/useApiData';
import { isOutOfRange } from '../../utils/labUtils';

function formatRange(param, gender) {
  if (!param?.reference_ranges) return '';
  const ranges = param.reference_ranges;
  const key = gender === 'F' || gender === 'Femenino' ? 'female' : 'male';
  const range = ranges[key] || ranges['male'];
  if (!range) return '';
  if (range.type === 'range') return `${range.min}-${range.max}`;
  if (range.type === 'inequality') return `${range.comparator} ${range.value}`;
  if (range.type === 'categorical') return range.value;
  return '';
}

const LabResultsQuickModal = ({ open, onClose, emergencyId, onGoToFullPanel, patientGender }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: allLabParams } = useLabParameters({ enabled: !!(open && emergencyId) });

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

  const sortedResults = useMemo(() =>
    [...results].sort((a, b) => new Date(a.result_date) - new Date(b.result_date)),
  [results]);

  const valueMap = useMemo(() => {
    const lastValues = {};
    const map = {};
    sortedResults.forEach((r) => {
      map[r.id] = {};
      (r.lab_result_values || []).forEach((v) => {
        const prev = lastValues[v.parameter_name];
        const curr = parseFloat(v.value);
        let arrow = null;
        if (prev !== undefined && !isNaN(curr) && !isNaN(prev)) {
          if (curr > prev) arrow = 'up';
          else if (curr < prev) arrow = 'down';
          else arrow = 'flat';
        }
        map[r.id][v.parameter_name] = { value: v.value, arrow };
        if (!isNaN(curr)) lastValues[v.parameter_name] = curr;
      });
    });
    return map;
  }, [sortedResults]);

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
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
          <TableContainer sx={{ mt: 2, overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, p: 0.5, position: 'sticky', left: 0, bgcolor: '#f5f5f5', zIndex: 2, minWidth: 130 }}>Parámetro</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, p: 0.5, position: 'sticky', left: 130, bgcolor: '#f5f5f5', zIndex: 2, minWidth: 80 }}>Ref</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, p: 0.5, position: 'sticky', left: 210, bgcolor: '#f5f5f5', zIndex: 2, minWidth: 60 }}>Unidad</TableCell>
                  {sortedResults.map((r) => (
                    <TableCell key={r.id} sx={{ fontSize: '0.7rem', fontWeight: 600, p: 0.5, textAlign: 'center', minWidth: 110, whiteSpace: 'nowrap' }}>
                      {r.result_date ? new Date(r.result_date).toLocaleString('es-VE') : '—'}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {allParams.map((param) => {
                  const paramConf = paramMap[param];
                  const refText = formatRange(paramConf, patientGender);
                  const unit = paramConf?.unit || '';
                  return (
                    <TableRow key={param} hover>
                      <TableCell sx={{ fontSize: '0.75rem', p: 0.5, fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1, whiteSpace: 'nowrap' }}>
                        {paramConf?.abbreviation ? `${paramConf.abbreviation} (${param})` : param}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', p: 0.5, color: 'text.secondary', position: 'sticky', left: 130, bgcolor: 'white', zIndex: 1, whiteSpace: 'nowrap' }}>
                        {refText || '—'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', p: 0.5, color: 'text.secondary', position: 'sticky', left: 210, bgcolor: 'white', zIndex: 1, whiteSpace: 'nowrap' }}>
                        {unit || '—'}
                      </TableCell>
                      {sortedResults.map((r) => {
                        const cell = valueMap[r.id]?.[param];
                        const raw = cell?.value;
                        const display = raw || '—';
                        const outOfRange = raw ? isOutOfRange(raw, paramConf, patientGender) : false;
                        return (
                          <TableCell
                            key={r.id}
                            sx={{
                              fontSize: '0.75rem',
                              p: 0.5,
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              bgcolor: outOfRange ? '#ffebee' : undefined,
                            }}
                          >
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.2 }}>
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
