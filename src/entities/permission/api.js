import axiosInstance from '../../services/axiosInstance';

export const permissionsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/permissions');
    return res.data;
  },
};
