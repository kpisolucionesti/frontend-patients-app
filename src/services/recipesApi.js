import axiosInstance from './axiosInstance';

export const recipesApi = {
  getAll: async (emergencyId) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/recipes`);
    return res.data;
  },
  create: async (emergencyId, data) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/recipes`, data);
    return res.data;
  },
  update: async (emergencyId, id, data) => {
    const res = await axiosInstance.put(`/emergencies/${emergencyId}/recipes/${id}`, data);
    return res.data;
  },
  destroy: async (emergencyId, id) => {
    await axiosInstance.delete(`/emergencies/${emergencyId}/recipes/${id}`);
  },
};
