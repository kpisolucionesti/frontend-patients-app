import { useAuth } from './useAuth';

const usePermissions = () => {
  return useAuth().permissions;
};

export default usePermissions;
