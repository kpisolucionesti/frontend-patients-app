import axiosInstance from './axiosInstance';

export const physicalExamsApi = {
  getByEmergency: async (emergencyId) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/physical_exams`);
    return res.data;
  },
  create: async (emergencyId, data) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/physical_exams`, data);
    return res.data;
  },
  update: async (emergencyId, id, data) => {
    const res = await axiosInstance.put(`/emergencies/${emergencyId}/physical_exams/${id}`, data);
    return res.data;
  },
};
