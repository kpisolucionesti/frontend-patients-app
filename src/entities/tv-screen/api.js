import axiosInstance from '../../services/axiosInstance';

export const tvScreensApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/tv_screens');
    return res.data;
  },
  get: async (id) => {
    const res = await axiosInstance.get(`/tv_screens/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await axiosInstance.post('/tv_screens', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axiosInstance.put(`/tv_screens/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`/tv_screens/${id}`);
    return res.data;
  },
  regeneratePin: async (id) => {
    const res = await axiosInstance.post(`/tv_screens/${id}/regenerate_pin`);
    return res.data;
  },
  revokeSessions: async (id) => {
    const res = await axiosInstance.post(`/tv_screens/${id}/revoke_sessions`);
    return res.data;
  },
  listActive: async () => {
    const res = await axiosInstance.get('/tv_screens/list_active');
    return res.data;
  },
  auth: async (name, pin) => {
    const res = await axiosInstance.post('/tv_screens/auth', { name, pin });
    return res.data;
  },
  getEvents: async (tvScreenId, params = {}) => {
    const res = await axiosInstance.get(`/tv_screens/${tvScreenId}/events`, { params });
    return res.data;
  },
};
