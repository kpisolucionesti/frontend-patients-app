import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

const STATUS_LABELS = { 1: 'Atendido', 2: 'Alta', 3: 'Ingresado', 4: 'Anulada', 5: 'Fallecido' };

function addPatientSection(doc, data) {
  const p = data.patient;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('1. DATOS DEL PACIENTE', 14, doc.lastAutoTable?.finalY + 12 || 30);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  const lines = [
    `Nombre: ${p.name} ${p.lastname}`,
    `CI: ${p.ci || 'N/A'}  |  N° Historia: ${p.medical_history_number || 'N/A'}`,
    `Edad: ${p.age || '?'} años  |  Sexo: ${p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : p.gender || 'N/A'}`,
    `Fecha de Nacimiento: ${p.birthday || 'N/A'}`,
  ];
  if (p.representante) {
    lines.push(`Representante: ${p.representante}  |  CI Rep.: ${p.representante_ci || 'N/A'}`);
  }
  lines.forEach((line, i) => {
    doc.text(line, 18, (doc.lastAutoTable?.finalY || 30) + 12 + (i + 1) * 5);
  });
}

function addEmergencySection(doc, data, startY) {
  const e = data.emergency;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('2. DATOS DE LA EMERGENCIA', 14, startY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);

  const rows = [
    ['F. Ingreso', e.ingress_date || moment(e.created_at).format('DD/MM/YYYY HH:mm')],
    ['F. Alta', e.egress_at ? moment(e.egress_at).format('DD/MM/YYYY HH:mm') : 'N/A'],
    ['Clasificación', e.classification || 'N/A'],
    ['Estado', STATUS_LABELS[e.status] || e.status],
    ['Médico Principal', data.primary_doctor?.name || 'N/A'],
    ['Diagnóstico', e.diagnostic || 'N/A'],
    ['Plan', e.treatment || 'N/A'],
    ['Motivo de Consulta', e.reason_for_consultation || 'N/A'],
    ['Enfermedad Actual', e.current_illness || 'N/A'],
    ['Observaciones', e.observations || 'N/A'],
  ];
  if (e.discharge_note) rows.push(['Nota de Egreso', e.discharge_note]);
  if (e.admission_note) rows.push(['Nota de Ingreso', e.admission_note]);
  if (e.medical_exit) rows.push(['Alta Médica', e.medical_exit]);
  if (e.transfer) rows.push(['Área de Ingreso', e.transfer]);
  if (e.cause_of_death) rows.push(['Causa de Muerte', e.cause_of_death]);

  doc.autoTable({
    startY: startY + 6,
    head: [['Campo', 'Valor']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
  });
}

function addDoctorsSection(doc, data) {
  const consulting = data.consulting_doctors || [];
  const rows = [
    ['Médico Principal', data.primary_doctor?.name || 'No asignado'],
  ];
  if (consulting.length > 0) {
    rows.push(['Interconsultas', consulting.map((d) => d.name).join(', ')]);
  }
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Rol', 'Médico']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
  });
}

function addVitalSignsSection(doc, data) {
  const vs = data.vital_signs || [];
  if (vs.length === 0) return;
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Fecha/Hora', 'PA', 'FC', 'FR', 'Temp', 'SatO2', 'Glicemia', 'Peso']],
    body: vs.map((v) => [
      v.recorded_at ? moment(v.recorded_at).format('DD/MM HH:mm') : '',
      v.systolic_bp && v.diastolic_bp ? `${v.systolic_bp}/${v.diastolic_bp}` : '',
      v.heart_rate || '',
      v.respiratory_rate || '',
      v.temperature || '',
      v.oxygen_saturation ? `${v.oxygen_saturation}%` : '',
      v.glucose || '',
      v.weight ? `${v.weight} kg` : '',
    ]),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
    didDrawPage: (data_) => {
      doc.setFontSize(7);
      doc.text('Signos Vitales', 14, data_.cursor?.startY - 4 || 20);
    },
  });
}

function addPhysicalExamSection(doc, data) {
  const pe = data.physical_exam;
  if (!pe) return;
  const regions = [
    ['Cabeza', pe.cabeza], ['Ojo', pe.ojo], ['Cuello', pe.cuello],
    ['ORL', pe.orl], ['Tórax', pe.torax], ['Cardiovascular', pe.cardiovascular],
    ['Abdomen', pe.abdomen], ['Genitales', pe.genitales],
    ['Extremidades', pe.extremidades], ['Neurológico', pe.neurologico],
  ].filter(([, v]) => v);
  if (regions.length === 0) return;

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Región', 'Hallazgo']],
    body: regions,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
    columnStyles: { 0: { cellWidth: 35, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
  });
}

function addMedicalPlansSection(doc, data) {
  const plans = data.medical_plans || [];
  if (plans.length === 0) return;
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Tipo', 'Descripción', 'Estado', 'Médico']],
    body: plans.map((p) => [p.indication_type || '', p.description || '', p.status || '', p.doctor || '']),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
  });
}

