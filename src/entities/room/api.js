import axiosInstance from '../../services/axiosInstance';

export const roomsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/rooms');
    const rooms = res.data || [];
    return rooms.sort((a, b) => a.name?.localeCompare(b.name));
  },
  getById: async (id) => {
    const res = await axiosInstance.get('/rooms/' + id);
    return res.data;
  },
  create: async (room) => {
    const res = await axiosInstance.post('/rooms', room);
    return res.data;
  },
  update: async (room) => {
    const res = await axiosInstance.put('/rooms/' + room.id, room);
    return res.data;
  },
  delete: async (id) => {
    await axiosInstance.delete('/rooms/' + id);
  },
};
