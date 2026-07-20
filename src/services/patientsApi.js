import axiosInstance from './axiosInstance';

export const patientsApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`/patients?${query}`);
    return res.data;
  },
  getAllPaginated: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`/patients?${query}`);
    return res.data;
  },
  create: async (patient) => {
    const res = await axiosInstance.post('/patients', patient);
    return res.data;
  },
  delete: async (id) => {
    const res = await axiosInstance.delete('/patients/' + id);
    return res.data;
  },
  update: async (patient) => {
    const res = await axiosInstance.put('/patients/' + patient.id, patient);
    return res.data;
  },
  getById: async (id) => {
    const res = await axiosInstance.get('/patients/' + id);
    return res.data;
  },
  findByCi: async (ci) => {
    try {
      const res = await axiosInstance.get('/patients/find_by_ci', { params: { ci } });
      return res.data;
    } catch (err) {
      if (err.response?.data?.error) return { _error: err.response.data.error };
      return null;
    }
  },
  getStats: async (id) => {
    const res = await axiosInstance.get(`/patients/${id}/stats`);
    return res.data;
  },

  getSurgeries: async (patientId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axiosInstance.get(`/patients/${patientId}/surgeries?${query}`);
    return res.data;
  },
};
