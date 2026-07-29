import axiosInstance from './axiosInstance';

export const birthRecordsApi = {
  create: async ({ motherPatientId, motherEmergencyId, birthDate, gestationalAgeWeeks, doctorId, babies }) => {
    const res = await axiosInstance.post('/birth_records', {
      mother_patient_id: motherPatientId,
      mother_emergency_id: motherEmergencyId,
      birth_date: birthDate,
      gestational_age_weeks: gestationalAgeWeeks,
      doctor_id: doctorId,
      babies,
    });
    return res.data;
  },
};
