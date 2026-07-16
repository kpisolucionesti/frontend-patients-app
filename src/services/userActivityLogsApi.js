import axiosInstance from './axiosInstance';

export const userActivityLogsApi = {
  getByUser: async (userId) => {
    const res = await axiosInstance.get(`/users/${userId}/activity_logs`);
    return res.data;
  },
};