function addInterconsultationsSection(doc, data) {
  const ics = data.interconsultations || [];
  if (ics.length === 0) return;
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Médico', 'Motivo', 'Estado']],
    body: ics.map((ic) => [ic.doctor_requested || '', ic.reason || '', ic.status || '']),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
  });
}

function addParaclinicalStudiesSection(doc, data) {
  const studies = data.paraclinical_studies || [];
  if (studies.length === 0) return;
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Tipo de Estudio', 'Descripción']],
    body: studies.map((ps) => [ps.study_type || '', ps.description || '']),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
  });
}

function addLabResultsSection(doc, data) {
  const labResults = data.laboratory_results || [];
  if (labResults.length === 0) return;

  const allParams = [...new Set(labResults.flatMap((lr) => (lr.values || []).map((v) => v.parameter_name)))];
  if (allParams.length === 0) return;

  const headers = ['Parámetro', ...labResults.map((lr) => lr.result_date ? moment(lr.result_date).format('DD/MM') : ''), 'Ref.'];
  const body = allParams.map((param) => {
    const refs = [];
    const vals = labResults.map((lr) => {
      const found = (lr.values || []).find((v) => v.parameter_name === param);
      if (found) {
        if (found.reference_range && !refs.includes(found.reference_range)) refs.push(found.reference_range);
        return found.value || '';
      }
      return '';
    });
    return [param, ...vals, refs[0] || ''];
  });

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [headers],
    body,
    theme: 'grid',
    styles: { fontSize: 6.5, cellPadding: 1 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
  });
}

function addNotesSection(doc, data) {
  const notes = data.notes || [];
  if (notes.length === 0) return;

  const startY = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Notas de Evolución', 14, startY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);

  notes.forEach((n, i) => {
    const y = startY + 6 + i * 16;
    if (y > 270) {
      doc.addPage();
      return;
    }
    doc.text(`[${n.created_at ? moment(n.created_at).format('DD/MM/YYYY HH:mm') : ''}] ${n.created_by || 'Desconocido'}:`, 18, y);
    doc.text(n.note || '', 22, y + 5);
  });
}

function addHospitalizationSection(doc, data) {
  const h = data.hospitalization;
  if (!h) return;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('3. DATOS DE HOSPITALIZACIÓN', 14, doc.lastAutoTable.finalY + 12);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);

  const rows = [
    ['F. Ingreso', h.admission_date ? moment(h.admission_date).format('DD/MM/YYYY HH:mm') : 'N/A'],
    ['F. Alta', h.discharge_date ? moment(h.discharge_date).format('DD/MM/YYYY HH:mm') : 'N/A'],
    ['Días de Estancia', `${h.length_of_stay_days || 0} días`],
    ['Sala/Cama', h.room || 'N/A'],
    ['Médico de Cabecera', h.attending_doctor || h.admitting_doctor || 'N/A'],
    ['Diagnóstico de Ingreso', h.admission_diagnosis || 'N/A'],
    ['Diagnóstico de Alta', h.discharge_diagnosis || 'N/A'],
    ['Resumen de Alta', h.discharge_summary || 'N/A'],
  ];

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Campo', 'Valor']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
    columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
  });
}

function addHospitalizationNotesSection(doc, data) {
  const hNotes = data.hospitalization_notes || [];
  if (hNotes.length === 0) return;

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('4. LÍNEA DE TIEMPO — NOTAS SOAP', 14, doc.lastAutoTable.finalY + 12);
  doc.setFont(undefined, 'normal');

  hNotes.forEach((hn) => {
    const startY = doc.lastAutoTable.finalY + 6;
    if (startY > 250) doc.addPage();

    const dateStr = hn.recorded_at ? moment(hn.recorded_at).format('DD/MM/YYYY HH:mm') : '';
    const typeLabel = hn.note_type === 'progress' ? 'Nota de Evolución' : hn.note_type === 'nursing' ? 'Nota de Enfermería' : hn.note_type === 'admission' ? 'Nota de Ingreso' : 'Nota de Alta';
    const shiftLabel = hn.shift === 'morning' ? 'Mañana' : hn.shift === 'afternoon' ? 'Tarde' : 'Noche';

    doc.autoTable({
      startY,
      body: [
        [{ content: `${dateStr} — ${typeLabel} (${shiftLabel})`, styles: { fontStyle: 'bold', fontSize: 7.5, fillColor: [232, 234, 246] } }],
      ],
      theme: 'plain',
      styles: { fontSize: 7, cellPadding: 1.5 },
    });

    const subjObj = [
      ['Subjetivo', hn.subjective || ''],
      ['Objetivo', hn.objective || ''],
      ['Evaluación', hn.assessment || ''],
      ['Plan', hn.plan || ''],
    ].filter(([, v]) => v);

    if (subjObj.length > 0) {
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 1,
        body: subjObj,
        theme: 'plain',
        styles: { fontSize: 7, cellPadding: 1 },
        columnStyles: { 0: { cellWidth: 25, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
      });
    }
  });
}

