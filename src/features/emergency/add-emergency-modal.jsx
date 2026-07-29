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
import EditPatientData from "../../Components/Patients/editPatientDataModal";
import { PEDIATRIC_AGE_THRESHOLD } from "../../constants";

const STEPS = ['Paciente', 'Emergencia', 'Confirmación'];

const AddEmergencyModal = ({ onEmergencyCreated, disabled = false, open: externalOpen, onClose: externalOnClose, preloadPatient }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

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
      setSaving(false);
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

  const canGoNext = useCallback(() => {
    if (activeStep === 0) {
      return !!patient.patientValues.ci && !!patient.patientValues.name && !!patient.patientValues.birthday && !!patient.patientValues.gender && !!patient.patientValues.medical_history_number;
    }
    if (activeStep === 1) {
      return !!emergency.emergencyValues.diagnostic && !!emergency.emergencyValues.treatment && !!emergency.emergencyValues.current_doctor && !!emergency.roomSelected?.id;
    }
    return true;
  }, [activeStep, patient.patientValues, emergency.emergencyValues, emergency.roomSelected]);

  const handleNext = useCallback(() => {
    if (!canGoNext()) {
      setError(activeStep === 0
        ? 'Complete todos los datos del paciente'
        : 'Complete todos los datos de la emergencia');
      return;
    }
    setError(null);
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, [activeStep, canGoNext]);

  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = useCallback(async () => {
    if (!canGoNext()) {
      setError('Complete todos los datos requeridos');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let patientId;
      if (patient.locked) {
        patientId = patient.patientValues.id;
        if (!patientId) {
          const existing = await BackendAPI.patients.findByCi(patient.patientValues.ci);
          if (existing && existing._error) {
            setError(existing._error);
            setSaving(false);
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
      await BackendAPI.rooms.update({ ...emergency.roomSelected, patient_id: patientId });

      if (onEmergencyCreated) onEmergencyCreated();
      handleClose();
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al crear la emergencia');
    } finally {
      setSaving(false);
    }
  }, [patient, emergency, onEmergencyCreated, handleClose, canGoNext]);

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

      <Dialog fullWidth maxWidth='sm' open={open} onClose={handleClose} aria-label="Nueva emergencia">
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '0.95rem' }}>
          NUEVA EMERGENCIA
        </DialogTitle>
        <DialogContent sx={{
          '& .MuiInputBase-input': { fontSize: '0.75rem' },
          '& .MuiInputLabel-root': { fontSize: '0.75rem' },
          '& .MuiFormHelperText-root': { fontSize: '0.7rem' },
          '& .MuiTypography-root': { fontSize: '0.75rem' },
          '& .MuiChip-label': { fontSize: '0.7rem' },
        }}>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }} aria-label="Progreso de creación de emergencia">
            {STEPS.map((label, idx) => (
              <Step key={label} active={idx === activeStep} completed={idx < activeStep}>
                <StepLabel aria-current={idx === activeStep ? 'step' : undefined}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)} role="alert" aria-live="assertive">
              {error}
            </Alert>
          )}

          <Box role="form" aria-label={`Paso ${activeStep + 1} de ${STEPS.length}: ${STEPS[activeStep]}`}>
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
              <Box role="status" aria-label="Resumen de la emergencia a crear">
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error" disabled={saving}>Cancelar</Button>
          {activeStep > 0 && activeStep < STEPS.length - 1 && (
            <Button onClick={handleBack} variant="outlined" disabled={saving}>Atrás</Button>
          )}
          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              Siguiente
            </Button>
          ) : (
            <Button variant="outlined" color="success" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Emergencia'}
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
