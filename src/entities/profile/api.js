import axiosInstance from '../../services/axiosInstance';

export const profilesApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/profiles');
    return res.data;
  },
  create: async (profile) => {
    const res = await axiosInstance.post('/profiles', profile);
    return res.data;
  },
  update: async (profile) => {
    const res = await axiosInstance.put('/profiles/' + profile.id, profile);
    return res.data;
  },
  delete: async (id) => {
    await axiosInstance.delete('/profiles/' + id);
  },
  getUsers: async (profileId) => {
    const res = await axiosInstance.get('/profiles/' + profileId + '/users');
    return res.data;
  },
};
