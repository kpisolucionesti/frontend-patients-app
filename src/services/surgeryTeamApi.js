import axiosInstance from './axiosInstance';

export const surgeryTeamApi = {
  create(data) {
    return axiosInstance.post('/surgery_team_members', data).then(r => r.data);
  },

  destroy(id) {
    return axiosInstance.delete(`/surgery_team_members/${id}`);
  }
};
