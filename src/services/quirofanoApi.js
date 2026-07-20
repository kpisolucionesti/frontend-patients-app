import axiosInstance from './axiosInstance';

export const quirofanoApi = {
  getSchedule(date) {
    return axiosInstance.get('/quirofanos/schedule', {
      params: { date }
    }).then(r => r.data);
  },

  getWeekly(startDate) {
    return axiosInstance.get('/quirofanos/weekly', {
      params: { start_date: startDate }
    }).then(r => r.data);
  },

  list() {
    return axiosInstance.get('/quirofanos/surgeries').then(r => r.data);
  },

  create(data) {
    return axiosInstance.post('/quirofanos/surgeries', data).then(r => r.data);
  },

  update(id, data) {
    return axiosInstance.put(`/quirofanos/surgeries/${id}`, data).then(r => r.data);
  },

  destroy(id) {
    return axiosInstance.delete(`/quirofanos/surgeries/${id}`);
  }
};
