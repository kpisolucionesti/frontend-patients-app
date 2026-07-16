import { useCallback, useState } from "react";
import moment from 'moment';

const useEmergencyForm = () => {
  const [emergencyValues, setEmergencyValues] = useState({ ingress_date: moment().format("YYYY-MM-DD") });
  const [roomSelected, setRoomSelected] = useState(null);
  const [emergencyValidation, setEmergencyValidation] = useState(false);

  const handleEmergencyFieldChange = useCallback((target) => {
    setEmergencyValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleIngressDateChange = useCallback((date) => {
    setEmergencyValues((prev) => ({ ...prev, ingress_date: date ? moment(date).format('YYYY-MM-DD') : '' }));
  }, []);

  const handleRoomChange = useCallback((room) => {
    setRoomSelected(room);
  }, []);

  const clearEmergencyFields = useCallback(() => {
    setEmergencyValues({ ingress_date: moment().format("YYYY-MM-DD") });
    setRoomSelected(null);
    setEmergencyValidation(false);
  }, []);

  return {
    emergencyValues,
    roomSelected,
    emergencyValidation,
    handleEmergencyFieldChange,
    handleIngressDateChange,
    handleRoomChange,
    setEmergencyValidation,
    clearEmergencyFields,
  };
};

export default useEmergencyForm;
