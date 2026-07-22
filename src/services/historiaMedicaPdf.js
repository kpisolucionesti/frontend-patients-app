import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

const MARGIN = 14;
const PAGE_W = 210;

function drawHeader(doc) {
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Fecha: ${moment().format('DD/MM/YYYY')}`, PAGE_W - MARGIN, MARGIN + 2, { align: 'right' });
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('HISTORIA MÉDICA', PAGE_W / 2, MARGIN + 8, { align: 'center' });
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, MARGIN + 14, PAGE_W - MARGIN, MARGIN + 14);
}

function drawFooter(doc, doctor) {
  const last = doc.getNumberOfPages();
  doc.setPage(last);
  const y = 255;
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  let fy = y + 6;
  doc.text(`Médico: ${doctor?.name || 'No especificado'}`, MARGIN, fy);
  fy += 6;
  if (doctor?.doctor_code) { doc.text(`CMM: ${doctor.doctor_code}`, MARGIN, fy); fy += 6; }
  if (doctor?.sanidad_number) { doc.text(`MPPS: ${doctor.sanidad_number}`, MARGIN, fy); fy += 6; }
  const fx = PAGE_W - MARGIN - 55;
  doc.rect(fx, y + 6, 55, 30);
  doc.setFontSize(8);
  doc.text('Firma y Sello del Médico', fx + 27.5, y + 23, { align: 'center' });
  if (doctor?.signature_url) {
    try { doc.addImage(doctor.signature_url, 'PNG', fx + 5, y + 8, 45, 15); } catch {}
  }
}

function autoTablePageHook(data) {
  if (data.pageNumber > 1) drawHeader(data.doc);
}

function plainTable(doc, body, opts = {}) {
  doc.autoTable({
    startY: doc._y,
    body,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 1, ...opts.styles },
    didDrawPage: autoTablePageHook,
    ...opts,
  });
  doc._y = doc.lastAutoTable.finalY;
}

function section(doc, title) {
  if (doc._y + 6 > 265) { doc.addPage(); drawHeader(doc); }
  doc._y += 6;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(title, MARGIN, doc._y);
  doc._y += 2;
}

function emptyLine(doc, msg) {
  if (doc._y + 6 > 275) { doc.addPage(); drawHeader(doc); }
  doc._y += 6;
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(msg || 'Sin datos registrados.', MARGIN, doc._y);
}

function subTitle(doc, text) {
  if (doc._y + 6 > 275) { doc.addPage(); drawHeader(doc); }
  doc._y += 6;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(text, MARGIN, doc._y);
  doc._y += 2;
}

function textBlock(doc, text) {
  if (doc._y + 6 > 275) { doc.addPage(); drawHeader(doc); }
  doc._y += 4;
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  const lines = doc.splitTextToSize(text || '—', PAGE_W - 2 * MARGIN);
  doc.text(lines, MARGIN, doc._y);
  doc._y += lines.length * 4.5;
}

function fmtDate(v) {
  return v ? moment(v).format('DD/MM/YYYY') : '—';
}

export function generateHistoriaMedica({ patient, emergency, antecedents, familyAntecedents, gynecologicalHistories, lifestyleHabits, notes, doctor }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc._y = MARGIN + 18;

  drawHeader(doc);

  const p = patient || {};
  const e = emergency || {};
  const ns = notes || [];

  // 1 — DATOS DEL PACIENTE
  section(doc, '1. DATOS DEL PACIENTE');
  plainTable(doc, [
    [
      { content: `Nombre y Apellido: ${p.name || ''} ${p.lastname || ''}`.trim(), styles: { fontStyle: 'bold' } },
      { content: `CI: ${p.ci || '—'}` },
      { content: `Edad: ${p.age ? `${p.age} años` : '—'}` },
      { content: `Sexo: ${p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : p.gender || '—'}` },
    ],
    [
      { content: `Fecha de Nacimiento: ${fmtDate(p.birthday)}` },
    ],
  ], {
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 'auto' },
    },
  });

  // 2 — ANTECEDENTES FAMILIARES
  section(doc, '2. ANTECEDENTES FAMILIARES');
  const fa = familyAntecedents || [];
  if (fa.length > 0) {
    plainTable(doc, fa.map((r) => [
      { content: `Patología: ${r.patologia || '—'}`, styles: { fontStyle: 'bold' } },
      { content: `Parentesco: ${r.parentesco || '—'}` },
      { content: `Valor: ${r.valor || '—'}` },
    ]), {
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 55 },
        2: { cellWidth: 'auto' },
      },
    });
  } else {
    emptyLine(doc, 'Sin antecedentes familiares registrados.');
  }

  // 3 — ANTECEDENTES PERSONALES
  section(doc, '3. ANTECEDENTES PERSONALES');
  const ant = antecedents || [];
  if (ant.length > 0) {
    ant.forEach((a) => {
      const parts = [];
      if (a.category) parts.push(`Tipo: ${a.category}`);
      if (a.condition_type) parts.push(`Condición: ${a.condition_type}`);
      if (a.description) parts.push(`Descripción: ${a.description}`);
      if (a.diagnosed_at) parts.push(`F. Diagnóstico: ${fmtDate(a.diagnosed_at)}`);
      if (a.medication) parts.push(`Medicación: ${a.medication}`);
      if (a.notes) parts.push(`Notas: ${a.notes}`);
      plainTable(doc, [parts.map((p) => ({ content: p }))], {
        columnStyles: parts.length === 1 ? {} : parts.reduce((acc, _, i) => ({ ...acc, [i]: { cellWidth: i < parts.length - 1 ? Math.floor((PAGE_W - 2 * MARGIN) / parts.length) : 'auto' } }), {}),
      });
    });
  } else {
    emptyLine(doc, 'Sin antecedentes personales registrados.');
  }

  const allergies = p.allergies || [];
  if (allergies.length > 0) {
    subTitle(doc, 'Alergias:');
    plainTable(doc, allergies.map((al) => [
      { content: `Alergia: ${al.allergy || '—'}`, styles: { fontStyle: 'bold' } },
      { content: `Severidad: ${al.severity || '—'}` },
      { content: `Notas: ${al.notes || '—'}` },
    ]), {
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 50 },
        2: { cellWidth: 'auto' },
      },
    });
  } else {
    emptyLine(doc, 'Sin alergias registradas.');
  }

  // 4 — HISTORIA GINECOBSTÉTRICA (solo mujeres)
  if (p.gender === 'F' || p.gender === 'Femenino') {
    section(doc, '4. HISTORIA GINECOBSTÉTRICA');
    const gh = gynecologicalHistories || [];
    if (gh.length > 0) {
      plainTable(doc, gh.map((r) => [
        { content: `Evento: ${r.evento || '—'}`, styles: { fontStyle: 'bold' } },
        { content: `Fecha Último Evento: ${fmtDate(r.fecha_ultimo_evento)}` },
        { content: `Observaciones: ${r.observaciones || '—'}` },
      ]), {
        columnStyles: {
          0: { cellWidth: 65 },
          1: { cellWidth: 50 },
          2: { cellWidth: 'auto' },
        },
      });
    } else {
      emptyLine(doc, 'Sin historia ginecobstétrica registrada.');
    }
  }

  // 5 — ESTILO DE VIDA
  section(doc, '5. ESTILO DE VIDA');
  const lh = lifestyleHabits || [];
  if (lh.length > 0) {
    plainTable(doc, lh.map((r) => [
      { content: `Hábito: ${r.habito || '—'}`, styles: { fontStyle: 'bold' } },
      { content: `Concurrencia: ${r.concurrencia || '—'}` },
      { content: `Observaciones: ${r.observaciones || '—'}` },
    ]), {
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 55 },
        2: { cellWidth: 'auto' },
      },
    });
  } else {
    emptyLine(doc, 'Sin hábitos registrados.');
  }

  // 6 — EXAMEN FÍSICO
  section(doc, '6. EXAMEN FÍSICO');
  const pe = e.physical_exam || {};
  const regions = [
    ['Cabeza', pe.cabeza], ['Ojo', pe.ojo], ['Cuello', pe.cuello],
    ['ORL', pe.orl], ['Tórax', pe.torax], ['Cardiovascular', pe.cardiovascular],
    ['Abdomen', pe.abdomen], ['Genitales', pe.genitales],
    ['Extremidades', pe.extremidades], ['Neurológico', pe.neurologico],
  ].filter(([, v]) => v);
  if (regions.length > 0) {
    plainTable(doc, regions.map(([region, val]) => [
      { content: `${region}: ${val || '—'}`, styles: { fontStyle: 'bold' } },
    ]));
  } else {
    emptyLine(doc, 'Sin examen físico registrado.');
  }

  // 7 — DIAGNÓSTICO
  section(doc, '7. DIAGNÓSTICO');
  subTitle(doc, 'Diagnóstico de Emergencia:');
  textBlock(doc, e.diagnostic);
  subTitle(doc, 'Motivo de Consulta:');
  textBlock(doc, e.reason_for_consultation);
  subTitle(doc, 'Enfermedad Actual:');
  textBlock(doc, e.current_illness);

  // 8 — OBSERVACIONES
  section(doc, '8. OBSERVACIONES');
  subTitle(doc, 'Observaciones:');
  textBlock(doc, e.observations);

  if (ns.length > 0) {
    subTitle(doc, 'Notas de la Emergencia:');
    ns.forEach((n) => {
      const header = `[${n.created_at ? moment(n.created_at).format('DD/MM/YYYY HH:mm') : ''}] ${n.created_by?.name || 'Desconocido'}:`;
      plainTable(doc, [[{ content: header, styles: { fontStyle: 'bold' } }]]);
      plainTable(doc, [[{ content: n.note || '' }]]);
    });
  }

  drawFooter(doc, doctor);

  return doc;
}
