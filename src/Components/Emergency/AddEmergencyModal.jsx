import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material";
import { AddCircleOutlineRounded } from '@mui/icons-material';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useFetch } from "../../hooks/useFetch";
import usePatientLookup from "../../hooks/usePatientLookup";
import useEmergencyForm from "../../hooks/useEmergencyForm";
import PatientSection from "./PatientSection";
import EmergencySection from "./EmergencySection";
import EditPatientData from "../Patients/editPatientDataModal";
import { PEDIATRIC_AGE_THRESHOLD } from "../../constants";

const AddEmergencyModal = ({ onEmergencyCreated, disabled = false, open: externalOpen, onClose: externalOnClose, preloadPatient }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [roomsList, setRoomsList] = useState([]);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  const patient = usePatientLookup();
  const emergency = useEmergencyForm();
  const { data: doctors } = useFetch(() => BackendAPI.doctors.getAll(), []);

  useEffect(() => {
    if (open && roomsList.length === 0) {
      BackendAPI.rooms.getAll().then(setRoomsList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && preloadPatient) {
      patient.loadPatient(preloadPatient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preloadPatient]);

  const availableRooms = useMemo(
    () => (roomsList || []).filter((r) =>
      !r.room_type ||
      (r.room_type === 'pediatria' && patient.patientAge < PEDIATRIC_AGE_THRESHOLD) ||
      (r.room_type === 'adulto' && patient.patientAge >= PEDIATRIC_AGE_THRESHOLD)
    ),
    [roomsList, patient.patientAge],
  );

  const clearFields = useCallback(() => {
    patient.clearPatientFields();
    emergency.clearEmergencyFields();
    setRoomsList([]);
  }, [patient, emergency]);

  const handleOpen = useCallback(() => {
    BackendAPI.rooms.getAll().then(setRoomsList);
    if (!isControlled) setInternalOpen(true);
  }, [isControlled]);

  const handleClose = useCallback(() => {
    clearFields();
    if (isControlled) {
      if (externalOnClose) externalOnClose();
    } else {
      setInternalOpen(false);
    }
  }, [clearFields, isControlled, externalOnClose]);

  const handleSubmit = useCallback(async () => {
    let valid = true;

    if (!patient.patientValues.ci || !patient.patientValues.name || !patient.patientValues.birthday || !patient.patientValues.gender) {
      patient.setPatientValidation(true);
      valid = false;
    } else {
      patient.setPatientValidation(false);
    }

    if (!emergency.emergencyValues.diagnostic || !emergency.emergencyValues.treatment || !emergency.emergencyValues.current_doctor || !emergency.roomSelected?.id) {
      emergency.setEmergencyValidation(true);
      valid = false;
    } else {
      emergency.setEmergencyValidation(false);
    }

    if (!valid) {
      alert("FALTAN DATOS POR LLENAR");
      return;
    }

    try {
      let patientId;
      if (patient.locked) {
        patientId = patient.patientValues.id;
        if (!patientId) {
          const existing = await BackendAPI.patients.findByCi(patient.patientValues.ci);
          if (existing && existing._error) {
            alert(existing._error);
            return;
          }
          patientId = existing.id;
        }
      } else {
        const newPatient = await BackendAPI.patients.create(patient.patientValues);
        patientId = newPatient.id;
      }

      const doctorsPayload = emergency.emergencyValues.current_doctor ? [{ id: emergency.emergencyValues.current_doctor }] : [];

      const emergencyPayload = {
        patient_id: patientId,
        ingress_date: emergency.emergencyValues.ingress_date,
        diagnostic: emergency.emergencyValues.diagnostic,
        treatment: emergency.emergencyValues.treatment,
        observations: emergency.emergencyValues.observations,
        classification: emergency.emergencyValues.classification,
        status: 1,
        doctors: doctorsPayload,
      };

      const created = await BackendAPI.emergencies.create(emergencyPayload);
      const emergencyId = created.id;

      await BackendAPI.rooms.update({ ...emergency.roomSelected, patient_id: patientId });

      if (onEmergencyCreated) onEmergencyCreated();
      handleClose();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al crear la emergencia';
      alert(msg);
    }
  }, [patient, emergency, onEmergencyCreated, handleClose]);

  return (
    <>
      {!isControlled && (
        <Button
          color="success"
          onClick={handleOpen}
          variant="outlined"
          disabled={disabled}
          startIcon={<AddCircleOutlineRounded />}
        >
          EMERGENCIA
        </Button>
      )}

      <Dialog fullWidth maxWidth='lg' open={open} onClose={handleClose}>
        <DialogTitle textAlign="center" sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 'bold', py: 0.75, fontSize: '0.9rem' }}>
          AGREGAR EMERGENCIA
        </DialogTitle>
        <DialogContent sx={{
          bgcolor: '#f0f4ff',
          '&:first-of-type': { pt: 1.5 },
          '& .MuiInputBase-input': { fontSize: '0.75rem' },
          '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          '& .MuiFormHelperText-root': { fontSize: '0.65rem' },
          '& .MuiTypography-root': { fontSize: '0.75rem' },
          '& .MuiChip-label': { fontSize: '0.7rem' },
        }}>
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <PatientSection
                values={patient.patientValues}
                locked={patient.locked}
                validation={patient.patientValidation}
                onCiChange={patient.handleCiChange}
                onFieldChange={patient.handlePatientFieldChange}
                onBirthdayChange={patient.handleBirthdayChange}
                onEditClick={patient.handleEditClick}
              />
            </Grid>
            <Grid item xs={6}>
              <EmergencySection
                values={emergency.emergencyValues}
                validation={emergency.emergencyValidation}
                doctors={doctors}
                availableRooms={availableRooms}
                roomSelected={emergency.roomSelected}
                patientReady={patient.patientAge > 0}
                onFieldChange={emergency.handleEmergencyFieldChange}
                onRoomChange={emergency.handleRoomChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: '0.75rem 1.25rem' }}>
          <Button onClick={handleClose} variant="outlined" color="error">Cancelar</Button>
          <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
        </DialogActions>
      </Dialog>

      {patient.editPatientModalOpen && (
        <EditPatientData
          open={patient.editPatientModalOpen}
          onClose={() => patient.setEditPatientModalOpen(false)}
          patient={{
            id: patient.patientValues.id,
            ci: patient.patientValues.ci,
            name: patient.patientValues.name,
            lastname: patient.patientValues.lastname,
            birthday: patient.patientValues.birthday,
            gender: patient.patientValues.gender,
          }}
          onSaved={patient.handleEditPatientSaved}
        />
      )}
    </>
  );
};

export default AddEmergencyModal;
