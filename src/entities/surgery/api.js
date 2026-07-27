import axiosInstance from '../../services/axiosInstance';

export const surgeriesApi = {
  getAll: async (hospitalizationId) => {
    const res = await axiosInstance.get(`/hospitalizations/${hospitalizationId}/surgeries`);
    return res.data;
  },
  create: async (hospitalizationId, data) => {
    const res = await axiosInstance.post(`/hospitalizations/${hospitalizationId}/surgeries`, data);
    return res.data;
  },
  update: async (hospitalizationId, id, data) => {
    const res = await axiosInstance.put(`/hospitalizations/${hospitalizationId}/surgeries/${id}`, data);
    return res.data;
  },
  destroy: async (hospitalizationId, id) => {
    await axiosInstance.delete(`/hospitalizations/${hospitalizationId}/surgeries/${id}`);
  },
  search: async (params = {}) => {
    const res = await axiosInstance.get('/surgeries/search', { params });
    return res.data;
  },
};
