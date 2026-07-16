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
};
