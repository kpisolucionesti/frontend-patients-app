import axiosInstance from '../../services/axiosInstance';

export const medicationsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/medications');
    return res.data;
  },
};
