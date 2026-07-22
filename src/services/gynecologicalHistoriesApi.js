import axiosInstance from './axiosInstance';

export const gynecologicalHistoriesApi = {
  getAll: async (patientId) => {
    const res = await axiosInstance.get(`/patients/${patientId}/gynecological_histories`);
    return res.data;
  },
  create: async (patientId, data) => {
    const res = await axiosInstance.post(`/patients/${patientId}/gynecological_histories`, data);
    return res.data;
  },
  update: async (patientId, id, data) => {
    const res = await axiosInstance.put(`/patients/${patientId}/gynecological_histories/${id}`, data);
    return res.data;
  },
  delete: async (patientId, id) => {
    await axiosInstance.delete(`/patients/${patientId}/gynecological_histories/${id}`);
  },
};
