import { CLASSIFICATION_OPTIONS } from '../../constants';

export const GENDER_MAP = { M: 'Masculino', F: 'Femenino' };

export const EMERGENCY_EXPORT_COLUMNS = [
  { header: 'Cédula', accessorKey: 'patient.ci' },
  { header: 'Paciente', accessorKey: 'patient.name' },
  { header: 'Apellido', accessorKey: 'patient.lastname' },
  { header: 'Edad', accessorKey: 'patient.age' },
  { header: 'Médico', accessorKey: 'primary_doctor.name' },
  { header: 'Diagnóstico', accessorKey: 'diagnostic' },
  { header: 'Estado', accessorKey: 'status' },
  { header: 'Clasificación', accessorKey: 'classification' },
];

export const toFrontendKey = (val) => {
  if (!val) return '';
  if (CLASSIFICATION_OPTIONS.some((c) => c.key === val)) return val;
  const reverseMap = { triage_i: 'red', triage_ii: 'orange', triage_iii: 'yellow', triage_iv: 'green', consulta_externa: 'blue' };
  return reverseMap[val] || val;
};

export const TO_BACKEND = {
  red: 'triage_i', orange: 'triage_ii', yellow: 'triage_iii', green: 'triage_iv', blue: 'consulta_externa',
};
