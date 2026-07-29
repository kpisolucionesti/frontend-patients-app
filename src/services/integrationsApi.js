import axiosInstance from './axiosInstance';

const makeCrud = (basePath) => ({
  list: async (params = {}) => {
    const res = await axiosInstance.get(basePath, { params });
    return res.data;
  },
  get: async (id) => {
    const res = await axiosInstance.get(`${basePath}/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await axiosInstance.post(basePath, data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axiosInstance.put(`${basePath}/${id}`, data);
    return res.data;
  },
  remove: async (id) => {
    await axiosInstance.delete(`${basePath}/${id}`);
  },
});

export const integrationsApi = {
  emailTemplates: {
    ...makeCrud('/email_templates'),
    preview: async (id, variables = {}) => {
      const res = await axiosInstance.post(`/email_templates/${id}/preview`, { variables });
      return res.data;
    },
  },
  apiKeys: {
    ...makeCrud('/api_keys'),
    regenerate: async (id) => {
      const res = await axiosInstance.post(`/api_keys/${id}/regenerate`);
      return res.data;
    },
  },
  webhooks: {
    ...makeCrud('/webhooks'),
    test: async (id) => {
      const res = await axiosInstance.post(`/webhooks/${id}/test`);
      return res.data;
    },
    deliveries: async (webhookId) => {
      const res = await axiosInstance.get(`/webhooks/${webhookId}/deliveries`);
      return res.data;
    },
  },
};
