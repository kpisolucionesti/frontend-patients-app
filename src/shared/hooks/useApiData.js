import { useApiQuery } from './useApiQuery';
import { BackendAPI } from '../services/BackendApi';

export function useDoctors(options = {}) {
  return useApiQuery(['doctors'], () => BackendAPI.doctors.getAll(), options);
}

export function useRooms(options = {}) {
  return useApiQuery(['rooms'], () => BackendAPI.rooms.getAll(), options);
}

export function useLabParameters(options = {}) {
  return useApiQuery(['labParameters'], () => BackendAPI.labParameters.getAll(), options);
}

export function useProfiles(options = {}) {
  return useApiQuery(['profiles'], () => BackendAPI.profiles.getAll(), options);
}

export function useAreas(options = {}) {
  return useApiQuery(['areas'], () => BackendAPI.areas.getAll(), options);
}

export function useSpecialties(options = {}) {
  return useApiQuery(['specialties'], () => BackendAPI.specialties.getAll(), options);
}

export function useUsers(options = {}) {
  return useApiQuery(['users'], () => BackendAPI.users.getAll(), options);
}

export function useDashboardStats(year, options = {}) {
  return useApiQuery(['dashboard', 'stats', year], () => BackendAPI.dashboard.stats(year), {
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
