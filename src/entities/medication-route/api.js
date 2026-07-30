import axiosInstance from '../../services/axiosInstance';

export const medicationRoutesApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/medication_routes');
    return res.data;
  },
};
