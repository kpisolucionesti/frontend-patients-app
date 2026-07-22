import axiosInstance from './axiosInstance';

export const lifestyleHabitsApi = {
  getAll: async (patientId) => {
    const res = await axiosInstance.get(`/patients/${patientId}/lifestyle_habits`);
    return res.data;
  },
  create: async (patientId, data) => {
    const res = await axiosInstance.post(`/patients/${patientId}/lifestyle_habits`, data);
    return res.data;
  },
  update: async (patientId, id, data) => {
    const res = await axiosInstance.put(`/patients/${patientId}/lifestyle_habits/${id}`, data);
    return res.data;
  },
  delete: async (patientId, id) => {
    await axiosInstance.delete(`/patients/${patientId}/lifestyle_habits/${id}`);
  },
};
