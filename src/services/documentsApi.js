import axiosInstance from './axiosInstance';

export const documentsApi = {
  list(attachableType, attachableId) {
    return axiosInstance.get('/documents', {
      params: { attachable_type: attachableType, attachable_id: attachableId }
    }).then(r => r.data);
  },

  create(formData) {
    return axiosInstance.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },

  destroy(id) {
    return axiosInstance.delete(`/documents/${id}`).then(r => r.data);
  }
};
