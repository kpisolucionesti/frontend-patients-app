import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, useTheme,
} from '@mui/material';
import { red } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ScienceIcon from '@mui/icons-material/Science';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import RemoveIcon from '@mui/icons-material/Remove';
import NotesIcon from '@mui/icons-material/Notes';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BackendAPI } from '../../services/BackendApi';
import { useLabParameters } from '../../hooks/useApiData';
import { useSnackbar } from '../../hooks/useSnackbar';
import LabResultFormModal from './LabResultFormModal';
import { isOutOfRange } from '../../utils/labUtils';
import moment from 'moment';

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

const LabResultsPanel = ({ emergencyId, patientGender, onGoBack }) => {
  const theme = useTheme();
  const { show } = useSnackbar();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editResult, setEditResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedParam, setSelectedParam] = useState('');

  const { data: allLabParams } = useLabParameters({ enabled: !!emergencyId });

  const paramMap = useMemo(() => {
    const map = {};
    (allLabParams || []).forEach((p) => { map[p.name] = p; });
    return map;
  }, [allLabParams]);

  const fetchResults = useCallback(async () => {
    if (!emergencyId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.laboratoryResults.getByEmergency(emergencyId);
      setResults(data || []);
    } catch {
      show('Error al cargar los resultados de laboratorio', 'error');
      setResults([]);
    }
    setLoading(false);
  }, [emergencyId, show]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const allParams = useMemo(() => {
    const set = new Set();
    results.forEach((r) => (r.lab_result_values || []).forEach((v) => set.add(v.parameter_name)));
    return Array.from(set);
  }, [results]);

  useEffect(() => {
    if (!selectedParam && allParams.length > 0) {
      setSelectedParam(allParams[0]);
    }
  }, [allParams, selectedParam]);

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

  const chartData = useMemo(() => {
    if (!selectedParam) return [];
    return sortedResults.map((r) => {
      const found = (r.lab_result_values || []).find((v) => v.parameter_name === selectedParam);
      return {
        date: r.result_date ? moment(r.result_date).format('DD/MM HH:mm') : '—',
        value: found ? parseFloat(found.value) : null,
      };
    }).filter((d) => d.value !== null);
  }, [sortedResults, selectedParam]);

  const hasNotes = useMemo(() => sortedResults.some((r) => r.notes), [sortedResults]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar este resultado de laboratorio?')) return;
    try {
      await BackendAPI.laboratoryResults.delete(emergencyId, id);
      show('Resultado eliminado', 'success');
      fetchResults();
    } catch {
      show('Error al eliminar el resultado', 'error');
    }
  }, [emergencyId, fetchResults, show]);

  const handleSave = useCallback(async (payload) => {
    setSaving(true);
    try {
      if (editResult) {
        await BackendAPI.laboratoryResults.update(emergencyId, editResult.id, payload);
      } else {
        await BackendAPI.laboratoryResults.create(emergencyId, payload);
      }
      setFormOpen(false);
      setEditResult(null);
      show(editResult ? 'Resultado actualizado' : 'Resultado registrado', 'success');
      fetchResults();
    } catch {
      show('Error al guardar el resultado', 'error');
    }
    setSaving(false);
  }, [emergencyId, editResult, fetchResults, show]);

  if (!emergencyId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Seleccione una emergencia para ver sus resultados de laboratorio.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 8 }}>
        <CircularProgress size={32} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: theme.palette.primary.main, fontSize: '0.85rem' }}>
            Laboratorio
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setEditResult(null); setFormOpen(true); }}>
          Nuevo Resultado
        </Button>
      </Box>

      {results.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScienceIcon sx={{ fontSize: 28, color: theme.palette.grey[400], mb: 1 }} />
          <Typography color="text.secondary">
            No hay resultados de laboratorio registrados para esta emergencia.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setEditResult(null); setFormOpen(true); }} sx={{ mt: 2 }}>
            Registrar primer resultado
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Tabla de resultados</Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', position: 'sticky', left: 0, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, zIndex: 2, minWidth: 140 }}>Parámetro</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', position: 'sticky', left: 140, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, zIndex: 2, minWidth: 90 }}>Ref</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', position: 'sticky', left: 230, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, zIndex: 2, minWidth: 70 }}>Unidad</TableCell>
                    {sortedResults.map((r) => (
                      <TableCell key={r.id} sx={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 130, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                          <span>{r.result_date ? moment(r.result_date).format('DD/MM HH:mm') : '—'}</span>
                          <Box sx={{ display: 'flex', gap: 0.3 }}>
                            <Tooltip title="Editar resultado" arrow>
                              <IconButton size="small" aria-label="Editar resultado" sx={{ p: 0.2 }} onClick={() => { setEditResult(r); setFormOpen(true); }}>
                                <EditIcon sx={{ fontSize: 13, color: theme.palette.primary.contrastText }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar resultado" arrow>
                              <IconButton size="small" aria-label="Eliminar resultado" sx={{ p: 0.2 }} onClick={() => handleDelete(r.id)}>
                                <DeleteIcon sx={{ fontSize: 13, color: theme.palette.primary.contrastText }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
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
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 500, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1, whiteSpace: 'nowrap' }}>
                          {paramConf?.abbreviation ? `${paramConf.abbreviation} (${param})` : param}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', position: 'sticky', left: 140, bgcolor: 'background.paper', zIndex: 1, whiteSpace: 'nowrap' }}>
                          {refText || '—'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', position: 'sticky', left: 230, bgcolor: 'background.paper', zIndex: 1, whiteSpace: 'nowrap' }}>
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
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                bgcolor: outOfRange ? red[50] : undefined,
                              }}
                            >
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.2 }}>
                                {outOfRange && (
                                  <WarningAmberIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />
                                )}
                                {display}
                                {cell?.arrow === 'up' && (
                                  <ArrowDropUpIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />
                                )}
                                {cell?.arrow === 'down' && (
                                  <ArrowDropDownIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
                                )}
                                {cell?.arrow === 'flat' && (
                                  <RemoveIcon sx={{ fontSize: 14, color: theme.palette.grey[500] }} />
                                )}
                              </Box>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                    <TableCell sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'text.secondary', position: 'sticky', left: 0, bgcolor: theme.palette.grey[50], zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <NotesIcon sx={{ fontSize: 14 }} />
                        Notas
                      </Box>
                    </TableCell>
                    <TableCell sx={{ position: 'sticky', left: 140, bgcolor: theme.palette.grey[50], zIndex: 1 }}></TableCell>
                    <TableCell sx={{ position: 'sticky', left: 230, bgcolor: theme.palette.grey[50], zIndex: 1 }}></TableCell>
                    {sortedResults.map((r) => (
                      <TableCell key={r.id} sx={{ fontSize: '0.7rem', color: 'text.secondary', textAlign: 'center', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.notes || '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {allParams.length > 0 && chartData.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>Gráfico de evolución</Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Parámetro</InputLabel>
                  <Select value={selectedParam} label="Parámetro" onChange={(e) => setSelectedParam(e.target.value)}>
                    {allParams.map((p) => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" name={selectedParam} stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          )}
        </>
      )}

      <LabResultFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditResult(null); }}
        onSave={handleSave}
        saving={saving}
        emergencyId={emergencyId}
        editResult={editResult}
      />
    </Box>
  );
};

export default LabResultsPanel;
