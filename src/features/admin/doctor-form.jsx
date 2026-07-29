import { Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useUsers } from "../../hooks/useApiData";
import SpecialtySelect from '../../shared/ui/specialty-select';
import axiosInstance from "../../services/axiosInstance";
import { sanitizeInput, sanitizePhone } from "../../utils/sanitize";

const DoctorFormModal = ({ open, onClose, doctor, onSaved }) => {
  const isEdit = !!doctor;
  const { data: users } = useUsers();
  const [values, setValues] = useState({
    name: doctor?.name || '',
    specialty_id: doctor?.specialty?.id || '',
    email: doctor?.email || '',
    phone: doctor?.phone || '',
    user_id: doctor?.user_id || '',
  });
  const [userOption, setUserOption] = useState(doctor?.user_id ? 'existing' : 'new');
  const [newUser, setNewUser] = useState({
    username: '',
    email: doctor?.email || '',
  });
  const [signatureFile, setSignatureFile] = useState(null);
  const [stampFile, setStampFile] = useState(null);
  const [validation, setValidation] = useState(false);

  const selectedUser = useMemo(
    () => (users || []).find((u) => u.id === values.user_id) || null,
    [users, values.user_id],
  );

  const handleChange = useCallback((target) => {
    const val = target.name === 'phone' ? sanitizePhone(target.value) : sanitizeInput(target.value);
    setValues((prev) => ({ ...prev, [target.name]: val }));
  }, []);

  const buildPayload = useCallback((base, hasFiles) => {
    const data = hasFiles ? base : { ...base };
    if (userOption === 'existing' && selectedUser) {
      data.user_id = selectedUser.id;
    }
    if (userOption === 'new') {
      data.user_attributes = {
        username: newUser.username || '',
        name: values.name,
        lastname: '',
        email: newUser.email || values.email || '',
      };
    }
    return data;
  }, [userOption, selectedUser, newUser, values]);

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
        const payload = buildPayload(fd, true);
        if (payload.user_id) fd.append('user_id', payload.user_id);
        if (payload.user_attributes) fd.append('user_attributes[username]', payload.user_attributes.username);
        if (payload.user_attributes) fd.append('user_attributes[name]', payload.user_attributes.name);
        if (payload.user_attributes) fd.append('user_attributes[lastname]', payload.user_attributes.lastname);
        if (payload.user_attributes) fd.append('user_attributes[email]', payload.user_attributes.email);
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
        const payload = buildPayload(values, false);
        if (isEdit) {
          await BackendAPI.doctors.update({ id: doctor.id, ...payload });
        } else {
          await BackendAPI.doctors.create(payload);
        }
      }
      if (onSaved) onSaved();
      onClose();
    } catch {
      alert("Error al guardar el medico");
    }
  }, [values, doctor, isEdit, onSaved, onClose, signatureFile, stampFile, buildPayload]);

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

        <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: 0.5, mb: 1, display: 'block' }}>
            USUARIO ASOCIADO
          </Typography>
          <RadioGroup row value={userOption} onChange={(e) => setUserOption(e.target.value)}>
            <FormControlLabel value="existing" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Seleccionar existente</Typography>} />
            {!isEdit && (
              <FormControlLabel value="new" control={<Radio size="small" />} label={<Typography variant="caption" sx={{ fontSize: '0.75rem' }}>Crear nuevo</Typography>} />
            )}
          </RadioGroup>
          {userOption === 'existing' ? (
            <Autocomplete
              size="small" fullWidth
              options={users || []}
              getOptionLabel={(u) => `${u.username} — ${u.name} ${u.lastname || ''} (${u.email})`}
              value={selectedUser}
              onChange={(_, newValue) => setValues((prev) => ({ ...prev, user_id: newValue?.id || '' }))}
              renderInput={(params) => (
                <TextField variant="standard" {...params} label="Seleccionar usuario" placeholder="Buscar usuario..."
                  sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }} />
              )}
            />
          ) : (
            <Box sx={{ mt: 1 }}>
              <TextField variant="standard" fullWidth label="Username" name="username" size="small"
                value={newUser.username}
                onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Auto-generado si se deja vacío"
                sx={{ mb: 1.5, '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
              />
              <TextField variant="standard" fullWidth required label="Correo Electrónico" name="email" type="email" size="small"
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
              />
              <Alert severity="info" sx={{ mt: 1, fontSize: '0.7rem' }}>
                Se creará un usuario con contraseña temporal <strong>Emerboard20-</strong>
              </Alert>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorFormModal;
