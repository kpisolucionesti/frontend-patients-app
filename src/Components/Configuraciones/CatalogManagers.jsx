import { useState, useEffect } from 'react';
import CatalogManager from './CatalogManager';
import { catalogsApi } from '../../services/catalogsApi';

const CAT_1COL = [{ field: 'name', label: 'Nombre', required: true, aliases: ['name', 'nombre'] }];
const CAT_1TMPL = [{ name: 'Ejemplo 1' }, { name: 'Ejemplo 2' }];
const makeApiImport = (api, fieldMap) => async (rows) => {
  const errors = []; let created = 0;
  for (const row of rows) {
    try { if (fieldMap) { const d = {}; Object.entries(fieldMap).forEach(([k, v]) => { d[k] = row[v]; }); await api.create(d); }
      else { await api.create({ name: row.name }); }
      created++;
    } catch { errors.push({ row: row._row, error: 'Error al crear' }); }
  }
  return { created, errors };
};

const VIAS_FIELDS = [
  { name: 'name', label: 'Nombre', required: true },
];

const MEDICAMENTOS_FIELDS = [
  { name: 'name', label: 'Nombre', required: true },
  { name: 'generic_name', label: 'Nombre Generico' },
  { name: 'presentation', label: 'Presentacion', type: 'select' },
  { name: 'concentration', label: 'Concentracion', type: 'select' },
  { name: 'medication_route_id', label: 'Via de Administracion', type: 'select' },
];

const DIAGNOSTICOS_FIELDS = [
  { name: 'code', label: 'Codigo CIE-10', required: true },
  { name: 'description', label: 'Descripcion', required: true, multiline: true, rows: 2 },
  { name: 'category', label: 'Categoria' },
];

const ALERGENOS_FIELDS_WITH_CAT = [
  { name: 'name', label: 'Nombre', required: true },
  { name: 'category', label: 'Categoria', type: 'select' },
];

const PROCEDIMIENTOS_FIELDS_WITH_CAT = [
  { name: 'code', label: 'Codigo' },
  { name: 'name', label: 'Nombre', required: true },
  { name: 'category', label: 'Categoria', type: 'select' },
];

const ANESTESIA_FIELDS = [
  { name: 'name', label: 'Nombre', required: true },
];

const ALTA_FIELDS = [
  { name: 'name', label: 'Nombre', required: true },
  { name: 'requires_cause_of_death', label: 'Requiere causa de muerte', type: 'boolean' },
];

const SIGNOS_VITALES_FIELDS = [
  { name: 'parameter', label: 'Parametro', required: true, type: 'select', options: [
    { value: 'systolic_bp', label: 'Presion Sistolica' },
    { value: 'diastolic_bp', label: 'Presion Diastolica' },
    { value: 'heart_rate', label: 'Frecuencia Cardiaca' },
    { value: 'respiratory_rate', label: 'Frecuencia Respiratoria' },
    { value: 'temperature', label: 'Temperatura' },
    { value: 'oxygen_saturation', label: 'Saturacion de Oxigeno' },
    { value: 'glucose', label: 'Glucosa' },
    { value: 'height', label: 'Talla' },
    { value: 'weight', label: 'Peso' },
    { value: 'bmi', label: 'IMC' },
  ]},
  { name: 'sex', label: 'Sexo', type: 'select', options: [
    { value: 'all', label: 'Todos' },
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
  ]},
  { name: 'age_min', label: 'Edad Min (años)', type: 'number' },
  { name: 'age_max', label: 'Edad Max (años)', type: 'number' },
  { name: 'min_normal', label: 'Min Normal', type: 'number' },
  { name: 'max_normal', label: 'Max Normal', type: 'number' },
  { name: 'min_alert', label: 'Min Alerta', type: 'number' },
  { name: 'max_alert', label: 'Max Alerta', type: 'number' },
];

const makeLabelOptions = (data) => (data || []).map((d) => ({ name: d.name, label: d.name }));

export const ViasManager = () => (
  <CatalogManager apiService={catalogsApi.medicationRoutes}
    title="Vias de Administracion"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={VIAS_FIELDS}
    importConfig={{ sectionLabel: 'Vias', templateName: 'plantilla_vias', columns: CAT_1COL, templateRows: CAT_1TMPL, apiImportFn: makeApiImport(catalogsApi.medicationRoutes) }} />
);

