import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

const MARGIN = 15;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });

const drawHeader = (doc) => {
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('EMERBOARD', MARGIN, 20);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Sistema de Gestión Hospitalaria', MARGIN, 25);
  doc.text(`Fecha de generación: ${moment().format('DD/MM/YYYY HH:mm')}`, MARGIN, 29);
  doc.setDrawColor(200, 200, 200);
  doc.line(MARGIN, 32, PAGE_WIDTH - MARGIN, 32);
};

const drawFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Página ${i} de ${pageCount} — Emerboard`,
      MARGIN,
      PAGE_HEIGHT - 10
    );
  }
};

const drawSectionTitle = (doc, title, y) => {
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont(undefined, 'bold');
  doc.text(title, MARGIN, y);
  doc.setFont(undefined, 'normal');
  return y + 5;
};

const drawField = (doc, label, value, y, xOffset = 0) => {
  const x = MARGIN + xOffset;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(label + ':', x, y);
  const labelWidth = doc.getTextWidth(label + ': ');
  doc.setTextColor(40, 40, 40);
  doc.text(value || '—', x + labelWidth + 1, y);
  return y + 4.5;
};

const drawRow = (doc, leftLabel, leftValue, rightLabel, rightValue, y) => {
  const leftWidth = CONTENT_WIDTH * 0.5;
  drawField(doc, leftLabel, leftValue, y, 0);
  drawField(doc, rightLabel, rightValue, y, leftWidth);
  return y + 4.5;
};

const checkPageBreak = (doc, y, needed = 30) => {
  if (y + needed > PAGE_HEIGHT - 20) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
};

const drawLine = (doc, y) => {
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  return y + 3;
};

export async function generateTriageReport({ emergency, patient, doctor }) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = MARGIN + 10;

  drawHeader(doc);

  y += 8;
  doc.setFontSize(14);
  doc.setTextColor(30, 80, 160);
  doc.setFont(undefined, 'bold');
  doc.text('INFORME DE TRIAJE', MARGIN, y);
  doc.setFont(undefined, 'normal');
  y += 10;

  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text(`Emergencia #${emergency.id} — ${moment(emergency.ingress_date).format('DD/MM/YYYY HH:mm')}`, MARGIN, y);
  y += 8;

  y = drawLine(doc, y);

  y = drawSectionTitle(doc, 'DATOS DEL PACIENTE', y);

  y = drawRow(doc, 'Cédula', patient.ci, 'Edad', patient.age ? `${patient.age} años` : '', y);
  y = drawRow(doc, 'Nombres', `${patient.name || ''} ${patient.lastname || ''}`, 'Género', patient.gender || '', y);
  y = drawRow(doc, 'F. Nacimiento', patient.birthday ? moment(patient.birthday).format('DD/MM/YYYY') : '', 'N. Historia', patient.medical_history_number || '', y);
  y += 2;
  y = drawLine(doc, y);

  y = drawSectionTitle(doc, 'DATOS DE LA EMERGENCIA', y);

  y = drawRow(doc, 'Fecha de Ingreso', emergency.ingress_date ? moment(emergency.ingress_date).format('DD/MM/YYYY HH:mm') : '', 'Clasificación', emergency.classification || '', y);
  y = drawField(doc, 'Motivo de Consulta', emergency.reason_for_consultation || '', y);
  y = drawField(doc, 'Enfermedad Actual', emergency.current_illness || '', y);
  y = drawField(doc, 'Diagnóstico', emergency.diagnostic || '', y);
  y += 2;
  y = drawLine(doc, y);

  y = drawSectionTitle(doc, 'TRATAMIENTO', y);
  y = drawField(doc, 'Plan / Tratamiento', emergency.treatment || '', y);
  y += 2;
  y = drawLine(doc, y);

  y = drawSectionTitle(doc, 'MÉDICO TRATANTE', y);
  const primaryDoctor = emergency.doctors?.find(d => d.primary) || emergency.doctors?.[0];
  y = drawField(doc, 'Médico', primaryDoctor?.name || '—', y);
  if (primaryDoctor?.specialty?.name) {
    y = drawField(doc, 'Especialidad', primaryDoctor.specialty.name, y);
  }
  y += 6;

  if (doctor) {
    y = checkPageBreak(doc, y, 50);
    y = drawLine(doc, y);
    y = drawSectionTitle(doc, 'FIRMA Y SELLO DEL MÉDICO', y);

    const signatureDataUrl = await loadImage(doctor.signature_url);
    const stampDataUrl = await loadImage(doctor.stamp_url);

    if (signatureDataUrl) {
      doc.addImage(signatureDataUrl, 'PNG', MARGIN, y, 50, 15);
    }
    if (stampDataUrl) {
      const stampSize = 35;
      doc.addImage(stampDataUrl, 'PNG', PAGE_WIDTH - MARGIN - stampSize, y, stampSize, stampSize);
    }
    y += 16;

    if (signatureDataUrl || stampDataUrl) {
      y += 4;
    }

    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    if (signatureDataUrl) {
      doc.text(`Dr. ${doctor.name}`, MARGIN, y);
      y += 3.5;
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      if (doctor.specialty?.name) doc.text(doctor.specialty.name, MARGIN, y);
      y += 3.5;
    }
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text(`Firmado digitalmente el ${moment().format('DD/MM/YYYY HH:mm')}`, MARGIN, y + 3);
  }

  drawFooter(doc);
  return doc.output('blob');
}
