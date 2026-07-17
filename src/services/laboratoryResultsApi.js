import axiosInstance from './axiosInstance';

export const laboratoryResultsApi = {
  getByEmergency: async (emergencyId) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/laboratory_results`);
    return res.data;
  },
  getById: async (emergencyId, id) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/laboratory_results/${id}`);
    return res.data;
  },
  create: async (emergencyId, data) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/laboratory_results`, data);
    return res.data;
  },
  update: async (emergencyId, id, data) => {
    const res = await axiosInstance.put(`/emergencies/${emergencyId}/laboratory_results/${id}`, data);
    return res.data;
  },
  delete: async (emergencyId, id) => {
    await axiosInstance.delete(`/emergencies/${emergencyId}/laboratory_results/${id}`);
  },
};
