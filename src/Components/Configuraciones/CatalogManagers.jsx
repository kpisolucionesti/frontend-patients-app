import { useState, useEffect } from 'react';
import CatalogManager from './CatalogManager';
import { catalogsApi } from '../../services/catalogsApi';

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
    fields={VIAS_FIELDS} />
);

export const PresentacionesManager = () => (
  <CatalogManager apiService={catalogsApi.medicationPresentations}
    title="Presentaciones"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={VIAS_FIELDS} />
);

export const ConcentracionesManager = () => (
  <CatalogManager apiService={catalogsApi.medicationConcentrations}
    title="Concentraciones"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={VIAS_FIELDS} />
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
    fields={DIAGNOSTICOS_FIELDS} />
);

export const CategoriasAlergiasManager = () => (
  <CatalogManager apiService={catalogsApi.allergenCategories}
    title="Categorias de Alergias"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={VIAS_FIELDS} />
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
    />
  );
};

export const CategoriasCirugiaManager = () => (
  <CatalogManager apiService={catalogsApi.surgeryCategories}
    title="Categorias de Cirugia"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={VIAS_FIELDS} />
);

export const ProcedimientosQuirurgicosManager = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    catalogsApi.surgeryCategories.list().then(setCategories).catch(() => {});
  }, []);

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
    />
  );
};

export const AnestesiaManager = () => (
  <CatalogManager apiService={catalogsApi.anesthesiaTypes}
    title="Tipos de Anestesia"
    columns={[{ key: 'name', label: 'Nombre' }]}
    fields={ANESTESIA_FIELDS} />
);

export const TiposAltaManager = () => (
  <CatalogManager apiService={catalogsApi.dischargeTypes}
    title="Tipos de Alta / Egreso"
    columns={[
      { key: 'name', label: 'Nombre' },
      { key: 'requires_cause_of_death', label: 'Requiere Causa de Muerte', render: (r) => r.requires_cause_of_death ? 'Si' : 'No' },
    ]}
    fields={ALTA_FIELDS} />
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
