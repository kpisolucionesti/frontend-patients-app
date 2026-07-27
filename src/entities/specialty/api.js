import axiosInstance from '../../services/axiosInstance';

export const specialtiesApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/specialties');
    return (res.data || []).sort((a, b) => a.name.localeCompare(b.name));
  },
  create: async (specialty) => {
    const res = await axiosInstance.post('/specialties', specialty);
    return res.data;
  },
  update: async (specialty) => {
    const res = await axiosInstance.put('/specialties/' + specialty.id, specialty);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete('/specialties/' + id);
    return res.data;
  },
  getById: async (id) => {
    const res = await axiosInstance.get('/specialties/' + id);
    return res.data;
  },
};
