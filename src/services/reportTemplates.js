import moment from 'moment';

function patientSection(patient) {
  if (!patient) return '';
  return `
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">DATOS DEL PACIENTE</h3>
    <table style="width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:6px;">
      <tr><td style="width:50%;padding:1px 4px;"><strong>Nombre:</strong> ${patient.name || ''} ${patient.lastname || ''}</td>
          <td style="width:50%;padding:1px 4px;"><strong>CI:</strong> ${patient.ci || '—'}</td></tr>
      <tr><td style="padding:1px 4px;"><strong>Edad:</strong> ${patient.age || '—'} años</td>
          <td style="padding:1px 4px;"><strong>Género:</strong> ${patient.gender || '—'}</td></tr>
      <tr><td style="padding:1px 4px;"><strong>F. Nacimiento:</strong> ${patient.birthday ? moment(patient.birthday).format('DD/MM/YYYY') : '—'}</td>
          <td style="padding:1px 4px;"><strong>N° Historia:</strong> ${patient.medical_history_number || '—'}</td></tr>
      ${patient.representante ? `<tr><td style="padding:1px 4px;"><strong>Representante:</strong> ${patient.representante}</td><td style="padding:1px 4px;"><strong>CI Rep.:</strong> ${patient.representante_ci || '—'}</td></tr>` : ''}
    </table>
    <hr style="border:none;border-top:1px solid #ddd;margin:4px 0;"/>
  `;
}

function emergencySection(emergency) {
  if (!emergency) return '';
  return `
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">DATOS DE LA EMERGENCIA</h3>
    <table style="width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:6px;">
      <tr><td style="width:50%;padding:1px 4px;"><strong>Fecha de Ingreso:</strong> ${emergency.ingress_date || '—'}</td>
          <td style="width:50%;padding:1px 4px;"><strong>Emergencia #:</strong> ${emergency.id || '—'}</td></tr>
      ${emergency.classification ? `<tr><td style="padding:1px 4px;"><strong>Clasificación:</strong> ${emergency.classification}</td><td></td></tr>` : ''}
    </table>
    <p style="font-size:9pt;margin:2px 0;"><strong>Motivo de Consulta:</strong><br/>${emergency.reason_for_consultation || '—'}</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Enfermedad Actual:</strong><br/>${emergency.current_illness || '—'}</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Diagnóstico:</strong><br/>${emergency.diagnostic || '—'}</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Tratamiento:</strong><br/>${emergency.treatment || '—'}</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:4px 0;"/>
  `;
}

function doctorSection(emergency) {
  const primaryDoctor = emergency.doctors?.find(d => d.primary) || emergency.doctors?.[0];
  if (!primaryDoctor) return '';
  return `
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">MÉDICO TRATANTE</h3>
    <p style="font-size:9pt;margin:2px 0;"><strong>Médico:</strong> ${primaryDoctor.name || '—'}</p>
    ${primaryDoctor.specialty?.name ? `<p style="font-size:9pt;margin:2px 0;"><strong>Especialidad:</strong> ${primaryDoctor.specialty.name}</p>` : ''}
    <hr style="border:none;border-top:1px solid #ddd;margin:4px 0;"/>
  `;
}

export function getTriageTemplate(emergency, patient) {
  return `
    ${patientSection(patient)}
    ${emergencySection(emergency)}
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">INFORME DE TRIAJE</h3>
    <p style="font-size:9pt;margin:2px 0;"><strong>Clasificación:</strong> ${emergency.classification || '—'}</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:4px 0;"/>
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">OBSERVACIONES</h3>
    <p style="font-size:9pt;margin:2px 0;">${emergency.observations || '—'}</p>
    ${doctorSection(emergency)}
  `;
}

export function getResidentTemplate(emergency, patient) {
  return `
    ${patientSection(patient)}
    ${emergencySection(emergency)}
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">EVOLUCIÓN</h3>
    <p style="font-size:9pt;margin:2px 0;"><strong>Signos Vitales:</strong><br/>—</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Examen Físico:</strong><br/>—</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Resultados de Laboratorio:</strong><br/>—</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Planes Médicos:</strong><br/>—</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:4px 0;"/>
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">OBSERVACIONES</h3>
    <p style="font-size:9pt;margin:2px 0;"><br/></p>
    ${doctorSection(emergency)}
  `;
}

export function getDischargeTemplate(emergency, patient) {
  return `
    ${patientSection(patient)}
    ${emergencySection(emergency)}
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">INFORME DE ALTA</h3>
    <p style="font-size:9pt;margin:2px 0;"><strong>Fecha de Egreso:</strong> ${emergency.egress_at ? moment(emergency.egress_at).format('DD/MM/YYYY HH:mm') : '—'}</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Diagnóstico de Egreso:</strong><br/>${emergency.diagnostic || '—'}</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Resumen del Tratamiento:</strong><br/>${emergency.treatment || '—'}</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Nota de Alta:</strong><br/>${emergency.discharge_note || '—'}</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:4px 0;"/>
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">RECOMENDACIONES</h3>
    <p style="font-size:9pt;margin:2px 0;"><br/></p>
    ${doctorSection(emergency)}
  `;
}

export function getHospitalizationTemplate(emergency, patient) {
  return `
    ${patientSection(patient)}
    ${emergencySection(emergency)}
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">INFORME DE INGRESO</h3>
    <p style="font-size:9pt;margin:2px 0;"><strong>Diagnóstico de Ingreso:</strong><br/>${emergency.diagnostic || '—'}</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Motivo de Hospitalización:</strong><br/>${emergency.admission_note || '—'}</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Plan Hospitalario:</strong><br/>—</p>
    <p style="font-size:9pt;margin:2px 0;"><strong>Tiempo Estimado:</strong><br/>—</p>
    <hr style="border:none;border-top:1px solid #ddd;margin:4px 0;"/>
    <h3 style="color:#1e50a0;font-size:11pt;margin:8px 0 4px 0;">OBSERVACIONES</h3>
    <p style="font-size:9pt;margin:2px 0;"><br/></p>
    ${doctorSection(emergency)}
  `;
}
