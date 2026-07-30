import api from '../../services/axiosInstance';

export const documentsApi = {
  list: async (attachableType, attachableId, filters = {}) => {
    const { data } = await api.get('/documents', {
      params: {
        attachable_type: attachableType,
        attachable_id: attachableId,
        ...filters,
      }
    });
    return data;
  },

  create: async (formData) => {
    const { data } = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/documents/${id}`, payload);
    return data;
  },

  destroy: async (id) => {
    await api.delete(`/documents/${id}`);
  },

  send: async (id) => {
    const { data } = await api.post(`/documents/${id}/send_email`);
    return data;
  },
};
