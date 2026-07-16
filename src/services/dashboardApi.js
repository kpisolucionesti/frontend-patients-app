import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getStats: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await axiosInstance.get(`/dashboard/stats?${query}`);
      return res.data;
    } catch (err) {
      console.error('Dashboard API error:', err.response?.data || err.message);
      throw err;
    }
  },
};
