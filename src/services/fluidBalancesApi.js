import axiosInstance from './axiosInstance';

export const fluidBalancesApi = {
  getAll: async (hospitalizationId) => {
    const res = await axiosInstance.get(`/hospitalizations/${hospitalizationId}/fluid_balances`);
    return res.data;
  },
  create: async (hospitalizationId, data) => {
    const res = await axiosInstance.post(`/hospitalizations/${hospitalizationId}/fluid_balances`, data);
    return res.data;
  },
  update: async (hospitalizationId, balanceId, data) => {
    const res = await axiosInstance.put(`/hospitalizations/${hospitalizationId}/fluid_balances/${balanceId}`, data);
    return res.data;
  },
  destroy: async (hospitalizationId, balanceId) => {
    await axiosInstance.delete(`/hospitalizations/${hospitalizationId}/fluid_balances/${balanceId}`);
  },
  summary: async (hospitalizationId) => {
    const res = await axiosInstance.get(`/hospitalizations/${hospitalizationId}/fluid_balances/summary`);
    return res.data;
  },
};
