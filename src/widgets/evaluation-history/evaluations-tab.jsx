import { useState, useMemo, useCallback } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';
import PhysicalExamTable from '../../Components/Portal/PhysicalExamTable';
import RecipeList from '../../Components/Emergency/RecipeList';
import EvaluationHistorySection from '../../features/emergency/evaluation-history-section';
import usePermissions from '../../hooks/usePermissions';

const EvaluationsTab = ({ emergency, readOnly, onDataChange }) => {
  const emergencyId = emergency?.id;
  const { user } = useAuth();
  const permissions = usePermissions();
  const canEditEval = permissions.includes('evaluaciones.create') || permissions.includes('evaluaciones.edit');
  const effectiveReadOnly = readOnly || emergency?.patient?.disabled || !canEditEval;
  const loggedDoctorId = Number(user?.doctor_id) || null;
  const isPrimaryDoctor = emergency?.primary_doctor?.id === loggedDoctorId;

  const [diagnosticImpression, setDiagnosticImpression] = useState('');
  const [plan, setPlan] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [savingEval, setSavingEval] = useState(false);
  const [validation, setValidation] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { data: evaluations = [], refetch } = useFetch(
    () => emergencyId ? BackendAPI.evaluations.getAll(emergencyId) : Promise.resolve([]),
    [emergencyId],
  );

  const myEvaluations = useMemo(() => {
    return (evaluations || [])
      .filter((ev) => ev.doctor_id === loggedDoctorId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [evaluations, loggedDoctorId]);

  const handleEditEvaluation = useCallback((evaluation) => {
    setDiagnosticImpression(evaluation.diagnostic_impression || '');
    setPlan(evaluation.plan || '');
    setSuggestions(evaluation.suggestions || '');
    setEditingId(evaluation.id);
    setValidation(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setDiagnosticImpression('');
    setPlan('');
    setSuggestions('');
    setValidation(false);
  }, []);

  const handleSaveEvaluation = useCallback(async () => {
    if (!emergencyId) return;
    if (!diagnosticImpression.trim() || !plan.trim()) {
      setValidation(true);
      return;
    }
    setValidation(false);
    setSavingEval(true);
    try {
      if (editingId) {
        await BackendAPI.evaluations.update(emergencyId, editingId, {
          diagnostic_impression: diagnosticImpression,
          plan,
          suggestions,
        });
        setEditingId(null);
      } else {
        await BackendAPI.evaluations.create(emergencyId, {
          doctor_id: loggedDoctorId,
          diagnostic_impression: diagnosticImpression,
          plan,
          suggestions,
        });
      }
      setDiagnosticImpression('');
      setPlan('');
      setSuggestions('');
      refetch();
      if (onDataChange) onDataChange();
    } catch { /* handled by interceptor */ }
    setSavingEval(false);
  }, [emergencyId, loggedDoctorId, editingId, diagnosticImpression, plan, suggestions, refetch, onDataChange]);

  if (!emergency) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* physical exam */}
      <Box>
        <PhysicalExamTable emergencyId={emergencyId} readOnly={effectiveReadOnly} doctorId={loggedDoctorId} />
      </Box>

      {/* new evaluation form */}
      <Paper sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.03em' }}>
              {editingId ? 'EDITAR EVALUACIÓN' : 'NUEVA EVALUACIÓN'}
            </Typography>
            <Typography variant="caption" sx={{ ml: 0.75, fontSize: '0.7rem', color: isPrimaryDoctor ? 'primary.main' : 'secondary.main', fontStyle: 'italic' }}>
              ({isPrimaryDoctor ? 'Médico Principal' : 'Interconsulta'})
            </Typography>
          </Box>
          {!effectiveReadOnly && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {editingId && (
                <Button size="small" variant="outlined" onClick={handleCancelEdit}
                  sx={{ fontSize: '0.7rem', py: 0.15, px: 1 }}>
                  Cancelar
                </Button>
              )}
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEvaluation}
                disabled={savingEval} sx={{ fontSize: '0.7rem', py: 0.15, px: 1 }}>
                {savingEval ? 'Guardando...' : editingId ? 'Actualizar Evaluación' : 'Guardar Evaluación'}
              </Button>
            </Box>
          )}
        </Box>
        <TextField variant="standard" fullWidth multiline rows={3} label="Impresión Diagnóstica"
          value={diagnosticImpression} onChange={(e) => setDiagnosticImpression(e.target.value)}
          disabled={effectiveReadOnly} placeholder="Impresión diagnóstica del médico..."
          required
          error={validation && !diagnosticImpression.trim()}
          helperText={validation && !diagnosticImpression.trim() ? 'Requerido' : ''}
          sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
        <TextField variant="standard" fullWidth multiline rows={3} label="Plan"
          value={plan} onChange={(e) => setPlan(e.target.value)}
          disabled={effectiveReadOnly} placeholder="Plan propuesto..."
          required
          error={validation && !plan.trim()}
          helperText={validation && !plan.trim() ? 'Requerido' : ''}
          sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
        <TextField variant="standard" fullWidth multiline rows={3} label="Sugerencias Médicas"
          value={suggestions} onChange={(e) => setSuggestions(e.target.value)}
          disabled={effectiveReadOnly} placeholder="Sugerencias médicas adicionales..."
          sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }} />
      </Paper>

      {/* recipes */}
      <Box>
        <RecipeList emergencyId={emergencyId} readOnly={effectiveReadOnly} loggedDoctorId={loggedDoctorId} />
      </Box>

      {/* evaluation history */}
      <EvaluationHistorySection
        evaluations={myEvaluations}
        emergency={emergency}
        readOnly={effectiveReadOnly}
        onEdit={handleEditEvaluation}
      />
    </Box>
  );
};

export default EvaluationsTab;
