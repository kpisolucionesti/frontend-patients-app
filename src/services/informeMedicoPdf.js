import { jsPDF } from 'jspdf';
import moment from 'moment';

export function generateInformeMedico({ patient, emergency, doctor, treatmentOptions }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  const sePropone = treatmentOptions?.sePropone ?? true;
  const seRealiza = treatmentOptions?.seRealiza ?? false;

  const genderLabel = patient?.gender === 'M' ? 'Masculino' : patient?.gender === 'F' ? 'Femenino' : patient?.gender || '';
  const age = patient?.birthday ? moment().diff(moment(patient.birthday), 'years') : '';

  const formatField = (val) => val && String(val).trim() ? String(val).trim() : '';

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Fecha: ${moment().format('DD/MM/YYYY [a las] HH:mm')}`, pageWidth - margin, y, { align: 'right' });
  y += 12;

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('INFORME MÉDICO', pageWidth / 2, y, { align: 'center' });
  y += 14;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Nombre del paciente: ${patient?.name || ''} ${patient?.lastname || ''}`, margin, y);
  y += 7;
  doc.text(`Sexo: ${genderLabel}    Edad: ${age} años`, margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.text('"DE EDAD QUIEN CONSULTA ESTE CENTRO"', margin, y);
  y += 9;

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('MOTIVO DE CONSULTA:', margin, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const motivo = formatField(emergency?.reason_for_consultation) || 'No registrado';
  const motivoLines = doc.splitTextToSize(motivo, pageWidth - 2 * margin);
  doc.text(motivoLines, margin + 2, y);
  y += motivoLines.length * 5 + 8;

  doc.setFont(undefined, 'bold');
  doc.text('EXAMEN FÍSICO RESUMIDO:', margin, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const physicalExam = emergency?.physical_exam || {};
  const examFields = [
    { label: 'Cabeza', value: physicalExam.cabeza },
    { label: 'Ojo', value: physicalExam.ojo },
    { label: 'Cuello', value: physicalExam.cuello },
    { label: 'ORL', value: physicalExam.orl },
    { label: 'Tórax', value: physicalExam.torax },
    { label: 'Cardiovascular', value: physicalExam.cardiovascular },
    { label: 'Abdomen', value: physicalExam.abdomen },
    { label: 'Genitales', value: physicalExam.genitales },
    { label: 'Extremidades', value: physicalExam.extremidades },
    { label: 'Neurológico', value: physicalExam.neurologico },
  ];
  const filledExamFields = examFields.filter(f => formatField(f.value));
  if (filledExamFields.length > 0) {
    filledExamFields.forEach(f => {
      const line = `${f.label}: ${f.value}`;
      const lines = doc.splitTextToSize(line, pageWidth - 2 * margin - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 5;
    });
  } else {
    doc.text('No registrado', margin + 2, y);
    y += 5;
  }
  y += 6;

  doc.setFont(undefined, 'bold');
  doc.text('EXÁMENES PARACLÍNICOS:', margin, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const paraclinicos = emergency?.paraclinical_studies || [];
  if (paraclinicos.length > 0) {
    paraclinicos.forEach(est => {
      const line = `• ${est.study_type || 'Sin tipo'}: ${est.description || ''}`;
      const lines = doc.splitTextToSize(line, pageWidth - 2 * margin - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 5;
    });
  } else {
    doc.text('No registrado', margin + 2, y);
    y += 5;
  }
  y += 6;

  doc.setFont(undefined, 'bold');
  doc.text('DIAGNÓSTICO:', margin, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const diagnostico = formatField(emergency?.diagnostic) || 'No registrado';
  const diagLines = doc.splitTextToSize(diagnostico, pageWidth - 2 * margin);
  doc.text(diagLines, margin + 2, y);
  y += diagLines.length * 5 + 8;

  doc.setFont(undefined, 'bold');
  const checkSePropone = sePropone ? '[X]' : '[ ]';
  const checkSeRealiza = seRealiza ? '[X]' : '[ ]';
  doc.text(`${checkSePropone} SE PROPONE    ${checkSeRealiza} SE REALIZA`, margin, y);
  y += 7;
  doc.text('EL SIGUIENTE TRATAMIENTO:', margin, y);
  y += 6;
  doc.setFont(undefined, 'normal');
  const tratamiento = formatField(emergency?.treatment) || 'No registrado';
  const tratLines = doc.splitTextToSize(tratamiento, pageWidth - 2 * margin);
  doc.text(tratLines, margin + 2, y);
  y += tratLines.length * 5 + 12;

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const doctorName = doctor?.name || 'No especificado';
  const doctorCi = doctor?.ci || '';
  const doctorCode = doctor?.doctor_code || '';
  const sanidadNumber = doctor?.sanidad_number || '';

  doc.text(`Médico: ${doctorName}`, margin, y);
  y += 6;
  doc.text(`Cédula: ${doctorCi}`, margin, y);
  y += 6;
  if (doctorCode) {
    doc.text(`Código Médico: ${doctorCode}`, margin, y);
    y += 6;
  }
  if (sanidadNumber) {
    doc.text(`N° Sanidad: ${sanidadNumber}`, margin, y);
    y += 6;
  }

  const firmaX = pageWidth - margin - 55;
  const firmaY = y - (doctorCode || sanidadNumber ? 24 : 12);
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(firmaX, firmaY, 55, 30);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Firma y Sello del Médico', firmaX + 27.5, firmaY + 17, { align: 'center' });

  if (doctor?.signature_url) {
    try {
      doc.addImage(doctor.signature_url, 'PNG', firmaX + 5, firmaY + 2, 45, 15);
    } catch {}
  }

  return doc;
}
