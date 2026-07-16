import { useMemo } from "react";

const STORAGE_KEY = 'user_permissions';

const usePermissions = () => {
  return useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }, []);
};

export default usePermissions;
