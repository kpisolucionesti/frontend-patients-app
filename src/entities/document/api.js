import api from '../../services/axiosInstance';

export const documentsApi = {
  list: async (attachableType, attachableId) => {
    const { data } = await api.get('/documents', {
      params: { attachable_type: attachableType, attachable_id: attachableId }
    });
    return data;
  },

  create: async (formData) => {
    const { data } = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  destroy: async (id) => {
    await api.delete(`/documents/${id}`);
  },
};
