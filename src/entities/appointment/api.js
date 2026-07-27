import axiosInstance from '../../services/axiosInstance';

export const appointmentsApi = {
  getAll: async (params = {}) => {
    const query = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
    const res = await axiosInstance.get('/appointments' + query);
    return res.data || [];
  },
  getById: async (id) => {
    const res = await axiosInstance.get('/appointments/' + id);
    return res.data;
  },
  create: async (data) => {
    const res = await axiosInstance.post('/appointments', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axiosInstance.put('/appointments/' + id, data);
    return res.data;
  },
  complete: async (id) => {
    const res = await axiosInstance.post('/appointments/' + id + '/complete');
    return res.data;
  },
  availableSlots: async (doctorId, date) => {
    const res = await axiosInstance.get('/appointments/available_slots', { params: { doctor_id: doctorId, date } });
    return res.data || [];
  },
};