export const PresentacionesManager = () => (
  <CatalogManager apiService={catalogsApi.medicationPresentations}
    title="Presentaciones"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={VIAS_FIELDS}
    importConfig={{ sectionLabel: 'Presentaciones', templateName: 'plantilla_presentaciones', columns: CAT_1COL, templateRows: CAT_1TMPL, apiImportFn: makeApiImport(catalogsApi.medicationPresentations) }} />
);

export const ConcentracionesManager = () => (
  <CatalogManager apiService={catalogsApi.medicationConcentrations}
    title="Concentraciones"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={VIAS_FIELDS}
    importConfig={{ sectionLabel: 'Concentraciones', templateName: 'plantilla_concentraciones', columns: CAT_1COL, templateRows: CAT_1TMPL, apiImportFn: makeApiImport(catalogsApi.medicationConcentrations) }} />
);

export const MedicamentosManager = () => {
  const [routes, setRoutes] = useState([]);
  const [presentations, setPresentations] = useState([]);
  const [concentrations, setConcentrations] = useState([]);

  useEffect(() => {
    catalogsApi.medicationRoutes.list().then(setRoutes).catch(() => {});
    catalogsApi.medicationPresentations.list().then(setPresentations).catch(() => {});
    catalogsApi.medicationConcentrations.list().then(setConcentrations).catch(() => {});
  }, []);

  return (
    <CatalogManager apiService={catalogsApi.medications}
      title="Medicamentos"
      columns={[
        { key: 'name', label: 'Nombre' },
        { key: 'generic_name', label: 'Generico' },
        { key: 'presentation', label: 'Presentacion' },
        { key: 'concentration', label: 'Concentracion' },
        { key: 'route', label: 'Via', render: (r) => r.medication_route?.name || '-' },
      ]}
      fields={MEDICAMENTOS_FIELDS}
      referenceData={{
        medication_route_id: makeLabelOptions(routes),
        presentation: makeLabelOptions(presentations),
        concentration: makeLabelOptions(concentrations),
      }}
      importConfig={{ sectionLabel: 'Medicamentos', templateName: 'plantilla_medicamentos',
        columns: [
          { field: 'name', label: 'Nombre', required: true, aliases: ['name', 'nombre', 'medicamento'] },
          { field: 'generic_name', label: 'Generico', required: false, aliases: ['generic_name', 'generico'] },
        ], templateRows: [{ name: 'Paracetamol', generic_name: 'Acetaminofen' }],
        apiImportFn: makeApiImport(catalogsApi.medications, { name: 'name', generic_name: 'generic_name' }) }}
    />
  );
};

export const DiagnosticosManager = () => (
  <CatalogManager apiService={catalogsApi.diagnoses}
    title="Diagnosticos CIE-10"
    columns={[
      { key: 'code', label: 'Codigo' },
      { key: 'description', label: 'Descripcion' },
      { key: 'category', label: 'Categoria' },
    ]}
    fields={DIAGNOSTICOS_FIELDS}
    importConfig={{ sectionLabel: 'Diagnosticos', templateName: 'plantilla_diagnosticos',
      columns: [
        { field: 'code', label: 'Codigo CIE-10', required: true, aliases: ['code', 'codigo'] },
        { field: 'description', label: 'Descripcion', required: true, aliases: ['description', 'descripcion'] },
        { field: 'category', label: 'Categoria', required: false, aliases: ['category', 'categoria'] },
      ], templateRows: [{ code: 'J15', description: 'Neumonia bacteriana', category: 'Respiratorio' }],
      apiImportFn: makeApiImport(catalogsApi.diagnoses, { code: 'code', description: 'description', category: 'category' }) }}
  />
);

export const CategoriasAlergiasManager = () => (
  <CatalogManager apiService={catalogsApi.allergenCategories}
    title="Categorias de Alergias"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={VIAS_FIELDS}
    importConfig={{ sectionLabel: 'Categorias Alergias', templateName: 'plantilla_catalergias', columns: CAT_1COL, templateRows: CAT_1TMPL, apiImportFn: makeApiImport(catalogsApi.allergenCategories) }} />
);

