import axiosInstance from '../../services/axiosInstance';

export const notificationsApi = {
  getAll: async (params = {}) => {
    const res = await axiosInstance.get('/notifications', { params });
    return res.data;
  },
  markRead: async (id) => {
    const res = await axiosInstance.put(`/notifications/${id}/mark_read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await axiosInstance.put('/notifications/mark_all_read');
    return res.data;
  },
};
