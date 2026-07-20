import axiosInstance from './axiosInstance';

export const hospitalizationsApi = {
  getById: async (id) => {
    const res = await axiosInstance.get(`/hospitalizations/${id}`);
    return res.data;
  },
  getByEmergency: async (emergencyId) => {
    const res = await axiosInstance.get(`/emergencies/${emergencyId}/hospitalization`);
    return res.data;
  },
  create: async (emergencyId, data) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/hospitalization`, data);
    return res.data;
  },
  update: async (emergencyId, data) => {
    const res = await axiosInstance.put(`/emergencies/${emergencyId}/hospitalization`, data);
    return res.data;
  },
  discharge: async (emergencyId, data) => {
    const res = await axiosInstance.post(`/emergencies/${emergencyId}/hospitalization/discharge`, data);
    return res.data;
  },
  census: async () => {
    const res = await axiosInstance.get('/hospitalizations/census');
    return res.data;
  },
  historical: async (params = {}) => {
    const res = await axiosInstance.get('/hospitalizations/historical', { params });
    return res.data;
  },
};
