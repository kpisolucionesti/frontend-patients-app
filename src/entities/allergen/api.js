import axiosInstance from '../../services/axiosInstance';

export const allergensCatalogApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/allergens');
    return res.data;
  },
};
