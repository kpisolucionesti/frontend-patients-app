import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import { AddCircleOutlineRounded } from '@mui/icons-material';
import React, { useCallback, useMemo, useRef, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useFetch } from "../../hooks/useFetch";
import PatientSection from "./PatientSection";
import EmergencySection from "./EmergencySection";
import EditPatientData from "../Patients/editPatientDataModal";
import moment from 'moment';

const calculateAge = (birthday) => {
  if (!birthday) return 0;
  return moment().diff(moment(birthday, 'YYYY-MM-DD'), 'years');
};

const AddEmergencyModal = ({ onEmergencyCreated }) => {
  const [open, setOpen] = useState(false);
  const [patientValues, setPatientValues] = useState({});
  const [locked, setLocked] = useState(false);
  const [patientAge, setPatientAge] = useState(0);
  const [patientValidation, setPatientValidation] = useState(false);
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);

  const [emergencyValues, setEmergencyValues] = useState({ ingress_date: moment().format("DD/M/YYYY") });
  const [roomSelected, setRoomSelected] = useState(null);
  const [emergencyValidation, setEmergencyValidation] = useState(false);
  const [roomsList, setRoomsList] = useState([]);

  const ciTimer = useRef(null);

  const { data: doctors } = useFetch(() => BackendAPI.doctors.getAll(), []);

  const availableRooms = useMemo(
    () => roomsList.filter((r) => {
      const age = patientAge;
      return (age < 12 ? r.room_type === 'pediatria' : r.room_type === 'adulto') && !r.patient_id;
    }),
    [roomsList, patientAge],
  );

  const clearFields = useCallback(() => {
    setPatientValues({});
    setLocked(false);
    setPatientAge(0);
    setPatientValidation(false);
    setEmergencyValues({ ingress_date: moment().format("DD/M/YYYY") });
    setRoomSelected(null);
    setEmergencyValidation(false);
    setRoomsList([]);
  }, []);

  const handleOpen = useCallback(() => {
    BackendAPI.rooms.getAll().then(setRoomsList);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    clearFields();
    setOpen(false);
  }, [clearFields]);

  const handlePatientFieldChange = useCallback((target) => {
    setPatientValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleBirthdayChange = useCallback((date) => {
    const bday = date ? moment(date).format('YYYY-MM-DD') : '';
    setPatientValues((prev) => ({ ...prev, birthday: bday }));
    setPatientAge(calculateAge(bday));
  }, []);

  const handleCiChange = useCallback(({ target }) => {
    const ci = target.value;
    setPatientValues({ ci });
    setLocked(false);
    setPatientAge(0);
    setPatientValidation(false);
    if (ciTimer.current) clearTimeout(ciTimer.current);
    if (ci.length < 4) return;
    ciTimer.current = setTimeout(async () => {
      const found = await BackendAPI.patients.findByCi(ci);
      if (found) {
        setPatientValues({
          ci: found.ci,
          name: found.name || '',
          lastname: found.lastname || '',
          birthday: found.birthday || '',
          gender: found.gender || '',
        });
        setPatientAge(found.age || calculateAge(found.birthday));
        setLocked(true);
      }
    }, 500);
  }, []);

  const handleEditClick = useCallback(() => {
    setEditPatientModalOpen(true);
  }, []);

  const handleEditPatientSaved = useCallback(() => {
    const ci = patientValues.ci;
    BackendAPI.patients.findByCi(ci).then((found) => {
      if (found) {
        setPatientValues({
          ci: found.ci,
          name: found.name || '',
          lastname: found.lastname || '',
          birthday: found.birthday || '',
          gender: found.gender || '',
        });
        setPatientAge(found.age || calculateAge(found.birthday));
      }
    });
  }, [patientValues.ci]);

  const handleEmergencyFieldChange = useCallback((target) => {
    setEmergencyValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleIngressDateChange = useCallback((date) => {
    setEmergencyValues((prev) => ({ ...prev, ingress_date: date ? moment(date).format('DD/M/YYYY') : '' }));
  }, []);

  const handleRoomChange = useCallback((room) => {
    setRoomSelected(room);
  }, []);

  const handleSubmit = useCallback(async () => {
    let valid = true;

    if (!patientValues.ci || !patientValues.name || !patientValues.birthday || !patientValues.gender) {
      setPatientValidation(true);
      valid = false;
    } else {
      setPatientValidation(false);
    }

    if (!emergencyValues.diagnostic || !emergencyValues.treatment || !emergencyValues.current_doctor || !roomSelected?.id) {
      setEmergencyValidation(true);
      valid = false;
    } else {
      setEmergencyValidation(false);
    }

    if (!valid) {
      alert("FALTAN DATOS POR LLENAR");
      return;
    }

    try {
      let patientId;
      if (locked) {
        patientId = patientValues.id;
        if (!patientId) {
          const existing = await BackendAPI.patients.findByCi(patientValues.ci);
          patientId = existing.id;
        }
      } else {
        const newPatient = await BackendAPI.patients.create(patientValues);
        patientId = newPatient.id;
      }

      const primaryDoctor = (doctors || []).find((d) => d.name === emergencyValues.current_doctor);
      const doctorsPayload = primaryDoctor ? [{ id: primaryDoctor.id }] : [];

      const emergency = {
        patient_id: patientId,
        ingress_date: emergencyValues.ingress_date,
        diagnostic: emergencyValues.diagnostic,
        treatment: emergencyValues.treatment,
        observations: '',
        status: 1,
        doctors: doctorsPayload,
      };

      await BackendAPI.emergencies.create(emergency);
      await BackendAPI.rooms.update({ ...roomSelected, patient_id: patientId });

      if (onEmergencyCreated) onEmergencyCreated();
      clearFields();
      setOpen(false);
    } catch {
      alert("Error al crear la emergencia");
    }
  }, [patientValues, locked, emergencyValues, doctors, roomSelected, onEmergencyCreated, clearFields]);

  return (
    <>
      <Button
        color="success"
        onClick={handleOpen}
        variant="contained"
        startIcon={<AddCircleOutlineRounded />}
      >
        EMERGENCIA
      </Button>

      <Dialog fullWidth maxWidth='md' open={open} onClose={handleClose}>
        <DialogTitle textAlign="center" sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 'bold', py: 0.75, fontSize: '0.9rem' }}>
          AGREGAR EMERGENCIA
        </DialogTitle>
        <DialogContent sx={{
          overflow: 'hidden',
          '&:first-of-type': { pt: 1.5 },
          '& .MuiInputBase-input': { fontSize: '0.75rem' },
          '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          '& .MuiFormHelperText-root': { fontSize: '0.65rem' },
          '& .MuiTypography-root': { fontSize: '0.75rem' },
          '& .MuiChip-label': { fontSize: '0.7rem' },
        }}>
          <Stack spacing={2}>
            <PatientSection
              values={patientValues}
              locked={locked}
              validation={patientValidation}
              onCiChange={handleCiChange}
              onFieldChange={handlePatientFieldChange}
              onBirthdayChange={handleBirthdayChange}
              onEditClick={handleEditClick}
            />
            <EmergencySection
              values={emergencyValues}
              validation={emergencyValidation}
              doctors={doctors}
              availableRooms={availableRooms}
              roomSelected={roomSelected}
              onFieldChange={handleEmergencyFieldChange}
              onIngressDateChange={handleIngressDateChange}
              onRoomChange={handleRoomChange}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: '0.75rem 1.25rem' }}>
          <Button onClick={handleClose} variant="contained" color="error">Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="success">Guardar</Button>
        </DialogActions>
      </Dialog>

      {editPatientModalOpen && (
        <EditPatientData
          open={editPatientModalOpen}
          onClose={() => setEditPatientModalOpen(false)}
          patient={{
            id: patientValues.id,
            ci: patientValues.ci,
            name: patientValues.name,
            lastname: patientValues.lastname,
            birthday: patientValues.birthday,
            gender: patientValues.gender,
          }}
          onSaved={handleEditPatientSaved}
        />
      )}
    </>
  );
};

export default AddEmergencyModal;
