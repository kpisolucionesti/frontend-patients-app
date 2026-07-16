import { authApi } from './authApi';
import { patientsApi } from './patientsApi';
import { doctorsApi } from './doctorsApi';
import { emergenciesApi } from './emergenciesApi';
import { roomsApi } from './roomsApi';
import { notesApi } from './notesApi';
import { usersApi } from './usersApi';
import { profilesApi } from './profilesApi';
import { permissionsApi } from './permissionsApi';
import { emailSettingsApi } from './emailSettingsApi';
import { medicalPlansApi } from './medicalPlansApi';
import { tvScreensApi } from './tvScreensApi';
import { vitalSignsApi } from './vitalSignsApi';
import { allergiesApi } from './allergiesApi';
import { antecedentsApi } from './antecedentsApi';
import { interconsultationsApi } from './interconsultationsApi';
import { dashboardApi } from './dashboardApi';
import { userActivityLogsApi } from './userActivityLogsApi';

export const BackendAPI = {
  auth: authApi,
  patients: patientsApi,
  doctors: doctorsApi,
  emergencies: emergenciesApi,
  rooms: roomsApi,
  notes: notesApi,
  users: usersApi,
  profiles: profilesApi,
  permissions: permissionsApi,
  emailSettings: emailSettingsApi,
  medicalPlans: medicalPlansApi,
  tvScreens: tvScreensApi,
  vitalSigns: vitalSignsApi,
  allergies: allergiesApi,
  antecedents: antecedentsApi,
  interconsultations: interconsultationsApi,
  dashboard: dashboardApi,
  userActivityLogs: userActivityLogsApi,
};
