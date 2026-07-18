import axiosInstance from './axiosInstance';

export const directAdmissionsApi = {
  create: async (data) => {
    const res = await axiosInstance.post('/direct_admission', data);
    return res.data;
  },
};
