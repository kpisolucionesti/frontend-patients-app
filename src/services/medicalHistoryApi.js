import api from './axiosInstance';

export const medicalHistoryApi = {
  getForEmergency: async (emergencyId) => {
    const { data } = await api.get(`/emergencies/${emergencyId}/medical_history`);
    return data;
  },

  getForHospitalization: async (hospitalizationId) => {
    const { data } = await api.get(`/hospitalizations/${hospitalizationId}/medical_history`);
    return data;
  },
};
