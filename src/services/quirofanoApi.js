import axiosInstance from './axiosInstance';

export const quirofanoApi = {
  getSchedule(date) {
    return axiosInstance.get('/quirofanos/schedule', {
      params: { date }
    }).then(r => r.data);
  },

  getWeekly(startDate, endDate) {
    return axiosInstance.get('/quirofanos/weekly', {
      params: { start_date: startDate, end_date: endDate }
    }).then(r => r.data);
  },

  list() {
    return axiosInstance.get('/quirofanos/surgeries').then(r => r.data);
  },

  getById(id) {
    return axiosInstance.get(`/quirofanos/surgeries/${id}`).then(r => r.data);
  },

  create(data) {
    return axiosInstance.post('/quirofanos/surgeries', data).then(r => r.data);
  },

  update(id, data) {
    return axiosInstance.put(`/quirofanos/surgeries/${id}`, data).then(r => r.data);
  },

  destroy(id) {
    return axiosInstance.delete(`/quirofanos/surgeries/${id}`);
  },

  closeSurgery(id) {
    return axiosInstance.put(`/quirofanos/surgeries/${id}/close`).then(r => r.data);
  },

  cancelSurgery(id, reason) {
    return axiosInstance.put(`/quirofanos/surgeries/${id}/cancel`, { cancellation_reason: reason }).then(r => r.data);
  }
};
