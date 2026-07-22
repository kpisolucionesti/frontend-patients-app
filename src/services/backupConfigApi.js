import axiosInstance from './axiosInstance';

export const backupConfigApi = {
  show: async () => {
    const res = await axiosInstance.get('/backup_configurations');
    return res.data;
  },
  update: async (data) => {
    const res = await axiosInstance.put('/backup_configurations', data);
    return res.data;
  },
  runNow: async () => {
    const res = await axiosInstance.post('/backup_configurations/run_now');
    return res.data;
  },
};
