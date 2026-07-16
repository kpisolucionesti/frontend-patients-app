import axiosInstance from './axiosInstance';

export const interconsultationsApi = {
  getAll: async (emergencyId) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/interconsultations`);
    return res.data;
  },
  create: async (emergencyId, data) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/interconsultations`, data);
    return res.data;
  },
  update: async (emergencyId, id, data) => {
    const res = await axiosInstance.put(`/emergencies/${emergencyId}/interconsultations/${id}`, data);
    return res.data;
  },
  destroy: async (emergencyId, id) => {
    await axiosInstance.delete(`/emergencies/${emergencyId}/interconsultations/${id}`);
  },
};
