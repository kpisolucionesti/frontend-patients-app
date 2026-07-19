import axiosInstance from './axiosInstance';

export const appointmentDisplaysApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/appointment_displays');
    return res.data || [];
  },
  create: async (data) => {
    const res = await axiosInstance.post('/appointment_displays', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axiosInstance.put('/appointment_displays/' + id, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete('/appointment_displays/' + id);
    return res.data;
  },
  getQueue: async (publicId) => {
    const res = await axiosInstance.get('/appointment_displays/' + publicId);
    return res.data;
  },
};
