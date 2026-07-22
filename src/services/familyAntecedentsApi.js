import axiosInstance from './axiosInstance';

export const familyAntecedentsApi = {
  getAll: async (patientId) => {
    const res = await axiosInstance.get(`/patients/${patientId}/family_antecedents`);
    return res.data;
  },
  create: async (patientId, data) => {
    const res = await axiosInstance.post(`/patients/${patientId}/family_antecedents`, data);
    return res.data;
  },
  update: async (patientId, id, data) => {
    const res = await axiosInstance.put(`/patients/${patientId}/family_antecedents/${id}`, data);
    return res.data;
  },
  delete: async (patientId, id) => {
    await axiosInstance.delete(`/patients/${patientId}/family_antecedents/${id}`);
  },
};
