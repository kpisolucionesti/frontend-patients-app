import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import React, { useCallback, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";

const PWD_RULES = [
  { key: 'minLen', label: '8+ caracteres', test: (v) => v.length >= 8 },
  { key: 'upper', label: 'Mayúscula', test: (v) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'Minúscula', test: (v) => /[a-z]/.test(v) },
  { key: 'num', label: 'Número', test: (v) => /\d/.test(v) },
  { key: 'special', label: 'Especial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const UserPasswordModal = ({ open, onClose, user }) => {
  const [values, setValues] = useState({
    password: '',
    password_confirmation: '',
  });
  const [validation, setValidation] = useState(false);

  const pwdChecks = PWD_RULES.map((r) => ({ ...r, met: r.test(values.password || '') }));
  const allPwdMet = pwdChecks.every((c) => c.met);
  const passwordsMatch = values.password === values.password_confirmation;

  const handleChange = useCallback((target) => {
    setValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!values.password || !values.password_confirmation) {
      alert("FALTAN DATOS POR LLENAR");
      setValidation(true);
      return;
    }
    if (!allPwdMet) {
      alert("La nueva contraseña no cumple con los requisitos mínimos");
      return;
    }
    if (!passwordsMatch) {
      alert("LAS CONTRASENAS NO COINCIDEN");
      return;
    }
    try {
      await BackendAPI.users.changePassword(user.id, values);
      alert("Contrasena actualizada exitosamente");
      onClose();
    } catch {
      alert("Error al actualizar la contrasena");
    }
  }, [values, user, onClose, allPwdMet, passwordsMatch]);

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'warning.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        CAMBIAR CONTRASENA - {user.name}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          variant="standard"
          fullWidth required label="Nueva Contrasena" name="password" type="password" value={values.password}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.password || !!values.password && !allPwdMet}
          helperText={validation && !values.password ? 'Requerido' : ''}
          sx={{ mb: 1 }}
        />
        {values.password && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
            {pwdChecks.map((rule) => (
              <Typography key={rule.key} variant="caption" sx={{ color: rule.met ? '#2e7d32' : '#9e9e9e', fontWeight: rule.met ? 600 : 400 }}>
                {rule.met ? '✓' : '✗'} {rule.label}
              </Typography>
            ))}
          </Box>
        )}
        <TextField
          variant="standard"
          fullWidth required label="Confirmar Contrasena" name="password_confirmation" type="password" value={values.password_confirmation}
          onChange={({ target }) => handleChange(target)}
          error={validation && !values.password_confirmation || !!values.password_confirmation && !passwordsMatch}
          helperText={values.password_confirmation && !passwordsMatch ? 'No coincide' : validation && !values.password_confirmation ? 'Requerido' : ''}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Actualizar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserPasswordModal;
