import axiosInstance from './axiosInstance';

const makeCrud = (basePath) => ({
  list: async (params = {}) => {
    const res = await axiosInstance.get(basePath, { params });
    return res.data;
  },
  get: async (id) => {
    const res = await axiosInstance.get(`${basePath}/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await axiosInstance.post(basePath, data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axiosInstance.put(`${basePath}/${id}`, data);
    return res.data;
  },
  remove: async (id) => {
    await axiosInstance.delete(`${basePath}/${id}`);
  },
});

export const catalogsApi = {
  medicationRoutes: makeCrud('/medication_routes'),
  medications: makeCrud('/medications'),
  diagnoses: makeCrud('/diagnoses'),
  allergens: makeCrud('/allergens'),
  surgeryProcedures: makeCrud('/surgery_procedures'),
  anesthesiaTypes: makeCrud('/anesthesia_types'),
  dischargeTypes: makeCrud('/discharge_types'),
  vitalSignsRanges: makeCrud('/vital_signs_ranges'),
  medicationPresentations: makeCrud('/medication_presentations'),
  medicationConcentrations: makeCrud('/medication_concentrations'),
  allergenCategories: makeCrud('/allergen_categories'),
  surgeryCategories: makeCrud('/surgery_categories'),
};
