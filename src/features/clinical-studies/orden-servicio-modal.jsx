import { useState, useEffect, useCallback } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Autocomplete, TextField, Chip, IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { jsPDF } from 'jspdf';
import moment from 'moment';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const STATUS_LABELS = {
  pending: { label: 'Pendiente', color: 'warning' },
  in_progress: { label: 'En Proceso', color: 'info' },
  completed: { label: 'Realizado', color: 'success' },
  delivered: { label: 'Entregado', color: 'primary' },
  cancelled: { label: 'Cancelado', color: 'default' },
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([key, val]) => ({ key, ...val }));

const generateOdsPdf = (data) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  doc.setFontSize(16);
  doc.setTextColor(21, 101, 192);
  doc.setFont('helvetica', 'bold');
  doc.text('ORDEN DE SERVICIO', pageW / 2, y, { align: 'center' });
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
  if (data.patientHc) {
    doc.text(`HC: ${data.patientHc}`, 14, y);
    y += 5;
  }

  y += 3;
  doc.setDrawColor(21, 101, 192);
  doc.line(14, y, pageW - 14, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Servicio: ${data.serviceName}`, 14, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Estudios solicitados:', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  (data.studies || []).forEach((s, i) => {
    doc.text(`${i + 1}. ${s}`, 18, y);
    y += 5;
  });

  if (data.observations) {
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones:', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(data.observations, pageW - 28);
    doc.text(lines, 14, y);
  }

  return doc.output('blob');
};

const OrdenServicioModal = ({ open, onClose, onSaved, attachableType, attachableId, patient }) => {
  const { show: showSnackbar } = useSnackbar();
  const [classifications, setClassifications] = useState([]);
  const [labParams, setLabParams] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [studies, setStudies] = useState([]);
  const [observations, setObservations] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingDoc, setEditingDoc] = useState(null);
  const [editStatus, setEditStatus] = useState(null);

  useEffect(() => {
    if (open) {
      BackendAPI.clinicalStudyClassifications.getAll()
        .then((data) => setClassifications((data || []).filter((c) => c.is_active !== false)))
        .catch(() => setClassifications([]));
      BackendAPI.labParameters.getAll()
        .then((data) => setLabParams((data || []).filter((p) => p.is_active !== false)))
        .catch(() => setLabParams([]));
    }
  }, [open]);

  const reset = () => {
    setSelectedClass(null);
    setSelectedStudy(null);
    setStudies([]);
    setObservations('');
    setEditingDoc(null);
    setEditStatus(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const filteredParams = selectedClass
    ? labParams.filter((p) => p.clinical_study_classification?.id === selectedClass.id)
    : [];

  const handleAddStudy = () => {
    if (!selectedStudy) return;
    const name = typeof selectedStudy === 'string' ? selectedStudy : selectedStudy.name;
    if (!name || studies.includes(name)) return;
    setStudies((prev) => [...prev, name]);
    setSelectedStudy(null);
  };

  const handleRemoveStudy = (index) => {
    setStudies((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedClass) { showSnackbar('Seleccione un servicio', 'warning'); return; }
    if (studies.length === 0) { showSnackbar('Agregue al menos un estudio', 'warning'); return; }
    setSaving(true);
    try {
      const pName = patient ? `${patient.name || ''} ${patient.lastname || ''}`.trim() : '—';
      const pdfBlob = generateOdsPdf({
        patientName: pName,
        patientCi: patient?.ci,
        patientHc: patient?.medical_history_number,
        serviceName: selectedClass.name,
        studies,
        observations,
      });

      const filename = `ODS_${selectedClass.name}_${moment().format('YYYYMMDDHHmmss')}.pdf`;
      const fd = new FormData();
      fd.append('file', pdfBlob, filename);
      fd.append('attachable_type', attachableType);
      fd.append('attachable_id', String(attachableId));
      fd.append('file_type', 'application/pdf');
      fd.append('study_classification_id', selectedClass.id);
      fd.append('study_type', studies.join(', '));
      if (observations.trim()) fd.append('observations', observations.trim());
      fd.append('status', 'pending');

      await BackendAPI.documents.create(fd);
      showSnackbar('Orden de servicio creada', 'success');
      handleClose();
      if (onSaved) onSaved();
    } catch {
      showSnackbar('Error al crear la orden de servicio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (docId, newStatus) => {
    try {
      await BackendAPI.documents.update(docId, { status: newStatus });
      showSnackbar('Estado actualizado', 'success');
      reset();
      handleClose();
      if (onSaved) onSaved();
    } catch {
      showSnackbar('Error al actualizar estado', 'error');
    }
  };

  const pName = patient ? `${patient.name || ''} ${patient.lastname || ''}`.trim() : '—';
  const pInfo = patient ? `CI: ${patient.ci || '—'} · ${patient.age || '?'}a` : '—';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
        {editingDoc ? 'EDITAR ORDEN DE SERVICIO' : 'NUEVA ORDEN DE SERVICIO'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Paciente</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{pName}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>{pInfo}</Typography>
          </Box>

          {!editingDoc && (
            <>
              <Autocomplete
                size="small"
                options={classifications}
                getOptionLabel={(c) => c.name}
                value={selectedClass}
                onChange={(_e, v) => { setSelectedClass(v); setSelectedStudy(null); }}
                renderInput={(params) => (
                  <TextField variant="standard" {...params} size="small" label="Servicio" fullWidth required />
                )}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Autocomplete
                  freeSolo
                  size="small"
                  options={filteredParams}
                  getOptionLabel={(p) => typeof p === 'string' ? p : p.name}
                  value={selectedStudy}
                  onInputChange={(_e, v) => setSelectedStudy(v)}
                  disabled={!selectedClass}
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField variant="standard" {...params} size="small" label="Estudio" fullWidth />
                  )}
                />
                <Button variant="outlined" size="small" onClick={handleAddStudy}
                  disabled={!selectedStudy || !selectedClass}
                  sx={{ fontSize: '0.7rem', py: 0.25, px: 1, flexShrink: 0 }}>
                  Agregar
                </Button>
              </Box>

              {studies.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {studies.map((s, i) => (
                    <Chip key={i} label={s} size="small"
                      onDelete={() => handleRemoveStudy(i)}
                      sx={{ fontSize: '0.7rem', height: 24 }} />
                  ))}
                </Box>
              )}

              <TextField variant="standard" size="small" label="Observaciones" multiline rows={2} fullWidth
                value={observations} onChange={(e) => setObservations(e.target.value)}
                inputProps={{ style: { fontSize: '0.75rem' } }} />
            </>
          )}

          {editingDoc && (
            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                Cambiar Estado
              </Typography>
              <Autocomplete
                size="small"
                options={STATUS_OPTIONS}
                getOptionLabel={(o) => o.label}
                value={editStatus || STATUS_OPTIONS.find((s) => s.key === editingDoc?.status) || null}
                onChange={(_e, v) => setEditStatus(v)}
                renderInput={(params) => (
                  <TextField variant="standard" {...params} size="small" label="Estado" fullWidth />
                )}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="error" sx={{ fontSize: '0.7rem' }}>Cancelar</Button>
        {editingDoc ? (
          <Button variant="contained" color="primary" onClick={() => handleUpdateStatus(editingDoc.id, editStatus?.key)}
            disabled={saving || !editStatus} sx={{ fontSize: '0.7rem' }}>
            {saving ? 'Guardando...' : 'Actualizar Estado'}
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleSave}
            disabled={saving || !selectedClass || studies.length === 0} sx={{ fontSize: '0.7rem' }}>
            {saving ? 'Creando...' : 'Crear ODS'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrdenServicioModal;
