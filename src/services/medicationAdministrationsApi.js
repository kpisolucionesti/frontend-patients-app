import axiosInstance from './axiosInstance';

const getEndpoint = (id, type) => {
  if (type === 'emergency') return `/emergencies/${id}/medication_administrations`;
  return `/hospitalizations/${id}/medication_administrations`;
};

export const medicationAdministrationsApi = {
  getAll: async (id, type = 'hospitalization') => {
    const res = await axiosInstance.get(getEndpoint(id, type));
    return res.data;
  },
  create: async (id, data, type = 'hospitalization') => {
    const res = await axiosInstance.post(getEndpoint(id, type), data);
    return res.data;
  },
  update: async (id, adminId, data, type = 'hospitalization') => {
    const res = await axiosInstance.put(`${getEndpoint(id, type)}/${adminId}`, data);
    return res.data;
  },
  destroy: async (id, adminId, type = 'hospitalization') => {
    await axiosInstance.delete(`${getEndpoint(id, type)}/${adminId}`);
  },
};