import axiosInstance from '../../services/axiosInstance';

export const notesApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`/notes?${query}`);
    return res.data;
  },
  create: async (note) => {
    const res = await axiosInstance.post('/notes', note);
    return res.data;
  },
  update: async (note) => {
    const res = await axiosInstance.put('/notes/' + note.id, note);
    return res.data;
  },
  delete: async (id) => {
    await axiosInstance.delete('/notes/' + id);
  },
};
