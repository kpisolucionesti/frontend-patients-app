import {
  allergiesApi,
  antecedentsApi,
  appointmentsApi,
  clinicalStudyClassificationApi,
  doctorsApi,
  documentsApi,
  emergenciesApi,
  evaluationsApi,
  hospitalizationsApi,
  interconsultationsApi,
  labParametersApi,
  laboratoryResultsApi,
  medicalPlansApi,
  notesApi,
  notificationsApi,
  paraclinicalStudiesApi,
  patientsApi,
  permissionsApi,
  profilesApi,
  recipesApi,
  roomsApi,
  specialtiesApi,
  surgeriesApi,
  tvScreensApi,
  usersApi,
  vitalSignsApi,
} from '../entities/index';

import { authApi } from './authApi';
import { areasApi } from './areasApi';
import { emailSettingsApi } from './emailSettingsApi';
import { familyAntecedentsApi } from './familyAntecedentsApi';
import { gynecologicalHistoriesApi } from './gynecologicalHistoriesApi';
import { lifestyleHabitsApi } from './lifestyleHabitsApi';
import { dashboardApi } from './dashboardApi';
import { userActivityLogsApi } from './userActivityLogsApi';
import { physicalExamsApi } from './physicalExamsApi';
import { hospitalizationNotesApi } from './hospitalizationNotesApi';
import { fluidBalancesApi } from './fluidBalancesApi';
import { medicationAdministrationsApi } from './medicationAdministrationsApi';
import { directAdmissionsApi } from './directAdmissionsApi';
import { doctorSchedulesApi } from './doctorSchedulesApi';
import { appointmentRecordsApi } from './appointmentRecordsApi';
import { appointmentDisplaysApi } from './appointmentDisplaysApi';
import { quirofanoApi } from './quirofanoApi';
import { surgeryTeamApi } from './surgeryTeamApi';


export const BackendAPI = {
  auth: authApi,
  patients: patientsApi,
  doctors: doctorsApi,
  emergencies: emergenciesApi,
  areas: areasApi,
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
  familyAntecedents: familyAntecedentsApi,
  gynecologicalHistories: gynecologicalHistoriesApi,
  lifestyleHabits: lifestyleHabitsApi,
  interconsultations: interconsultationsApi,
  dashboard: dashboardApi,
  userActivityLogs: userActivityLogsApi,
  paraclinicalStudies: paraclinicalStudiesApi,
  physicalExams: physicalExamsApi,
  laboratoryResults: laboratoryResultsApi,
  clinicalStudyClassifications: clinicalStudyClassificationApi,
  labParameters: labParametersApi,
  hospitalizations: hospitalizationsApi,
  hospitalizationNotes: hospitalizationNotesApi,
  fluidBalances: fluidBalancesApi,
  medicationAdministrations: medicationAdministrationsApi,
  surgeries: surgeriesApi,
  directAdmissions: directAdmissionsApi,
  specialties: specialtiesApi,
  doctorSchedules: doctorSchedulesApi,
  appointments: appointmentsApi,
  appointmentRecords: appointmentRecordsApi,
  appointmentDisplays: appointmentDisplaysApi,
  documents: documentsApi,
  evaluations: evaluationsApi,
  recipes: recipesApi,
  quirofano: quirofanoApi,
  surgeryTeam: surgeryTeamApi,
  notifications: notificationsApi,
};
