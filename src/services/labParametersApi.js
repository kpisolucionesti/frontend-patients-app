import axiosInstance from './axiosInstance';

export const labParametersApi = {
  getAll: async (includeInactive = false) => {
    const params = includeInactive ? '?include_inactive=true' : '';
    const res = await axiosInstance.get(`/lab_parameters${params}`);
    return res.data;
  },
  create: async (data) => {
    const res = await axiosInstance.post('/lab_parameters', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axiosInstance.put(`/lab_parameters/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    await axiosInstance.delete(`/lab_parameters/${id}`);
  },
  restore: async (id) => {
    const res = await axiosInstance.put(`/lab_parameters/${id}/restore`);
    return res.data;
  },
  import: async (data) => {
    const res = await axiosInstance.post('/lab_parameters/import', data);
    return res.data;
  },
  getGroups: async (includeInactive = false) => {
    const params = includeInactive ? '?include_inactive=true' : '';
    const res = await axiosInstance.get(`/lab_parameter_groups${params}`);
    return res.data;
  },
  createGroup: async (data) => {
    const res = await axiosInstance.post('/lab_parameter_groups', data);
    return res.data;
  },
  updateGroup: async (id, data) => {
    const res = await axiosInstance.put(`/lab_parameter_groups/${id}`, data);
    return res.data;
  },
  deleteGroup: async (id) => {
    await axiosInstance.delete(`/lab_parameter_groups/${id}`);
  },
  restoreGroup: async (id) => {
    const res = await axiosInstance.put(`/lab_parameter_groups/${id}/restore`);
    return res.data;
  },
};
