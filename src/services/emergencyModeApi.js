import axiosInstance from './axiosInstance';

export const emergencyModeApi = {
  show: async () => {
    const res = await axiosInstance.get('/emergency_modes');
    return res.data;
  },
  update: async (data) => {
    const res = await axiosInstance.put('/emergency_modes', data);
    return res.data;
  },
  block: async (data) => {
    const res = await axiosInstance.post('/emergency_modes/block', data);
    return res.data;
  },
  unblock: async () => {
    const res = await axiosInstance.post('/emergency_modes/unblock');
    return res.data;
  },
};
