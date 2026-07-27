import axiosInstance from '../../services/axiosInstance';

export const medicalPlansApi = {
  getAll: async (emergencyId) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/medical_plans`);
    return res.data;
  },
  create: async (emergencyId, plan) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/medical_plans`, plan);
    return res.data;
  },
  update: async (plan) => {
    const res = await axiosInstance.put(`/emergencies/${plan.emergency_id}/medical_plans/${plan.id}`, plan);
    return res.data;
  },
  delete: async (emergencyId, planId) => {
    await axiosInstance.delete(`/emergencies/${emergencyId}/medical_plans/${planId}`);
  },
};
