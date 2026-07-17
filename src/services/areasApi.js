import axiosInstance from './axiosInstance';

export const areasApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/areas');
    const areas = res.data || [];
    return areas.sort((a, b) => a.name?.localeCompare(b.name));
  },
  getById: async (id) => {
    const res = await axiosInstance.get('/areas/' + id);
    return res.data;
  },
  create: async (area) => {
    const res = await axiosInstance.post('/areas', area);
    return res.data;
  },
  update: async (id, area) => {
    const res = await axiosInstance.put('/areas/' + id, area);
    return res.data;
  },
  delete: async (id) => {
    await axiosInstance.delete('/areas/' + id);
  },
};
