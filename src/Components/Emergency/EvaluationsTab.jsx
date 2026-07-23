import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, CircularProgress, TextField, Typography, Divider, Alert, Paper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { BackendAPI } from '../../services/BackendApi';
import PhysicalExamTable from '../Portal/PhysicalExamTable';
import MedicalPlanSection from './MedicalPlanSection';
import EvaluationCard from './EvaluationCard';
import RecipeList from './RecipeList';

const CLASSIFICATION_MAP = {
  red: 'triage_i',
  orange: 'triage_ii',
  yellow: 'triage_iii',
  green: 'triage_iv',
  blue: 'consulta_externa',
};

const EvaluationsTab = ({ emergency, readOnly, onDataChange }) => {
  const emergencyId = emergency?.id;
  const isViewingHistory = readOnly;
  const effectiveReadOnly = readOnly || emergency?.patient?.disabled;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const loggedDoctorId = user?.doctor_id;

  const isPrimaryDoctor = emergency?.primary_doctor?.id === loggedDoctorId;

  const [currentIllness, setCurrentIllness] = useState('');
  const [editingIllness, setEditingIllness] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [myEvaluation, setMyEvaluation] = useState(null);
  const [diagnosticImpression, setDiagnosticImpression] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingIllness, setSavingIllness] = useState(false);
  const [savingEval, setSavingEval] = useState(false);
  const [illnessError, setIllnessError] = useState(null);

  useEffect(() => {
    if (emergency?.current_illness) {
      setCurrentIllness(emergency.current_illness);
    }
  }, [emergency?.current_illness]);

  const loadEvaluations = useCallback(async () => {
    if (!emergencyId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.evaluations.getAll(emergencyId);
      setEvaluations(data || []);
      const mine = (data || []).find((e) => e.doctor_id === loggedDoctorId);
      if (mine) {
        setMyEvaluation(mine);
        setDiagnosticImpression(mine.diagnostic_impression || '');
        setPlan(mine.plan || '');
      } else {
        setMyEvaluation(null);
        setDiagnosticImpression('');
        setPlan('');
      }
    } catch {
      setEvaluations([]);
    }
    setLoading(false);
  }, [emergencyId, loggedDoctorId]);

  useEffect(() => {
    loadEvaluations();
  }, [loadEvaluations]);

  const handleSaveCurrentIllness = async () => {
    if (!emergencyId) return;
    setSavingIllness(true);
    setIllnessError(null);
    try {
      const mappedClassification = CLASSIFICATION_MAP[emergency?.classification] || emergency?.classification;
      await BackendAPI.emergencies.update({ id: emergencyId, current_illness: currentIllness, classification: mappedClassification });
      setEditingIllness(false);
      if (onDataChange) onDataChange();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Error al guardar Enfermedad Actual';
      setIllnessError(msg);
    }
    setSavingIllness(false);
  };

  const handleSaveEvaluation = async () => {
    if (!emergencyId) return;
    setSavingEval(true);
    try {
      const payload = {
        doctor_id: loggedDoctorId,
        diagnostic_impression: diagnosticImpression,
        plan: plan,
      };
      if (myEvaluation) {
        await BackendAPI.evaluations.update(emergencyId, myEvaluation.id, payload);
      } else {
        await BackendAPI.evaluations.create(emergencyId, payload);
      }
      await loadEvaluations();
      if (onDataChange) onDataChange();
    } catch {
      // handled by interceptor
    }
    setSavingEval(false);
  };

  if (!emergency) return null;

  return (
    <Box>
      {/* Enfermedad Actual (compartida) */}
      <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 0.5 }}>
            ENFERMEDAD ACTUAL
          </Typography>
          {!effectiveReadOnly && (
            <Button size="small" variant="outlined" startIcon={<SaveIcon />} onClick={() => {
              if (currentIllness && !editingIllness) {
                setEditingIllness(true);
              } else {
                handleSaveCurrentIllness();
              }
            }} disabled={savingIllness}
              color={currentIllness && !editingIllness ? 'primary' : 'success'}
              sx={{ fontSize: '0.7rem', py: 0.15, px: 1 }}>
              {savingIllness ? 'Guardando...' : currentIllness && !editingIllness ? 'Editar' : 'Guardar'}
            </Button>
          )}
        </Box>
        {illnessError && <Alert severity="error" sx={{ mb: 1, fontSize: '0.7rem' }}>{illnessError}</Alert>}
        <TextField
          variant="outlined" fullWidth multiline rows={3}
          value={currentIllness}
          onChange={(e) => setCurrentIllness(e.target.value)}
          disabled={effectiveReadOnly || (!editingIllness && !!currentIllness)}
          placeholder="Describa la enfermedad actual del paciente..."
          sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
        />
      </Box>

      {/* Examen Físico (compartido) */}
      <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1.5, mb: 1.5 }}>
        <PhysicalExamTable emergencyId={emergencyId} readOnly={effectiveReadOnly} />
      </Box>

      {/* Mi Evaluación (Impresión Diagnóstica + Plan) */}
      <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1.5, mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 0.5 }}>
              MI EVALUACIÓN
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, fontSize: '0.6rem', color: isPrimaryDoctor ? '#1565c0' : '#6a1b9a', fontStyle: 'italic' }}>
              ({isPrimaryDoctor ? 'Médico Principal' : 'Interconsulta'})
            </Typography>
          </Box>
          {!effectiveReadOnly && (
            <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEvaluation}
              disabled={savingEval} sx={{ fontSize: '0.7rem', py: 0.15, px: 1 }}>
              {savingEval ? 'Guardando...' : myEvaluation ? 'Actualizar' : 'Guardar Evaluación'}
            </Button>
          )}
        </Box>
        <TextField
          variant="outlined" fullWidth multiline rows={3}
          label="Impresión Diagnóstica"
          value={diagnosticImpression}
          onChange={(e) => setDiagnosticImpression(e.target.value)}
          disabled={effectiveReadOnly}
          placeholder="Impresión diagnóstica del médico..."
          sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
        />
        <TextField
          variant="outlined" fullWidth multiline rows={3}
          label="Plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          disabled={effectiveReadOnly}
          placeholder="Plan propuesto..."
          sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
        />
      </Box>

      {/* Recetas */}
      <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1.5, mb: 1.5 }}>
        <RecipeList
          emergencyId={emergencyId}
          readOnly={effectiveReadOnly}
          loggedDoctorId={loggedDoctorId}
        />
      </Box>

      {/* Indicaciones Médicas (compartidas) */}
      <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1.5, mb: 1.5 }}>
        <MedicalPlanSection emergencyId={emergencyId} readOnly={effectiveReadOnly} />
      </Box>

      {/* Evaluaciones registradas (todas) */}
      {evaluations.length > 0 && (
        <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 1, p: 1.5, mb: 1.5 }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 0.5, mb: 1, display: 'block' }}>
            EVALUACIONES REGISTRADAS
          </Typography>
          {evaluations.map((ev) => (
            <EvaluationCard
              key={ev.id}
              evaluation={ev}
              isPrimary={ev.doctor_id === emergency?.primary_doctor?.id}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EvaluationsTab;
