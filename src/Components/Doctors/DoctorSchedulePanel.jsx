import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box, Button, FormControl, IconButton, InputLabel, MenuItem, Paper,
  Select, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Delete, Save } from '@mui/icons-material';
import { BackendAPI } from '../../services/BackendApi';
import { useDoctors } from '../../hooks/useApiData';
import { useSnackbar } from '../../hooks/useSnackbar';

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const MODE_OPTIONS = [
  { value: 'scheduled', label: 'Previa cita' },
  { value: 'walk_in', label: 'Orden de llegada' },
];

const EMPTY_BLOCK = {
  day_of_week: 1,
  start_time: '08:00',
  end_time: '12:00',
  appointment_duration: 30,
  appointment_mode: 'scheduled',
  max_patients: 0,
  is_active: true,
};

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const DoctorSchedulePanel = () => {
  const { data: doctors } = useDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const { show } = useSnackbar();
  const loadedRef = useRef(false);



  useEffect(() => {
    if (!selectedDoctorId) {
      setBlocks([]);
      loadedRef.current = false;
      return;
    }
    loadedRef.current = false;
    BackendAPI.doctorSchedules.getByDoctor(selectedDoctorId)
      .then((data) => {
        const mapped = (data || []).map((s) => ({
          id: s.id,
          day_of_week: s.day_of_week,
          start_time: s.start_time?.substring(0, 5) || '08:00',
          end_time: s.end_time?.substring(0, 5) || '12:00',
          appointment_duration: s.appointment_duration || 30,
          appointment_mode: s.appointment_mode || 'scheduled',
          max_patients: s.max_patients || 0,
          is_active: s.is_active !== false,
        }));
        if (mapped.length === 0) {
          setBlocks([{ ...EMPTY_BLOCK, _key: Date.now() }]);
        } else {
          setBlocks(mapped.map((b) => ({ ...b, _key: Date.now() + Math.random() })));
        }
        loadedRef.current = true;
      })
      .catch(() => {
        setBlocks([{ ...EMPTY_BLOCK, _key: Date.now() }]);
        loadedRef.current = true;
      });
  }, [selectedDoctorId]);

  const handleBlockChange = useCallback((key, field, value) => {
    setBlocks((prev) => prev.map((b) => b._key === key ? { ...b, [field]: value } : b));
  }, []);

  const handleAddBlock = useCallback(() => {
    setBlocks((prev) => [...prev, { ...EMPTY_BLOCK, _key: Date.now() + Math.random() }]);
  }, []);

  const handleRemoveBlock = useCallback((key) => {
    setBlocks((prev) => prev.filter((b) => b._key !== key));
  }, []);

  const validateTime = (time) => TIME_REGEX.test(time);

  const handleSave = useCallback(async () => {
    if (!selectedDoctorId) return;
    for (const block of blocks) {
      if (!validateTime(block.start_time) || !validateTime(block.end_time)) {
        show('Formato de hora inválido (HH:MM)', 'error');
        return;
      }
    }
    setSaving(true);
    try {
      const payload = blocks.map(({ _key, ...rest }) => rest);
      await BackendAPI.doctorSchedules.update(selectedDoctorId, payload);
      show('Agenda guardada exitosamente', 'success');
    } catch {
      show('Error al guardar la agenda', 'error');
    }
    setSaving(false);
  }, [selectedDoctorId, blocks, show]);



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Médico</InputLabel>
          <Select
            value={selectedDoctorId}
            label="Médico"
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            {(doctors || []).filter((d) => d.status === 'active').map((doc) => (
              <MenuItem key={doc.id} value={doc.id}>
                {doc.name} — {doc.specialty?.name || ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedDoctorId && (
        <Paper sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" fontWeight={600}>Horario Semanal</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Agregar bloque" arrow>
                <IconButton color="primary" onClick={handleAddBlock}>
                  <Add />
                </IconButton>
              </Tooltip>
              <Button variant="outlined" color="success" startIcon={<Save />} onClick={handleSave} disabled={saving || blocks.length === 0}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </Box>
          <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto', boxShadow: 3, borderRadius: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}> 100 }}>Día</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}> 90 }}>Desde</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}> 90 }}>Hasta</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}> 90 }}>Duración</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}> 140 }}>Modo</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}> 80 }}>Máx. Pac.</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}> 60 }}>Activo</TableCell>
                  <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}> 50 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay horarios configurados. Agregue un bloque para comenzar.
                    </TableCell>
                  </TableRow>
                ) : (
                  blocks.map((block) => (
                    <TableRow key={block._key} hover>
                      <TableCell sx={{ p: 0.5, minWidth: 100 }}>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={block.day_of_week}
                            onChange={(e) => handleBlockChange(block._key, 'day_of_week', e.target.value)}
                          >
                            {DAYS.map((d) => (
                              <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <TextField
                          variant="standard"
                          type="time"
                          size="small"
                          value={block.start_time}
                          onChange={(e) => handleBlockChange(block._key, 'start_time', e.target.value)}
                          inputProps={{ step: 300 }}
                          sx={{ width: 90 }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <TextField
                          variant="standard"
                          type="time"
                          size="small"
                          value={block.end_time}
                          onChange={(e) => handleBlockChange(block._key, 'end_time', e.target.value)}
                          inputProps={{ step: 300 }}
                          sx={{ width: 90 }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <TextField
                          variant="standard"
                          type="number"
                          size="small"
                          value={block.appointment_duration}
                          onChange={(e) => handleBlockChange(block._key, 'appointment_duration', parseInt(e.target.value) || 30)}
                          inputProps={{ min: 5, max: 240 }}
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <Select
                            value={block.appointment_mode}
                            onChange={(e) => handleBlockChange(block._key, 'appointment_mode', e.target.value)}
                          >
                            {MODE_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <TextField
                          variant="standard"
                          type="number"
                          size="small"
                          value={block.max_patients}
                          onChange={(e) => handleBlockChange(block._key, 'max_patients', parseInt(e.target.value) || 0)}
                          inputProps={{ min: 0, max: 999 }}
                          sx={{ width: 60 }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <input
                          type="checkbox"
                          checked={block.is_active}
                          onChange={(e) => handleBlockChange(block._key, 'is_active', e.target.checked)}
                          style={{ width: 20, height: 20, cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell sx={{ p: 0.5 }}>
                        <IconButton size="small" color="error" onClick={() => handleRemoveBlock(block._key)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default DoctorSchedulePanel;
