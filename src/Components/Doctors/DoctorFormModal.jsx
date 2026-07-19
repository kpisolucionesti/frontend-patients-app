import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import SpecialtySelect from "../Commons/SpecialtySelect";

const DoctorFormModal = ({ open, onClose, doctor, onSaved }) => {
  const isEdit = !!doctor;
  const [values, setValues] = useState({
    name: doctor?.name || '',
    specialty_id: doctor?.specialty?.id || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
  });
  const [validation, setValidation] = useState(false);

  const handleChange = useCallback((target) => {
    setValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!values.name || !values.specialty_id) {
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
          variant="standard"
          fullWidth required label="Nombre" name="name" value={values.name}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.name}
          helperText={validation && !values.name ? 'Requerido' : ''}
          sx={{ mb: 2 }}
        />
        <SpecialtySelect
          value={values.specialty_id}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.specialty_id}
          required
        />
        <TextField
          variant="standard"
          fullWidth label="Correo Electrónico" name="email" type="email" value={values.email}
          onChange={({ target }) => handleChange(target)}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="standard"
          fullWidth label="Teléfono" name="phone" type="tel" value={values.phone}
          onChange={({ target }) => handleChange(target)}
          placeholder="+58 412 1234567"
          helperText="Incluir código de país"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorFormModal;
