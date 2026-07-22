import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stepper, Step, StepLabel, Alert,
} from "@mui/material";
import { AddCircleOutlineRounded } from '@mui/icons-material';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useDoctors, useRooms } from "../../hooks/useApiData";
import usePatientLookup from "../../hooks/usePatientLookup";
import useEmergencyForm from "../../hooks/useEmergencyForm";
import PatientSection from "./PatientSection";
import EmergencySection from "./EmergencySection";
import EditPatientData from "../Patients/editPatientDataModal";
import { PEDIATRIC_AGE_THRESHOLD } from "../../constants";

const STEPS = ['Paciente', 'Emergencia', 'Confirmación'];

const AddEmergencyModal = ({ onEmergencyCreated, disabled = false, open: externalOpen, onClose: externalOnClose, preloadPatient }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;

  const patient = usePatientLookup();
  const emergency = useEmergencyForm();
  const { data: doctors } = useDoctors();
  const { data: roomsList } = useRooms({ enabled: open });

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && preloadPatient) {
      patient.loadPatient(preloadPatient);
    }
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
  }, [patient, emergency]);

  const handleOpen = useCallback(() => {
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

  const canGoNext = () => {
    if (activeStep === 0) {
      return !!patient.patientValues.ci && !!patient.patientValues.name && !!patient.patientValues.birthday && !!patient.patientValues.gender && !!patient.patientValues.medical_history_number;
    }
    if (activeStep === 1) {
      return !!emergency.emergencyValues.diagnostic && !!emergency.emergencyValues.treatment && !!emergency.emergencyValues.current_doctor && !!emergency.roomSelected?.id;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      patient.setPatientValidation(!canGoNext());
      if (!canGoNext()) return;
    }
    if (activeStep === 1) {
      emergency.setEmergencyValidation(!canGoNext());
      if (!canGoNext()) return;
    }
    setError(null);
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = useCallback(async () => {
    patient.setPatientValidation(!patient.patientValues.ci || !patient.patientValues.name || !patient.patientValues.birthday || !patient.patientValues.gender || !patient.patientValues.medical_history_number);
    emergency.setEmergencyValidation(!emergency.emergencyValues.diagnostic || !emergency.emergencyValues.treatment || !emergency.emergencyValues.current_doctor || !emergency.roomSelected?.id);

    if (!patient.patientValues.ci || !patient.patientValues.name || !patient.patientValues.birthday || !patient.patientValues.gender || !patient.patientValues.medical_history_number) {
      setError("Complete todos los datos del paciente");
      return;
    }
    if (!emergency.emergencyValues.diagnostic || !emergency.emergencyValues.treatment || !emergency.emergencyValues.current_doctor || !emergency.roomSelected?.id) {
      setError("Complete todos los datos de la emergencia");
      return;
    }

    setError(null);
    try {
      let patientId;
      if (patient.locked) {
        patientId = patient.patientValues.id;
        if (!patientId) {
          const existing = await BackendAPI.patients.findByCi(patient.patientValues.ci);
          if (existing && existing._error) {
            setError(existing._error);
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
      setError(err?.response?.data?.error || 'Error al crear la emergencia');
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

      <Dialog fullWidth maxWidth='sm' open={open} onClose={handleClose}>
        <DialogTitle textAlign="center" sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 'bold', py: 0.75, fontSize: '0.9rem' }}>
          NUEVA EMERGENCIA
        </DialogTitle>
        <DialogContent sx={{
          pt: 3,
          '& .MuiInputBase-input': { fontSize: '0.75rem' },
          '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          '& .MuiFormHelperText-root': { fontSize: '0.65rem' },
          '& .MuiTypography-root': { fontSize: '0.75rem' },
          '& .MuiChip-label': { fontSize: '0.7rem' },
        }}>
          <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 3 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

          {activeStep === 0 && (
            <PatientSection
              values={patient.patientValues}
              locked={patient.locked}
              validation={patient.patientValidation}
              onCiChange={patient.handleCiChange}
              onFieldChange={patient.handlePatientFieldChange}
              onBirthdayChange={patient.handleBirthdayChange}
              onEditClick={patient.handleEditClick}
            />
          )}

          {activeStep === 1 && (
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
          )}

          {activeStep === 2 && (
            <Box>
              <Alert severity="info">
                <strong>Paciente:</strong> {patient.patientValues.name} {patient.patientValues.lastname} — CI: {patient.patientValues.ci}
                <br />
                <strong>Diagnóstico:</strong> {emergency.emergencyValues.diagnostic}
                <br />
                <strong>Clasificación:</strong> {emergency.emergencyValues.classification}
                <br />
                <strong>Médico:</strong> {(doctors || []).find((d) => d.id === emergency.emergencyValues.current_doctor)?.name || ''}
                <br />
                <strong>Ubicación:</strong> {emergency.roomSelected?.name || 'Sin asignar'}
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: '0.75rem 1.25rem' }}>
          <Button onClick={handleClose} variant="outlined" color="error">Cancelar</Button>
          {activeStep > 0 && activeStep < STEPS.length - 1 && (
            <Button onClick={handleBack} variant="outlined">Atrás</Button>
          )}
          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext} disabled={!canGoNext()}>
              Siguiente
            </Button>
          ) : (
            <Button variant="outlined" color="success" onClick={handleSubmit}>
              Guardar Emergencia
            </Button>
          )}
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
            medical_history_number: patient.patientValues.medical_history_number,
          }}
          onSaved={patient.handleEditPatientSaved}
        />
      )}
    </>
  );
};

export default AddEmergencyModal;
