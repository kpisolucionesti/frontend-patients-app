import axiosInstance from '../../services/axiosInstance';

export const paraclinicalStudiesApi = {
  getAll: async (emergencyId) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/paraclinical_studies`);
    return res.data;
  },
  create: async (emergencyId, data) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/paraclinical_studies`, data);
    return res.data;
  },
  update: async (emergencyId, id, data) => {
    const res = await axiosInstance.put(`/emergencies/${emergencyId}/paraclinical_studies/${id}`, data);
    return res.data;
  },
  delete: async (emergencyId, id) => {
    await axiosInstance.delete(`/emergencies/${emergencyId}/paraclinical_studies/${id}`);
  },
};
