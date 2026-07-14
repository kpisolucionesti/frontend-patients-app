import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, FormControlLabel, FormGroup, FormLabel, Switch, Alert } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const ALL_PERMISSIONS = [
  { key: 'emergencia.view', label: 'Ver Emergencia' },
  { key: 'emergencia.create', label: 'Crear Emergencia' },
  { key: 'emergencia.edit', label: 'Editar Emergencia' },
  { key: 'emergencia.triage', label: 'Asignar Triage' },
  { key: 'emergencia.discharge', label: 'Dar de Alta' },
  { key: 'emergencia.assign_room', label: 'Asignar Sala' },
  { key: 'historial.view', label: 'Ver Historial' },
  { key: 'historial.export', label: 'Exportar Historial' },
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

const ProfileFormModal = ({ open, onClose, profile, onSaved }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (profile) {
      setName(profile.name || '');
      setDescription(profile.description || '');
      setPermissions(profile.permissions || []);
    } else {
      setName('');
      setDescription('');
      setPermissions([]);
    }
    setError('');
  }, [open, profile]);

  const togglePermission = (key) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    setError('');
    try {
      const data = { name: name.trim(), description: description.trim(), permissions };
      if (profile) {
        await BackendAPI.profiles.update({ ...data, id: profile.id });
      } else {
        await BackendAPI.profiles.create(data);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {profile ? 'EDITAR PERFIL' : 'NUEVO PERFIL'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Nombre" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} required />
          <TextField fullWidth label="Descripcion" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} multiline rows={2} />
          <FormControl component="fieldset" variant="standard" fullWidth>
            <FormLabel component="legend" sx={{ mb: 1 }}>Permisos</FormLabel>
            <FormGroup>
              {ALL_PERMISSIONS.map((perm) => (
                <FormControlLabel
                  key={perm.key}
                  control={<Switch checked={permissions.includes(perm.key)} onChange={() => togglePermission(perm.key)} />}
                  label={perm.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={onClose} variant="contained" color="error">Cancelar</Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving}>Guardar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProfileFormModal;
