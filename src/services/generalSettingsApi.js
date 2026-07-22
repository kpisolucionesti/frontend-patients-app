import axiosInstance from './axiosInstance';

export const generalSettingsApi = {
  show: async () => {
    const res = await axiosInstance.get('/general_settings');
    return res.data;
  },
  update: async (data) => {
    const res = await axiosInstance.put('/general_settings', data);
    return res.data;
  },
};
