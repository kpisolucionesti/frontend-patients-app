import axiosInstance from './axiosInstance';

export const allergiesApi = {
  getAll: async (patientId) => {
    const res = await axiosInstance.get(`/patients/${patientId}/allergies`);
    return res.data;
  },
  create: async (patientId, data) => {
    const res = await axiosInstance.post(`/patients/${patientId}/allergies`, data);
    return res.data;
  },
  update: async (patientId, id, data) => {
    const res = await axiosInstance.put(`/patients/${patientId}/allergies/${id}`, data);
    return res.data;
  },
  delete: async (patientId, id) => {
    await axiosInstance.delete(`/patients/${patientId}/allergies/${id}`);
  },
};
