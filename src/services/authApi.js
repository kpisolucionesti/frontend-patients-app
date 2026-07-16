import axiosInstance from './axiosInstance';

export const authApi = {
  signIn: async (username, password) => {
    const res = await axiosInstance.post('/api/v1/auth/sign_in', { username, password });
    return res.data;
  },
  signOut: async () => {
    const res = await axiosInstance.delete('/api/v1/auth/sign_out');
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await axiosInstance.post('/api/v1/auth/forgot_password', { email });
    return res.data;
  },
  resetPassword: async (data) => {
    const res = await axiosInstance.put('/api/v1/auth/reset_password', data);
    return res.data;
  },
};
