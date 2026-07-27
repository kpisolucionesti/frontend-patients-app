import axiosInstance from '../../services/axiosInstance';

export const antecedentsApi = {
  getAll: async (patientId) => {
    const res = await axiosInstance.get(`/patients/${patientId}/antecedents`);
    return res.data;
  },
  create: async (patientId, data) => {
    const res = await axiosInstance.post(`/patients/${patientId}/antecedents`, data);
    return res.data;
  },
  update: async (patientId, id, data) => {
    const res = await axiosInstance.put(`/patients/${patientId}/antecedents/${id}`, data);
    return res.data;
  },
  delete: async (patientId, id) => {
    await axiosInstance.delete(`/patients/${patientId}/antecedents/${id}`);
  },
};
