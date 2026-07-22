import { authApi } from './authApi';
import { patientsApi } from './patientsApi';
import { doctorsApi } from './doctorsApi';
import { emergenciesApi } from './emergenciesApi';
import { areasApi } from './areasApi';
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
import { familyAntecedentsApi } from './familyAntecedentsApi';
import { gynecologicalHistoriesApi } from './gynecologicalHistoriesApi';
import { lifestyleHabitsApi } from './lifestyleHabitsApi';
import { interconsultationsApi } from './interconsultationsApi';
import { dashboardApi } from './dashboardApi';
import { userActivityLogsApi } from './userActivityLogsApi';
import { paraclinicalStudiesApi } from './paraclinicalStudiesApi';
import { physicalExamsApi } from './physicalExamsApi';
import { laboratoryResultsApi } from './laboratoryResultsApi';
import { labParametersApi } from './labParametersApi';
import { hospitalizationsApi } from './hospitalizationsApi';
import { hospitalizationNotesApi } from './hospitalizationNotesApi';
import { fluidBalancesApi } from './fluidBalancesApi';
import { medicationAdministrationsApi } from './medicationAdministrationsApi';
import { surgeriesApi } from './surgeriesApi';
import { directAdmissionsApi } from './directAdmissionsApi';
import { specialtiesApi } from './specialtiesApi';
import { doctorSchedulesApi } from './doctorSchedulesApi';
import { appointmentsApi } from './appointmentsApi';
import { appointmentRecordsApi } from './appointmentRecordsApi';
import { appointmentDisplaysApi } from './appointmentDisplaysApi';
import { documentsApi } from './documentsApi';
import { quirofanoApi } from './quirofanoApi';
import { surgeryTeamApi } from './surgeryTeamApi';
import { notificationsApi } from './notificationsApi';

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
  quirofano: quirofanoApi,
  surgeryTeam: surgeryTeamApi,
  notifications: notificationsApi,
};
