import axiosInstance from './axiosInstance';

export const usersApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/users');
    return res.data;
  },
  create: async (user) => {
    const res = await axiosInstance.post('/users', user);
    return res.data;
  },
  update: async (user) => {
    const res = await axiosInstance.put('/users/' + user.id, user);
    return res.data;
  },
  changePassword: async (id, data) => {
    const res = await axiosInstance.put('/users/' + id + '/change_password', data);
    return res.data;
  },
  delete: async (id) => {
    await axiosInstance.delete('/users/' + id);
  },
  updatePermissions: async (id, data) => {
    const res = await axiosInstance.put('/users/' + id + '/update_permissions', data);
    return res.data;
  },
  getProfiles: async () => {
    const res = await axiosInstance.get('/users/profiles');
    return res.data;
  },
  getEmergencies: async (userId) => {
    const res = await axiosInstance.get('/users/' + userId + '/emergencies');
    return res.data;
  },
  block: async (id) => {
    const res = await axiosInstance.put('/users/' + id + '/block');
    return res.data;
  },
  unblock: async (id) => {
    const res = await axiosInstance.put('/users/' + id + '/unblock');
    return res.data;
  },
};
