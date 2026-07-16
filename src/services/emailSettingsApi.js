import axiosInstance from './axiosInstance';

export const emailSettingsApi = {
  show: async () => {
    const res = await axiosInstance.get('/email_settings');
    return res.data;
  },
  update: async (data) => {
    const res = await axiosInstance.put('/email_settings', data);
    return res.data;
  },
  test: async (data) => {
    const res = await axiosInstance.post('/email_settings/test', data);
    return res.data;
  },
};
