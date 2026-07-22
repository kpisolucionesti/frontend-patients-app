import axiosInstance from './axiosInstance';

export const passwordPoliciesApi = {
  show: async () => {
    const res = await axiosInstance.get('/password_policies');
    return res.data;
  },
  update: async (data) => {
    const res = await axiosInstance.put('/password_policies', data);
    return res.data;
  },
};
