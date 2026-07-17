import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Paper, Typography, Button, IconButton, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ScienceIcon from '@mui/icons-material/Science';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import RemoveIcon from '@mui/icons-material/Remove';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import LabResultFormModal from './LabResultFormModal';
import moment from 'moment';

function isOutOfRange(valueStr, param, gender) {
  if (!param?.reference_ranges || valueStr == null) return false;
  const ranges = param.reference_ranges;
  const key = gender === 'Femenino' ? 'female' : 'male';
  const range = ranges[key] || ranges['male'];
  if (!range || !range.type) return false;
  const num = parseFloat(String(valueStr).replace(',', '.'));
  if (isNaN(num)) return false;
  if (range.type === 'range') return num < range.min || num > range.max;
  if (range.type === 'inequality') {
    if (range.comparator === '<') return num >= range.value;
    if (range.comparator === '>') return num <= range.value;
    if (range.comparator === '<=') return num > range.value;
    if (range.comparator === '>=') return num < range.value;
  }
  if (range.type === 'categorical') return String(valueStr).trim().toLowerCase() !== range.value.trim().toLowerCase();
  return false;
}

const LabResultsPanel = ({ emergencyId, patientGender, onGoBack }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editResult, setEditResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedParam, setSelectedParam] = useState('');

  const { data: allLabParams } = useFetch(
    () => emergencyId ? BackendAPI.labParameters.getAll() : Promise.resolve([]),
    [emergencyId],
  );

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
      setResults([]);
    }
    setLoading(false);
  }, [emergencyId]);

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

  const chartData = useMemo(() => {
    if (!selectedParam) return [];
    const sorted = [...results].sort((a, b) => new Date(a.result_date) - new Date(b.result_date));
    return sorted.map((r) => {
      const found = (r.lab_result_values || []).find((v) => v.parameter_name === selectedParam);
      return {
        date: r.result_date ? moment(r.result_date).format('DD/MM HH:mm') : '—',
        value: found ? parseFloat(found.value) : null,
      };
    }).filter((d) => d.value !== null);
  }, [results, selectedParam]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar este resultado de laboratorio?')) return;
    try {
      await BackendAPI.laboratoryResults.delete(emergencyId, id);
      fetchResults();
    } catch {
      // ignore
    }
  }, [emergencyId, fetchResults]);

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
      fetchResults();
    } catch {
      // ignore
    }
    setSaving(false);
  }, [emergencyId, editResult, fetchResults]);

  if (!emergencyId) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Seleccione una emergencia para ver sus resultados de laboratorio.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScienceIcon sx={{ color: '#1565c0' }} />
          <Typography variant="h6" fontWeight={600} sx={{ color: '#1565c0' }}>
            Laboratorio
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => { setEditResult(null); setFormOpen(true); }}>
          Nuevo Resultado
        </Button>
      </Box>

      {results.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScienceIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
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
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Fecha</TableCell>
                    {allParams.map((p) => (
                      <TableCell key={p} sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{p}</TableCell>
                    ))}
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Notas</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, width: 100 }}>Acciones</TableCell>
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
                          <TableCell sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                            {r.result_date ? moment(r.result_date).format('DD/MM/YYYY HH:mm') : '—'}
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
                                  whiteSpace: 'nowrap',
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
                          <TableCell sx={{ fontSize: '0.75rem' }}>{r.notes || '—'}</TableCell>
                          <TableCell>
                            <Tooltip title="Editar" arrow>
                              <IconButton size="small" onClick={() => { setEditResult(r); setFormOpen(true); }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar" arrow>
                              <IconButton size="small" onClick={() => handleDelete(r.id)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
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
                  <Line type="monotone" dataKey="value" name={selectedParam} stroke="#1565c0" strokeWidth={2} dot={{ r: 4 }} />
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
