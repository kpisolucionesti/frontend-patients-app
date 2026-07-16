import axiosInstance from './axiosInstance';

export const roomsApi = {
  getAll: async () => {
    const res = await axiosInstance.get('/rooms');
    return res.data;
  },
  update: async (room) => {
    const res = await axiosInstance.put('/rooms/' + room.id, room);
    return res.data;
  },
};
