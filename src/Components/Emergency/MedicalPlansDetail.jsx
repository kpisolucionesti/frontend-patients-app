import { useState, useEffect, useCallback } from 'react';
import { Box, IconButton, Paper, Tooltip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Chip } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';
import DeleteConfirmModal from '../../shared/ui/delete-confirm-modal';
import { sanitizeInput } from '../../utils/sanitize';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

const INDICATION_TYPES = [
  { key: 'lab', label: 'Laboratorio', color: '#1565c0', classificationKey: 'lab' },
  { key: 'image', label: 'Imagenologia', color: '#6a1b9a', classificationKeys: ['xray', 'eco', 'ct', 'mri'] },
  { key: 'medication', label: 'Tratamiento', color: '#2e7d32' },
  { key: 'procedure', label: 'Procedimiento', color: '#e65100' },
  { key: 'general', label: 'Estudios Extras', color: '#546e7a' },
];

const getTypeLabel = (key) => INDICATION_TYPES.find((t) => t.key === key)?.label || key;
const getTypeColor = (key) => INDICATION_TYPES.find((t) => t.key === key)?.color || '#999';

const EMPTY = { indication_type: 'general', description: '', study_id: '' };

const generateMedicalPlanPdf = (data) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  doc.setFontSize(16);
  doc.setTextColor(21, 101, 192);
  doc.setFont('helvetica', 'bold');
  doc.text('INDICACIÓN MÉDICA', pageW / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${moment().format('DD/MM/YYYY HH:mm')}`, 14, y);
  y += 6;

  if (data.patientName) {
    doc.text(`Paciente: ${data.patientName}`, 14, y);
    y += 5;
  }
  if (data.patientCi) {
    doc.text(`CI: ${data.patientCi}`, 14, y);
    y += 5;
  }
  if (data.doctorName) {
    doc.text(`Médico: ${data.doctorName}`, 14, y);
    y += 5;
  }

  y += 3;
  doc.setDrawColor(21, 101, 192);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Tipo: ${getTypeLabel(data.indication_type)}`, 14, y);
  y += 6;

  if (data.studyName) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Estudio: ${data.studyName}`, 14, y);
    y += 6;
  }

  y += 2;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(data.description || 'Sin descripción adicional', pageW - 28);
  doc.text(lines, 14, y);

  return doc.output('blob');
};

const uploadPdfToEmergency = async (emergencyId, pdfBlob, filename) => {
  const fd = new FormData();
  fd.append('file', pdfBlob, filename);
  fd.append('attachable_type', 'Emergency');
  fd.append('attachable_id', String(emergencyId));
  fd.append('file_type', 'application/pdf');
  await BackendAPI.documents.create(fd);
};

const MedicalPlansDetail = ({ emergencyId, readOnly, doctorId, patientName, patientCi, doctorName }) => {
  const [plans, setPlans] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [classifications, setClassifications] = useState([]);
  const [studyParams, setStudyParams] = useState([]);
  const { show } = useSnackbar();

  const fetch = useCallback(async () => {
    if (!emergencyId) return;
    try {
      const data = await BackendAPI.medicalPlans.getAll(emergencyId);
      setPlans(data || []);
    } catch { setPlans([]); }
  }, [emergencyId]);

  const fetchClassifications = useCallback(async () => {
    try {
      const data = await BackendAPI.clinicalStudyClassifications.getAll();
      setClassifications(data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { fetchClassifications(); }, [fetchClassifications]);

  const typeConfig = INDICATION_TYPES.find((t) => t.key === form.indication_type);
  const showStudySelect = typeConfig?.classificationKey || typeConfig?.classificationKeys;

  useEffect(() => {
    if (!showStudySelect || !form.indication_type) {
      setStudyParams([]);
      setForm((prev) => ({ ...prev, study_id: '' }));
      return;
    }
    const loadParams = async () => {
      try {
        if (typeConfig.classificationKey) {
          const classObj = classifications.find((c) => c.key === typeConfig.classificationKey);
          if (classObj) {
            const data = await BackendAPI.labParameters.getAll(false);
            setStudyParams((data || []).filter((p) => p.clinical_study_classification_id === classObj.id));
          }
        } else if (typeConfig.classificationKeys) {
          const classIds = classifications.filter((c) => typeConfig.classificationKeys.includes(c.key)).map((c) => c.id);
          const data = await BackendAPI.labParameters.getAll(false);
          setStudyParams((data || []).filter((p) => classIds.includes(p.clinical_study_classification_id)));
        }
      } catch { setStudyParams([]); }
    };
    loadParams();
  }, [form.indication_type, showStudySelect, classifications]);

  const handleChange = (field, value) => {
    const sanitized = field === 'description' ? sanitizeInput(value, { maxLength: 5000 }) : value;
    setForm((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handleOpenAdd = () => { setEditing(null); setForm(EMPTY); setDialogOpen(true); };
  const handleOpenEdit = (p) => {
    setEditing(p);
    setForm({ indication_type: p.indication_type, description: p.description, study_id: p.study_id || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.description || !form.indication_type) return;
    setSaving(true);
    try {
      let saved;
      if (editing) {
        saved = await BackendAPI.medicalPlans.update({ ...editing, ...form });
      } else {
        saved = await BackendAPI.medicalPlans.create(emergencyId, { ...form, doctor_id: doctorId });
      }

      const selectedStudy = studyParams.find((s) => s.id === Number(form.study_id));
      try {
        const pdfBlob = generateMedicalPlanPdf({
          indication_type: form.indication_type,
          description: form.description,
          studyName: selectedStudy?.name,
          patientName,
          patientCi,
          doctorName,
        });
        const filename = `indicacion_${form.indication_type}_${moment().format('YYYYMMDD_HHmmss')}.pdf`;
        await uploadPdfToEmergency(emergencyId, pdfBlob, filename);
        show('Indicación guardada y PDF generado', 'success');
      } catch {
        show('Indicación guardada (error al generar PDF)', 'warning');
      }

      setDialogOpen(false);
      fetch();
    } catch {
      show('Error al guardar indicación', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await BackendAPI.medicalPlans.delete(emergencyId, deleteTarget);
      fetch();
      show('Indicación eliminada', 'success');
    } catch {
      show('Error al eliminar', 'error');
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  if (!emergencyId) return null;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AssignmentIcon sx={{ fontSize: 18, color: '#2e7d32' }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#2e7d32' }}>INDICACIONES MÉDICAS</Typography>
        </Box>
        {!readOnly && <Tooltip title="Agregar indicación" arrow><IconButton size="small" onClick={handleOpenAdd} sx={{ p: 0.25 }}><AddCircleOutlineIcon fontSize="small" /></IconButton></Tooltip>}
      </Box>
      {plans.length > 0 ? (
        <Box>
          {plans.map((p) => (
            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, p: 0.5, bgcolor: '#fafafa', borderRadius: 1 }}>
              <Chip label={getTypeLabel(p.indication_type)} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: getTypeColor(p.indication_type), color: 'white' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block' }}>{p.description}</Typography>
                {p.created_by?.name && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                    Solicitado por: {p.created_by.name}
                  </Typography>
                )}
              </Box>
              {!readOnly && (
                <>
                  <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEdit(p)} sx={{ p: 0.15 }}><EditIcon sx={{ fontSize: 12 }} /></IconButton></Tooltip>
                  <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => setDeleteTarget(p.id)} sx={{ p: 0.15 }}><DeleteIcon sx={{ fontSize: 12, color: '#e53935' }} /></IconButton></Tooltip>
                </>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">Sin indicaciones registradas</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '0.85rem', bgcolor: 'primary.main', color: 'white' }}>
          {editing ? 'Editar Indicación' : 'Agregar Indicación'}
        </DialogTitle>
        <DialogContent style={{ paddingTop: 24 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField select variant="standard" size="small" label="Tipo" value={form.indication_type} onChange={(e) => handleChange('indication_type', e.target.value)} fullWidth>
              {INDICATION_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
            </TextField>
            {showStudySelect && studyParams.length > 0 && (
              <TextField select variant="standard" size="small" label="Estudio" value={form.study_id} onChange={(e) => handleChange('study_id', e.target.value)} fullWidth>
                <MenuItem value="">— Sin especificar —</MenuItem>
                {studyParams.map((s) => (
                  <MenuItem key={s.id} value={String(s.id)}>
                    {s.abbreviation ? `${s.abbreviation} — ` : ''}{s.name}{s.unit ? ` (${s.unit})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField variant="standard" size="small" label="Descripción" value={form.description} onChange={(e) => handleChange('description', e.target.value)} required multiline rows={2} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="outlined" onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button size="small" variant="contained" onClick={handleSave} disabled={saving || !form.description || !form.indication_type}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="¿Eliminar esta indicación médica?"
      />
    </Paper>
  );
};

export default MedicalPlansDetail;
