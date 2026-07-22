import axiosInstance from './axiosInstance';

export const auditLogsApi = {
  list: async (params = {}) => {
    const res = await axiosInstance.get('/audit_logs', { params });
    return res.data;
  },
};
