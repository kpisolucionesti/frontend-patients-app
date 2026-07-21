import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

const SURGERY_TYPE_LABELS = {
  general: 'Cirugía General',
  traumatologia: 'Traumatología',
  neurocirugia: 'Neurocirugía',
  cardiovascular: 'Cardiovascular',
  toracica: 'Torácica',
  abdominal: 'Abdominal',
  urologica: 'Urológica',
  ginecologica: 'Ginecológica',
  oftalmologica: 'Oftalmológica',
  otorrino: 'Otorrinolaringología',
  maxilofacial: 'Maxilofacial',
  pediatrica: 'Pediátrica',
  otros: 'Otra',
};

const STATUS_LABELS = {
  scheduled: 'Programada',
  in_progress: 'En Progreso',
  completed: 'Realizada',
  cancelled: 'Cancelada',
};

export function generateSurgeryReport(surgery) {
  const doc = new jsPDF();

  let y = 20;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('INFORME DE CIRUGÍA', 14, y);
  y += 10;

  // Patient & metadata
  const p = surgery.patient || {};
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Paciente: ${p.name || ''} ${p.lastname || ''}  |  CI: ${p.ci || 'N/A'}`, 14, y);
  y += 6;
  doc.text(`Fecha del reporte: ${moment().format('DD/MM/YYYY HH:mm')}`, 14, y);
  y += 10;

  // 1. Datos de la Cirugía
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('1. DATOS DE LA CIRUGÍA', 14, y);
  y += 8;

  const surgicalRows = [
    ['Tipo', SURGERY_TYPE_LABELS[surgery.surgery_type] || surgery.surgery_type || 'N/A'],
    ['Descripción', surgery.description || 'N/A'],
    ['Cirujano', surgery.surgeon_name || 'N/A'],
    ['Anestesiólogo', surgery.anesthesiologist || 'N/A'],
    ['Tipo de Anestesia', surgery.anesthesia_type || 'N/A'],
    ['Estado', STATUS_LABELS[surgery.status] || surgery.status || 'N/A'],
    ['Ambulatorio', surgery.ambulatory ? 'Sí' : 'No'],
  ];

  doc.autoTable({
    startY: y,
    head: [['Campo', 'Valor']],
    body: surgicalRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 105, 92], fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 'auto' } },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 10;

  // 2. Horarios
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('2. HORARIOS', 14, y);
  y += 8;

  const timeRows = [
    ['Fecha de Cirugía', surgery.surgery_date ? moment(surgery.surgery_date).format('DD/MM/YYYY') : 'N/A'],
    ['Inicio Programado', surgery.scheduled_start_time ? moment(surgery.scheduled_start_time).format('DD/MM/YYYY HH:mm') : 'N/A'],
    ['Fin Programado', surgery.scheduled_end_time ? moment(surgery.scheduled_end_time).format('DD/MM/YYYY HH:mm') : 'N/A'],
    ['Inicio Real', surgery.actual_start_time ? moment(surgery.actual_start_time).format('DD/MM/YYYY HH:mm') : 'N/A'],
    ['Fin Real', surgery.actual_end_time ? moment(surgery.actual_end_time).format('DD/MM/YYYY HH:mm') : 'N/A'],
  ];

  doc.autoTable({
    startY: y,
    head: [['Campo', 'Valor']],
    body: timeRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 105, 92], fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 'auto' } },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 10;

  // 3. Notas y Evaluaciones
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('3. NOTAS Y EVALUACIONES', 14, y);
  y += 8;

  const fieldLabels = [
    ['Evaluación Pre-Anestésica', surgery.preanesthetic_evaluation],
    ['Notas Pre-Op', surgery.preop_notes],
    ['Notas Post-Op', surgery.postop_notes],
    ['Resultado', surgery.result],
  ];

  const hasNotes = fieldLabels.some(([, v]) => v);
  if (hasNotes) {
    fieldLabels.forEach(([label, value]) => {
      if (!value) return;
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(value || 'N/A', 170);
      doc.text(lines, 18, y + 5);
      y += 8 + lines.length * 4;
    });
  } else {
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Sin notas registradas.', 14, y);
    y += 8;
  }

  doc.save(`cirugia_${surgery.id || ''}_${moment().format('YYYYMMDD')}.pdf`);
}
