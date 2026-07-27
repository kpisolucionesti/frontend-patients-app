import axiosInstance from '../../services/axiosInstance';

export const vitalSignsApi = {
  getAll: async (emergencyId) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/vital_signs`);
    return res.data;
  },
  create: async (emergencyId, data) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/vital_signs`, data);
    return res.data;
  },
};
