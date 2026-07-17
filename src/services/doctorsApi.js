import axiosInstance from './axiosInstance';

export const doctorsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/doctors');
    const doctors = res.data || [];
    return doctors.sort((a, b) => a.name.localeCompare(b.name));
  },
  create: async (doctor) => {
    const res = await axiosInstance.post('/doctors', doctor);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete('/doctors/' + id);
    return res.data;
  },
  update: async (doctor) => {
    const res = await axiosInstance.put('/doctors/' + doctor.id, doctor);
    return res.data;
  },
  getById: async (id) => {
    const res = await axiosInstance.get('/doctors/' + id);
    return res.data;
  },
};
