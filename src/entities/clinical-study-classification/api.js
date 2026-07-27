import axiosInstance from '../../services/axiosInstance';

export const clinicalStudyClassificationApi = {
  getAll: async (includeInactive = false) => {
    const params = includeInactive ? '?include_inactive=true' : '';
    const res = await axiosInstance.get(`/clinical_study_classifications${params}`);
    return res.data;
  },
  create: async (data) => {
    const res = await axiosInstance.post('/clinical_study_classifications', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axiosInstance.put(`/clinical_study_classifications/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete(`/clinical_study_classifications/${id}`);
    return res.data;
  },
  restore: async (id) => {
    const res = await axiosInstance.put(`/clinical_study_classifications/${id}/restore`);
    return res.data;
  },
};
