import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Paper, Typography, FormControl, InputLabel, Select, MenuItem, Grid,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RepeatIcon from '@mui/icons-material/Repeat';
import PatientInfoPanel from './PatientInfoPanel';
import PatientDashboard from './PatientDashboard';
import { BackendAPI } from '../../services/BackendApi';

const GENDER_MAP = { M: 'Masculino', F: 'Femenino' };

const HistoricalCasePanel = ({ patient, currentEmergencyId }) => {
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patient?.id) return;
    BackendAPI.emergencies.getAll({ patient_id: patient.id, per_page: 100 })
      .then((res) => {
        const all = res.data || [];
        const closed = all.filter((c) =>
          c.id !== currentEmergencyId && [2, 3, 4, 5].includes(c.status)
        );
        setCases(closed);
      })
      .catch(() => setCases([]));
  }, [patient?.id, currentEmergencyId]);

  useEffect(() => {
    if (!selectedCaseId) {
      setSelectedCase(null);
      return;
    }
    setLoading(true);
    BackendAPI.emergencies.getById(selectedCaseId)
      .then(setSelectedCase)
      .catch(() => setSelectedCase(null))
      .finally(() => setLoading(false));
  }, [selectedCaseId]);

  const patientStats = useMemo(() => {
    if (!selectedCase || !patient) return null;
    return { last_visit_date: selectedCase.ingress_date, total_visits: cases.length + 1 };
  }, [selectedCase, patient, cases.length]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 0, overflow: 'auto', px: 2, pt: 1 }}>
      <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5' }}>
        <FormControl variant="standard" fullWidth size="small">
          <InputLabel sx={{ fontWeight: 600 }}>Seleccionar caso anterior</InputLabel>
          <Select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            label="Seleccionar caso anterior"
          >
            <MenuItem value="">
              <em>— Seleccione un caso —</em>
            </MenuItem>
            {cases.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.ingress_date} — {c.diagnostic || 'Sin diagnóstico'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {loading && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Cargando caso...
        </Typography>
      )}

      {selectedCase && !loading && (
        <>
          <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Paper sx={{ p: 1.5, bgcolor: '#e3f2fd', borderLeft: '4px solid #1565c0' }}>
                <Typography variant="caption" fontWeight={700} sx={{ mb: 0.75, display: 'block', color: '#1565c0', fontSize: '0.8rem' }}>
                  DATOS DEL PACIENTE
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Nombre</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.name} {patient.lastname}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>CI</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.ci || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Edad</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.age || '?'} años</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Sexo</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{GENDER_MAP[patient.gender] || patient.gender || 'N/A'}</Typography>
                  </Grid>
                  {patient.representante && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>Representante</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.representante}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: '#212121', fontWeight: 600, fontSize: '0.7rem' }}>CI Representante</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{patient.representante_ci || 'N/A'}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Paper sx={{ bgcolor: '#e3f2fd', p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CalendarTodayIcon color="primary" sx={{ fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Fecha de Ingreso</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{selectedCase.ingress_date || 'N/A'}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ bgcolor: '#f3e5f5', p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <RepeatIcon color="secondary" sx={{ fontSize: 18 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Total Visitas</Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{patientStats?.total_visits ?? '0'}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <PatientInfoPanel
                patient={patient}
                emergency={selectedCase}
                readOnly
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <PatientDashboard
                patient={patient}
                stats={patientStats}
                vitalSigns={[]}
                emergencyId={selectedCase.id}
                readOnly
              />
            </Box>
          </Box>
        </>
      )}

      {cases.length === 0 && !selectedCaseId && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No hay casos anteriores cerrados para este paciente.
        </Typography>
      )}
    </Box>
  );
};

export default HistoricalCasePanel;