export const AlergenosManager = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    catalogsApi.allergenCategories.list().then(setCategories).catch(() => {});
  }, []);

  return (
    <CatalogManager apiService={catalogsApi.allergens}
      title="Catalogo de Alergias"
      columns={[
        { key: 'name', label: 'Nombre' },
        { key: 'category', label: 'Categoria' },
      ]}
      fields={ALERGENOS_FIELDS_WITH_CAT}
      referenceData={{ category: makeLabelOptions(categories) }}
      importConfig={{ sectionLabel: 'Alergias', templateName: 'plantilla_alergias',
        columns: [
          { field: 'name', label: 'Nombre', required: true, aliases: ['name', 'nombre', 'alergeno'] },
          { field: 'category', label: 'Categoria', required: false, aliases: ['category', 'categoria'] },
        ], templateRows: [{ name: 'Penicilina', category: 'Medicamentos' }],
        apiImportFn: makeApiImport(catalogsApi.allergens, { name: 'name', category: 'category' }) }}
    />
  );
};

export const CategoriasCirugiaManager = () => (
  <CatalogManager apiService={catalogsApi.surgeryCategories}
    title="Categorias de Cirugia"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={VIAS_FIELDS}
    importConfig={{ sectionLabel: 'Categorias Cirugia', templateName: 'plantilla_catcirugia', columns: CAT_1COL, templateRows: CAT_1TMPL, apiImportFn: makeApiImport(catalogsApi.surgeryCategories) }} />
);

export const ProcedimientosQuirurgicosManager = () => {
  const [categories, setCategories] = useState([]);
  useEffect(() => { catalogsApi.surgeryCategories.list().then(setCategories).catch(() => {}); }, []);

  return (
    <CatalogManager apiService={catalogsApi.surgeryProcedures}
      title="Procedimientos Quirurgicos"
      columns={[
        { key: 'code', label: 'Codigo' },
        { key: 'name', label: 'Nombre' },
        { key: 'category', label: 'Categoria' },
      ]}
      fields={PROCEDIMIENTOS_FIELDS_WITH_CAT}
      referenceData={{ category: makeLabelOptions(categories) }}
      importConfig={{ sectionLabel: 'Procedimientos Qx', templateName: 'plantilla_procqx',
        columns: [
          { field: 'name', label: 'Nombre', required: true, aliases: ['name', 'nombre', 'procedimiento'] },
          { field: 'code', label: 'Codigo', required: false, aliases: ['code', 'codigo'] },
        ], templateRows: [{ name: 'Apendicectomia', code: 'APX' }],
        apiImportFn: makeApiImport(catalogsApi.surgeryProcedures, { name: 'name', code: 'code' }) }}
    />
  );
};

export const AnestesiaManager = () => (
  <CatalogManager apiService={catalogsApi.anesthesiaTypes}
    title="Tipos de Anestesia"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={ANESTESIA_FIELDS}
    importConfig={{ sectionLabel: 'Anestesia', templateName: 'plantilla_anestesia', columns: CAT_1COL, templateRows: CAT_1TMPL, apiImportFn: makeApiImport(catalogsApi.anesthesiaTypes) }} />
);

export const TiposAltaManager = () => (
  <CatalogManager apiService={catalogsApi.dischargeTypes}
    title="Tipos de Alta / Egreso"
    columns={[
      { key: 'name', label: 'Nombre' },
      { key: 'requires_cause_of_death', label: 'Requiere Causa de Muerte', render: (r) => r.requires_cause_of_death ? 'Si' : 'No' },
    ]}
    fields={ALTA_FIELDS}
    importConfig={{ sectionLabel: 'Tipos de Alta', templateName: 'plantilla_alta', columns: CAT_1COL, templateRows: CAT_1TMPL, apiImportFn: makeApiImport(catalogsApi.dischargeTypes) }} />
);

export const RangosSignosVitalesManager = () => (
  <CatalogManager apiService={catalogsApi.vitalSignsRanges}
    title="Rangos de Signos Vitales"
    columns={[
      { key: 'parameter', label: 'Parametro' },
      { key: 'sex', label: 'Sexo', render: (r) => ({ M: 'M', F: 'F', all: 'Todos' }[r.sex] || r.sex) },
      { key: 'age_min', label: 'Edad Min' },
      { key: 'age_max', label: 'Edad Max' },
      { key: 'min_normal', label: 'Normal Min' },
      { key: 'max_normal', label: 'Normal Max' },
      { key: 'min_alert', label: 'Alerta Min' },
      { key: 'max_alert', label: 'Alerta Max' },
    ]}
    fields={SIGNOS_VITALES_FIELDS} />
);
