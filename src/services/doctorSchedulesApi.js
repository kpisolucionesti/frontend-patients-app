import axiosInstance from './axiosInstance';

export const doctorSchedulesApi = {
  getByDoctor: async (doctorId) => {
    const res = await axiosInstance.get(`/doctors/${doctorId}/schedules`);
    return res.data || [];
  },
  update: async (doctorId, schedules) => {
    const res = await axiosInstance.put(`/doctors/${doctorId}/schedules`, { schedules });
    return res.data || [];
  },
};
