import axiosInstance from './axiosInstance';

export const accessPoliciesApi = {
  show: async () => {
    const res = await axiosInstance.get('/access_policies');
    return res.data;
  },
  update: async (data) => {
    const res = await axiosInstance.put('/access_policies', data);
    return res.data;
  },
};
