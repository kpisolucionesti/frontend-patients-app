import axiosInstance from '../../services/axiosInstance';

export const evaluationsApi = {
  getAll: async (emergencyId) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/evaluations`);
    return res.data;
  },
  create: async (emergencyId, data) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/evaluations`, data);
    return res.data;
  },
  update: async (emergencyId, id, data) => {
    const res = await axiosInstance.put(`/emergencies/${emergencyId}/evaluations/${id}`, data);
    return res.data;
  },
  destroy: async (emergencyId, id) => {
    await axiosInstance.delete(`/emergencies/${emergencyId}/evaluations/${id}`);
  },
};
