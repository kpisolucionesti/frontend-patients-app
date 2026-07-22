import axiosInstance from './axiosInstance';

export const companySettingsApi = {
  show: async () => {
    const res = await axiosInstance.get('/company_settings');
    return res.data;
  },
  update: async (data) => {
    const res = await axiosInstance.put('/company_settings', data);
    return res.data;
  },
};
