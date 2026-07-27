// Salus FSD — shared/hooks barrel
export { useFetch } from '../../../hooks/useFetch';
export { useAuth, AuthProvider } from './useAuth';
export { usePermissions } from './usePermissions';
export { useSnackbar, SnackbarProvider } from './useSnackbar';
export { usePolling } from '../../../hooks/usePolling';
export { default as useApiData } from './useApiData';
export { default as useApiQuery } from './useApiQuery';
export { default as useEmergencyForm } from './useEmergencyForm';
export { default as usePatientLookup } from './usePatientLookup';
export { default as useAntecedentForm } from './useAntecedentForm';
export { default as useSessionTimeout } from '../../../hooks/useSessionTimeout';
export { default as useNotificationPoll } from './useNotificationPoll';
