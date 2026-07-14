import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const DoctorFormModal = ({ open, onClose, doctor, onSaved }) => {
  const isEdit = !!doctor;
  const [values, setValues] = useState({
    name: doctor?.name || '',
    speciality: doctor?.speciality || '',
  });
  const [validation, setValidation] = useState(false);

  const handleChange = useCallback((target) => {
    setValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!values.name || !values.speciality) {
      alert("FALTAN DATOS POR LLENAR");
      setValidation(true);
      return;
    }
    try {
      if (isEdit) {
        await BackendAPI.doctors.update({ id: doctor.id, ...values });
      } else {
        await BackendAPI.doctors.create(values);
      }
      if (onSaved) onSaved();
      onClose();
    } catch {
      alert("Error al guardar el medico");
    }
  }, [values, doctor, isEdit, onSaved, onClose]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'success.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isEdit ? 'EDITAR MEDICO' : 'AGREGAR MEDICO'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          fullWidth required label="Nombre" name="name" value={values.name}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.name}
          helperText={validation && !values.name ? 'Requerido' : ''}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth required label="Especialidad" name="speciality" value={values.speciality}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.speciality}
          helperText={validation && !values.speciality ? 'Requerido' : ''}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorFormModal;
