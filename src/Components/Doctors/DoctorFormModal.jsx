import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import SpecialtySelect from "../Commons/SpecialtySelect";
import axiosInstance from "../../services/axiosInstance";
import { sanitizeInput, sanitizePhone } from "../../utils/sanitize";

const DoctorFormModal = ({ open, onClose, doctor, onSaved }) => {
  const isEdit = !!doctor;
  const [values, setValues] = useState({
    name: doctor?.name || '',
    specialty_id: doctor?.specialty?.id || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
  });
  const [signatureFile, setSignatureFile] = useState(null);
  const [stampFile, setStampFile] = useState(null);
  const [validation, setValidation] = useState(false);

  const handleChange = useCallback((target) => {
    const val = target.name === 'phone' ? sanitizePhone(target.value) : sanitizeInput(target.value);
    setValues((prev) => ({ ...prev, [target.name]: val }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!values.name || !values.specialty_id) {
      alert("FALTAN DATOS POR LLENAR");
      setValidation(true);
      return;
    }
    try {
      const hasFiles = signatureFile || stampFile;
      if (hasFiles) {
        const fd = new FormData();
        fd.append('name', values.name);
        fd.append('specialty_id', values.specialty_id);
        if (values.email) fd.append('email', values.email);
        if (values.phone) fd.append('phone', values.phone);
        if (signatureFile) fd.append('signature', signatureFile);
        if (stampFile) fd.append('stamp', stampFile);
        if (isEdit) {
          await axiosInstance.put(`/doctors/${doctor.id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await axiosInstance.post('/doctors', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      } else {
        if (isEdit) {
          await BackendAPI.doctors.update({ id: doctor.id, ...values });
        } else {
          await BackendAPI.doctors.create(values);
        }
      }
      if (onSaved) onSaved();
      onClose();
    } catch {
      alert("Error al guardar el medico");
    }
  }, [values, doctor, isEdit, onSaved, onClose, signatureFile, stampFile]);

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
        <Box sx={{ mt: 2 }}>
          <label style={{ fontSize: '0.8rem', color: 'text.secondary' }}>Firma Digital (imagen)</label>
          <input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files[0])} style={{ width: '100%', fontSize: '0.8rem' }} />
        </Box>
        {doctor?.has_signature && (
          <img src={doctor.signature_url} alt="Firma" style={{ maxWidth: 150, maxHeight: 50, display: 'block', marginTop: 4 }} />
        )}
        <Box sx={{ mt: 2 }}>
          <label style={{ fontSize: '0.8rem', color: 'text.secondary' }}>Sello Digital (imagen)</label>
          <input type="file" accept="image/*" onChange={(e) => setStampFile(e.target.files[0])} style={{ width: '100%', fontSize: '0.8rem' }} />
        </Box>
        {doctor?.has_stamp && (
          <img src={doctor.stamp_url} alt="Sello" style={{ maxWidth: 150, maxHeight: 50, display: 'block', marginTop: 4 }} />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorFormModal;