function addFluidBalanceSection(doc, data) {
  const fb = data.fluid_balances || [];
  if (fb.length === 0) return;

  const summary = data.fluid_balance_summary;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Balance Hídrico', 14, doc.lastAutoTable.finalY + 10);
  doc.setFont(undefined, 'normal');

  if (summary) {
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 4,
      body: [
        ['Total Ingresos', `${summary.total_intake || 0} ml`],
        ['Total Egresos', `${summary.total_output || 0} ml`],
        ['Balance Neto', `${summary.net_balance || 0} ml`],
      ],
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5 },
      columnStyles: { 0: { cellWidth: 40, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
    });
  }

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 4,
    head: [['Fecha', 'Tipo', 'Líquido', 'Cantidad']],
    body: fb.map((f) => [
      f.recorded_at ? moment(f.recorded_at).format('DD/MM HH:mm') : '',
      f.balance_type === 'intake' ? 'Ingreso' : 'Egreso',
      f.fluid_type || '',
      f.amount ? `${f.amount} ${f.unit || 'ml'}` : '',
    ]),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
  });
}

function addMedicationSection(doc, data) {
  const meds = data.medication_administrations || [];
  if (meds.length === 0) return;

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Medicamento', 'Dosis', 'Vía', 'Frecuencia', 'Estado', 'Administrado']],
    body: meds.map((m) => [
      m.medication_name || '',
      m.dosage || '',
      m.route || '',
      m.frequency || '',
      m.status || '',
      m.administered_at ? moment(m.administered_at).format('DD/MM HH:mm') : (m.scheduled_at ? moment(m.scheduled_at).format('DD/MM HH:mm') : ''),
    ]),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
  });
}

function addSurgeriesSection(doc, data) {
  const surgeries = data.surgeries || [];
  if (surgeries.length === 0) return;

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Cirugía', 'Descripción', 'Cirujano', 'F. Programada', 'Estado']],
    body: surgeries.map((s) => [
      s.surgery_type || '',
      s.description || '',
      s.surgeon || '',
      s.scheduled_date ? moment(s.scheduled_date).format('DD/MM/YYYY') : '',
      s.status || '',
    ]),
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
  });
}

function addDocumentsSection(doc, data) {
  const docs = data.documents || [];
  if (docs.length === 0) return;

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Documentos Adjuntos', 14, doc.lastAutoTable.finalY + 10);
  doc.setFont(undefined, 'normal');

  const rows = docs.map((d) => [
    d.file_name || '',
    d.file_type || '',
    d.file_size || '',
    d.created_at ? moment(d.created_at).format('DD/MM/YYYY') : '',
  ]);
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 4,
    head: [['Archivo', 'Tipo', 'Tamaño', 'Fecha']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 101, 192], fontSize: 7 },
  });
}

export function generateEmergencyReport(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const p = data.patient;

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('HISTORIA CLÍNICA — EMERGENCIA', 14, 20);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Paciente: ${p.name} ${p.lastname} — CI: ${p.ci || 'N/A'}`, 14, 27);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-VE')}`, 14, 33);
  doc.line(14, 36, 196, 36);

  addPatientSection(doc, data);
  addEmergencySection(doc, data, (doc.lastAutoTable?.finalY || 50) + 8);
  addDoctorsSection(doc, data);
  addVitalSignsSection(doc, data);
  addPhysicalExamSection(doc, data);
  addMedicalPlansSection(doc, data);
  addInterconsultationsSection(doc, data);
  addParaclinicalStudiesSection(doc, data);
  addLabResultsSection(doc, data);
  addNotesSection(doc, data);
  addDocumentsSection(doc, data);

  doc.save(`Historia_Clinica_Emergencia_${data.emergency.id}.pdf`);
}

export function generateHospitalizationReport(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const p = data.patient;

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('HISTORIA CLÍNICA — HOSPITALIZACIÓN', 14, 20);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Paciente: ${p.name} ${p.lastname} — CI: ${p.ci || 'N/A'}`, 14, 27);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-VE')}`, 14, 33);
  doc.line(14, 36, 196, 36);

  addPatientSection(doc, data);
  addEmergencySection(doc, data, (doc.lastAutoTable?.finalY || 50) + 8);
  addHospitalizationSection(doc, data);
  addDoctorsSection(doc, data);
  addVitalSignsSection(doc, data);
  addPhysicalExamSection(doc, data);
  addMedicalPlansSection(doc, data);
  addInterconsultationsSection(doc, data);
  addParaclinicalStudiesSection(doc, data);
  addLabResultsSection(doc, data);
  addNotesSection(doc, data);
  addHospitalizationNotesSection(doc, data);
  addFluidBalanceSection(doc, data);
  addMedicationSection(doc, data);
  addSurgeriesSection(doc, data);
  addDocumentsSection(doc, data);

  doc.save(`Historia_Clinica_Hospitalizacion_${data.hospitalization.id}.pdf`);
}
