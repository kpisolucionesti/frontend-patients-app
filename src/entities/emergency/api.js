import axiosInstance from '../../services/axiosInstance';

export const emergenciesApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`/emergencies?${query}`);
    return res.data;
  },
  create: async (emergency) => {
    const res = await axiosInstance.post('/emergencies', emergency);
    return res.data;
  },
  update: async (emergency) => {
    const res = await axiosInstance.put('/emergencies/' + emergency.id, emergency);
    return res.data;
  },
  getById: async (id) => {
    const res = await axiosInstance.get('/emergencies/' + id);
    return res.data;
  },
};
