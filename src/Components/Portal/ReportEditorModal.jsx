import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, IconButton, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BiotechIcon from '@mui/icons-material/Biotech';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  getResidentTemplate, getDischargeTemplate, getHospitalizationTemplate, getTriageTemplate,
} from '../../services/reportTemplates';
import { generateReportFromHtml } from '../../services/pdfReportGenerator';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';
import { useSnackbar } from '../../hooks/useSnackbar';

const REPORT_LABELS = {
  triage: 'Informe de Triaje',
  resident: 'Informe del Médico Residente',
  discharge: 'Informe de Alta Médica',
  admission: 'Informe de Ingreso',
};

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align',
];

const ReportEditorModal = ({ open, onClose, reportType, emergency, patient }) => {
  const [content, setContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const quillRef = useRef(null);
  const { show: showSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      let template = '';
      switch (reportType) {
        case 'triage':
          template = getTriageTemplate(emergency, patient);
          break;
        case 'resident':
          template = getResidentTemplate(emergency, patient);
          break;
        case 'discharge':
          template = getDischargeTemplate(emergency, patient);
          break;
        case 'admission':
          template = getHospitalizationTemplate(emergency, patient);
          break;
        default:
          template = '';
      }
      setContent(template);
      setPreviewUrl(null);
      setPreviewOpen(false);
    }
  }, [open, reportType, emergency, patient]);

  const insertAtCursor = useCallback((html) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.clipboard.dangerouslyPasteHTML(range.index, html, 'user');
      setContent(quill.root.innerHTML);
    }
  }, []);

  const handleInsertVitalSigns = useCallback(async () => {
    if (!emergency?.id) return;
    try {
      const signs = await BackendAPI.vitalSigns.getAll(emergency.id);
      const last = signs?.[signs.length - 1];
      if (!last) {
        insertAtCursor('<p><em>No hay registros de signos vitales</em></p>');
        return;
      }
      const html = `
        <h4 style="color:#1e50a0;margin:6px 0 3px 0;">Signos Vitales (último registro)</h4>
        <table style="width:100%;border-collapse:collapse;font-size:9pt;margin:4px 0;">
          <tr>
            <td style="border:1px solid #ccc;padding:2px 4px;"><strong>PA:</strong> ${last.systolic_bp || '—'}/${last.diastolic_bp || '—'}</td>
            <td style="border:1px solid #ccc;padding:2px 4px;"><strong>FC:</strong> ${last.heart_rate || '—'} lpm</td>
            <td style="border:1px solid #ccc;padding:2px 4px;"><strong>FR:</strong> ${last.respiratory_rate || '—'} rpm</td>
          </tr>
          <tr>
            <td style="border:1px solid #ccc;padding:2px 4px;"><strong>T°:</strong> ${last.temperature || '—'} °C</td>
            <td style="border:1px solid #ccc;padding:2px 4px;"><strong>SpO₂:</strong> ${last.oxygen_saturation || '—'}%</td>
            <td style="border:1px solid #ccc;padding:2px 4px;"><strong>Glicemia:</strong> ${last.glucose || '—'}</td>
          </tr>
        </table>
      `;
      insertAtCursor(html);
    } catch {
      insertAtCursor('<p><em>Error al cargar signos vitales</em></p>');
    }
  }, [emergency?.id, insertAtCursor]);

  const handleInsertPhysicalExam = useCallback(async () => {
    if (!emergency?.id) return;
    try {
      const exam = await BackendAPI.physicalExams.getByEmergency(emergency.id);
      if (!exam) {
        insertAtCursor('<p><em>No hay registro de examen físico</em></p>');
        return;
      }
      const fields = [
        { label: 'Cabeza', value: exam.cabeza },
        { label: 'Ojos', value: exam.ojo },
        { label: 'Cuello', value: exam.cuello },
        { label: 'ORL', value: exam.orl },
        { label: 'Tórax', value: exam.torax },
        { label: 'Cardiovascular', value: exam.cardiovascular },
        { label: 'Abdomen', value: exam.abdomen },
        { label: 'Genitales', value: exam.genitales },
        { label: 'Extremidades', value: exam.extremidades },
        { label: 'Neurológico', value: exam.neurologico },
      ];
      const rows = fields
        .filter(f => f.value)
        .map(f => `<tr><td style="border:1px solid #ccc;padding:2px 4px;font-weight:600;width:30%;">${f.label}</td><td style="border:1px solid #ccc;padding:2px 4px;">${f.value}</td></tr>`)
        .join('');
      const html = `
        <h4 style="color:#1e50a0;margin:6px 0 3px 0;">Examen Físico</h4>
        <table style="width:100%;border-collapse:collapse;font-size:9pt;margin:4px 0;">${rows}</table>
      `;
      insertAtCursor(html);
    } catch {
      insertAtCursor('<p><em>Error al cargar examen físico</em></p>');
    }
  }, [emergency?.id, insertAtCursor]);

  const handleInsertMedicalPlans = useCallback(async () => {
    if (!emergency?.id) return;
    try {
      const plans = await BackendAPI.medicalPlans.getAll(emergency.id);
      if (!plans?.length) {
        insertAtCursor('<p><em>No hay planes médicos registrados</em></p>');
        return;
      }
      const items = plans
        .map(p => `<li>${p.description}${p.indication_type ? ` <em>(${p.indication_type})</em>` : ''}${p.status === 'completed' ? ' — <strong>Completado</strong>' : ''}</li>`)
        .join('');
      const html = `
        <h4 style="color:#1e50a0;margin:6px 0 3px 0;">Planes Médicos</h4>
        <ul style="font-size:9pt;margin:4px 0;">${items}</ul>
      `;
      insertAtCursor(html);
    } catch {
      insertAtCursor('<p><em>Error al cargar planes médicos</em></p>');
    }
  }, [emergency?.id, insertAtCursor]);

  const handleInsertLabResults = useCallback(async () => {
    if (!emergency?.id) return;
    try {
      const results = await BackendAPI.laboratoryResults.getByEmergency(emergency.id);
      if (!results?.length) {
        insertAtCursor('<p><em>No hay resultados de laboratorio</em></p>');
        return;
      }
      const last = results[results.length - 1];
      const values = last.lab_result_values || [];
      if (!values.length) {
        insertAtCursor('<p><em>El último laboratorio no tiene valores registrados</em></p>');
        return;
      }
      const rows = values
        .map(v => `<tr><td style="border:1px solid #ccc;padding:2px 4px;">${v.parameter_name || ''}</td><td style="border:1px solid #ccc;padding:2px 4px;font-weight:600;">${v.value || ''}</td><td style="border:1px solid #ccc;padding:2px 4px;">${v.unit || ''}</td><td style="border:1px solid #ccc;padding:2px 4px;color:#888;">${v.reference_range || ''}</td></tr>`)
        .join('');
      const html = `
        <h4 style="color:#1e50a0;margin:6px 0 3px 0;">Resultados de Laboratorio (último)</h4>
        <p style="font-size:8pt;color:#888;margin:2px 0;">${last.result_date ? moment(last.result_date).format('DD/MM/YYYY') : ''}</p>
        <table style="width:100%;border-collapse:collapse;font-size:9pt;margin:4px 0;">
          <tr style="background:#f0f0f0;"><th style="border:1px solid #ccc;padding:2px 4px;text-align:left;">Parámetro</th><th style="border:1px solid #ccc;padding:2px 4px;text-align:left;">Valor</th><th style="border:1px solid #ccc;padding:2px 4px;text-align:left;">Unidad</th><th style="border:1px solid #ccc;padding:2px 4px;text-align:left;">Ref.</th></tr>
          ${rows}
        </table>
      `;
      insertAtCursor(html);
    } catch {
      insertAtCursor('<p><em>Error al cargar resultados de laboratorio</em></p>');
    }
  }, [emergency?.id, insertAtCursor]);

  const getPdfBlob = useCallback(async () => {
    return generateReportFromHtml({
      title: REPORT_LABELS[reportType] || 'Informe Médico',
      htmlContent: content,
    });
  }, [content, reportType]);

  const handlePreview = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await getPdfBlob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (err) {
      showSnackbar('Error al generar la vista previa: ' + (err.message || ''), 'error');
    } finally {
      setGenerating(false);
    }
  }, [getPdfBlob, showSnackbar]);

  const handleSave = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await getPdfBlob();
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const fd = new FormData();
      const dateStr = reportType === 'triage'
        ? moment().format('YYYYMMDD_HHmmss')
        : new Date().toISOString().slice(0, 10).replace(/-/g, '');
      fd.append('file', blob, `informe_${reportType}_${emergency.id}_${dateStr}.pdf`);
      fd.append('attachable_type', 'Emergency');
      fd.append('attachable_id', emergency.id);
      fd.append('file_type', 'application/pdf');
      fd.append('report_type', reportType);
      fd.append('description', REPORT_LABELS[reportType] || 'Informe Médico');
      await BackendAPI.documents.create(fd);
      showSnackbar(`${REPORT_LABELS[reportType] || 'Informe'} generado correctamente`, 'success');
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      onClose();
    } catch (err) {
      showSnackbar('Error al generar el informe: ' + (err.message || 'desconocido'), 'error');
    } finally {
      setGenerating(false);
    }
  }, [getPdfBlob, reportType, emergency?.id, previewUrl, showSnackbar, onClose]);

  const handleClose = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onClose();
  }, [previewUrl, onClose]);

  const handleConfirmFromPreview = useCallback(async () => {
    setPreviewOpen(false);
    await handleSave();
  }, [handleSave]);

  const isActive = patient && !patient.disabled;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0d1b2a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PictureAsPdfIcon sx={{ fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>
              {REPORT_LABELS[reportType] || 'Informe Médico'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 400 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label={`${patient?.name || ''} ${patient?.lastname || ''}`} size="small" color="primary" variant="outlined" />
            <Chip label={`CI: ${patient?.ci || '—'}`} size="small" variant="outlined" />
            <Chip label={`Emergencia #${emergency?.id || '—'}`} size="small" variant="outlined" />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Button size="small" variant="text" startIcon={<MonitorHeartIcon />} onClick={handleInsertVitalSigns} sx={{ fontSize: '0.65rem', textTransform: 'none' }}>
              Insertar Signos Vitales
            </Button>
            <Button size="small" variant="text" startIcon={<AssignmentIcon />} onClick={handleInsertPhysicalExam} sx={{ fontSize: '0.65rem', textTransform: 'none' }}>
              Insertar Examen Físico
            </Button>
            <Button size="small" variant="text" startIcon={<MedicationIcon />} onClick={handleInsertMedicalPlans} sx={{ fontSize: '0.65rem', textTransform: 'none' }}>
              Insertar Planes Médicos
            </Button>
            <Button size="small" variant="text" startIcon={<BiotechIcon />} onClick={handleInsertLabResults} sx={{ fontSize: '0.65rem', textTransform: 'none' }}>
              Insertar Últimos Labs
            </Button>
          </Box>
          <Box sx={{
            flex: 1, minHeight: 250,
            '& .ql-container': { fontSize: '0.85rem', fontFamily: 'Arial, sans-serif' },
            '& .ql-editor': { minHeight: 250 },
          }}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 1.5, justifyContent: 'flex-end', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handlePreview}
            disabled={generating || !content}
          >
            {generating ? 'Generando...' : 'Vista Previa'}
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleSave}
            disabled={generating || !content || !isActive}
          >
            {generating ? 'Generando...' : 'Generar PDF'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0d1b2a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PictureAsPdfIcon sx={{ fontSize: 20 }} />
            Vista Previa — {REPORT_LABELS[reportType] || 'Informe Médico'}
          </Typography>
          <IconButton size="small" onClick={() => setPreviewOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ height: '80vh', p: 0 }}>
          {previewUrl && (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Vista Previa del Informe"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 1.5, gap: 1 }}>
          <Button size="small" variant="outlined" onClick={() => setPreviewOpen(false)}>
            Volver a Editar
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleConfirmFromPreview}
            disabled={generating}
          >
            {generating ? 'Guardando...' : 'Confirmar y Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportEditorModal;
