import axiosInstance from './axiosInstance';

export const hospitalizationNotesApi = {
  getAll: async (hospitalizationId) => {
    const res = await axiosInstance.get(`/hospitalizations/${hospitalizationId}/hospitalization_notes`);
    return res.data;
  },
  create: async (hospitalizationId, data) => {
    const res = await axiosInstance.post(`/hospitalizations/${hospitalizationId}/hospitalization_notes`, data);
    return res.data;
  },
  update: async (hospitalizationId, noteId, data) => {
    const res = await axiosInstance.put(`/hospitalizations/${hospitalizationId}/hospitalization_notes/${noteId}`, data);
    return res.data;
  },
  destroy: async (hospitalizationId, noteId) => {
    await axiosInstance.delete(`/hospitalizations/${hospitalizationId}/hospitalization_notes/${noteId}`);
  },
};
