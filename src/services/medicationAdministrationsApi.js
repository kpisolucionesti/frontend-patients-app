import axiosInstance from './axiosInstance';

export const medicationAdministrationsApi = {
  getAll: async (hospitalizationId) => {
    const res = await axiosInstance.get(`/hospitalizations/${hospitalizationId}/medication_administrations`);
    return res.data;
  },
  create: async (hospitalizationId, data) => {
    const res = await axiosInstance.post(`/hospitalizations/${hospitalizationId}/medication_administrations`, data);
    return res.data;
  },
  update: async (hospitalizationId, adminId, data) => {
    const res = await axiosInstance.put(`/hospitalizations/${hospitalizationId}/medication_administrations/${adminId}`, data);
    return res.data;
  },
  destroy: async (hospitalizationId, adminId) => {
    await axiosInstance.delete(`/hospitalizations/${hospitalizationId}/medication_administrations/${adminId}`);
  },
};
