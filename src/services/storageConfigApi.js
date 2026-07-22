import axiosInstance from './axiosInstance';

export const storageConfigApi = {
  show: async () => {
    const res = await axiosInstance.get('/storage_configurations');
    return res.data;
  },
  update: async (data) => {
    const res = await axiosInstance.put('/storage_configurations', data);
    return res.data;
  },
};
