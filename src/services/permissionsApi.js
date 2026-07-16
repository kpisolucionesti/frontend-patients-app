import axiosInstance from './axiosInstance';

export const permissionsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/permissions');
    return res.data;
  },
};
