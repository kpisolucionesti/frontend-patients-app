import axiosInstance from '../../services/axiosInstance';

export const dynamicSettingsApi = {
  show: async (category = 'general', companyId = null) => {
    const params = { category };
    if (companyId) params.company_id = companyId;
    const res = await axiosInstance.get('/dynamic_settings', { params });
    return res.data;
  },
  update: async (category, companyId, settingsData) => {
    const res = await axiosInstance.patch('/dynamic_settings', {
      category,
      company_id: companyId,
      settings_data: settingsData,
    });
    return res.data;
  },
};
