import { useCallback, useRef, useState } from "react";
import { BackendAPI } from "../services/BackendApi";
import moment from 'moment';
import { sanitizeInput } from "../utils/sanitize";

const calculateAge = (birthday) => {
  if (!birthday) return 0;
  return moment().diff(moment(birthday, 'YYYY-MM-DD'), 'years');
};

const usePatientLookup = () => {
  const [patientValues, setPatientValues] = useState({});
  const [locked, setLocked] = useState(false);
  const [patientAge, setPatientAge] = useState(0);
  const [patientValidation, setPatientValidation] = useState(false);
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);
  const ciTimer = useRef(null);

  const handleCiChange = useCallback(({ target }) => {
    const ci = target.value.replace(/\D/g, '');
    setPatientValues((prev) => ({ ...prev, ci }));
    setLocked(false);
    setPatientAge(0);
    setPatientValidation(false);
    if (ciTimer.current) clearTimeout(ciTimer.current);
    if (ci.length < 4) return;
    ciTimer.current = setTimeout(async () => {
      const found = await BackendAPI.patients.findByCi(ci);
      if (found && found._error) {
        alert(found._error);
        return;
      }
      if (found) {
        setPatientValues({
          id: found.id,
          ci: found.ci,
          name: found.name || '',
          lastname: found.lastname || '',
          birthday: found.birthday || '',
          gender: found.gender || '',
          medical_history_number: found.medical_history_number || '',
        });
        setPatientAge(found.age || calculateAge(found.birthday));
        setLocked(true);
      }
    }, 500);
  }, []);

  const handleBirthdayChange = useCallback((date) => {
    const bday = date ? moment(date).format('YYYY-MM-DD') : '';
    setPatientValues((prev) => ({ ...prev, birthday: bday }));
    setPatientAge(calculateAge(bday));
  }, []);

  const handlePatientFieldChange = useCallback((target) => {
    const val = sanitizeInput(target.value, { maxLength: 255 });
    setPatientValues((prev) => ({ ...prev, [target.name]: val }));
  }, []);

  const handleEditClick = useCallback(() => {
    setEditPatientModalOpen(true);
  }, []);

  const handleEditPatientSaved = useCallback(() => {
    const ci = patientValues.ci;
    BackendAPI.patients.findByCi(ci).then((found) => {
      if (found) {
        setPatientValues({
          id: found.id,
          ci: found.ci,
          name: found.name || '',
          lastname: found.lastname || '',
          birthday: found.birthday || '',
          gender: found.gender || '',
          medical_history_number: found.medical_history_number || '',
        });
        setPatientAge(found.age || calculateAge(found.birthday));
      }
    });
  }, [patientValues.ci]);

  const loadPatient = useCallback((patient) => {
    if (!patient) return;
    setPatientValues({
      id: patient.id,
      ci: patient.ci || '',
      name: patient.name || '',
      lastname: patient.lastname || '',
      birthday: patient.birthday || '',
      gender: patient.gender || '',
      medical_history_number: patient.medical_history_number || '',
    });
    setPatientAge(patient.age || calculateAge(patient.birthday));
    setLocked(true);
    setPatientValidation(false);
  }, []);

  const clearPatientFields = useCallback(() => {
    setPatientValues({});
    setLocked(false);
    setPatientAge(0);
    setPatientValidation(false);
    setEditPatientModalOpen(false);
  }, []);

  return {
    patientValues,
    locked,
    patientAge,
    patientValidation,
    editPatientModalOpen,
    ciTimer,
    handleCiChange,
    handleBirthdayChange,
    handlePatientFieldChange,
    handleEditClick,
    handleEditPatientSaved,
    loadPatient,
    setEditPatientModalOpen,
    setPatientValidation,
    clearPatientFields,
  };
};

export default usePatientLookup;
