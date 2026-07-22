import axiosInstance from './axiosInstance';

export const sessionSettingsApi = {
  show: async () => {
    const res = await axiosInstance.get('/session_settings');
    return res.data;
  },
  update: async (data) => {
    const res = await axiosInstance.put('/session_settings', data);
    return res.data;
  },
};
