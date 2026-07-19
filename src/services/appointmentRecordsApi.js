import axiosInstance from './axiosInstance';

export const appointmentRecordsApi = {
  getByAppointment: async (appointmentId) => {
    try {
      const res = await axiosInstance.get('/appointments/' + appointmentId + '/record');
      return res.data;
    } catch {
      return null;
    }
  },
  create: async (appointmentId, data) => {
    const res = await axiosInstance.post('/appointments/' + appointmentId + '/record', data);
    return res.data;
  },
  update: async (appointmentId, data) => {
    const res = await axiosInstance.put('/appointments/' + appointmentId + '/record', data);
    return res.data;
  },
};
