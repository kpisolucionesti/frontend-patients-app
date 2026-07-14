import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, FormLabel, InputLabel, MenuItem, Select, Switch, Typography, Alert, Box } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const ALL_PERMISSIONS = [
  { key: 'emergencia.view', label: 'Ver Emergencia' },
  { key: 'emergencia.create', label: 'Crear Emergencia' },
  { key: 'emergencia.edit', label: 'Editar Emergencia' },
  { key: 'emergencia.triage', label: 'Asignar Triage' },
  { key: 'emergencia.discharge', label: 'Dar de Alta' },
  { key: 'emergencia.assign_room', label: 'Asignar Sala' },
  { key: 'historial.view', label: 'Ver Historial' },
  { key: 'configuraciones.view', label: 'Ver Configuraciones' },
  { key: 'pacientes.view', label: 'Ver Pacientes' },
  { key: 'pacientes.edit', label: 'Editar Pacientes' },
  { key: 'medicos.view', label: 'Ver Medicos' },
  { key: 'medicos.create', label: 'Crear Medicos' },
  { key: 'medicos.edit', label: 'Editar Medicos' },
  { key: 'medicos.suspend', label: 'Suspender Medicos' },
  { key: 'usuarios.view', label: 'Ver Usuarios' },
  { key: 'usuarios.create', label: 'Crear Usuarios' },
  { key: 'usuarios.edit', label: 'Editar Usuarios' },
  { key: 'usuarios.suspend', label: 'Suspender Usuarios' },
  { key: 'usuarios.manage_permissions', label: 'Gestionar Permisos' },
  { key: 'usuarios.change_password', label: 'Cambiar Contrasena' },
  { key: 'perfiles.view', label: 'Ver Perfiles' },
  { key: 'perfiles.create', label: 'Crear Perfiles' },
  { key: 'perfiles.edit', label: 'Editar Perfiles' },
  { key: 'perfiles.delete', label: 'Eliminar Perfiles' },
  { key: 'rooms.view', label: 'Ver Salas' },
  { key: 'notes.view', label: 'Ver Notas' },
  { key: 'notes.create', label: 'Crear Notas' },
  { key: 'notes.edit', label: 'Editar Notas' },
  { key: 'notes.delete', label: 'Eliminar Notas' },
];

const UserPermissionModal = ({ open, onClose, user: propUser, onSaved }) => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [extraPermissions, setExtraPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const data = await BackendAPI.users.getProfiles();
      setProfiles(data || []);
      setSelectedProfileId(propUser.profile_id || '');
      setExtraPermissions(propUser.permissions || []);
      setSuccess(false);
    })();
  }, [open, propUser]);

  const togglePermission = (key) => {
    setExtraPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await BackendAPI.users.updatePermissions(propUser.id, { profile_id: selectedProfileId, permissions: extraPermissions });
      setSuccess(true);
      if (onSaved) onSaved();
    } catch {
      alert('Error al guardar permisos');
    } finally {
      setSaving(false);
    }
  };

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const isAdminProfile = selectedProfile?.name === 'Administrador';

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        PERMISOS - {propUser.name}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>Permisos actualizados exitosamente</Alert>}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Perfil</InputLabel>
          <Select value={selectedProfileId} label="Perfil" onChange={(e) => setSelectedProfileId(e.target.value)}>
            {profiles.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {isAdminProfile && (
          <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 2, mb: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              El perfil Administrador tiene todos los permisos.
            </Typography>
          </Box>
        )}
        {!isAdminProfile && (
          <FormControl component="fieldset" variant="standard" fullWidth>
            <FormLabel component="legend" sx={{ mb: 1 }}>Permisos adicionales</FormLabel>
            <FormGroup>
              {ALL_PERMISSIONS.map((perm) => (
                <FormControlLabel
                  key={perm.key}
                  control={<Switch checked={extraPermissions.includes(perm.key)} onChange={() => togglePermission(perm.key)} />}
                  label={perm.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={() => { if (success) onClose(); else onClose(); }} variant="contained" color="error">
          {success ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!success && (
          <Button onClick={handleSave} variant="contained" color="primary" disabled={saving || !selectedProfileId}>
            Guardar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserPermissionModal;
