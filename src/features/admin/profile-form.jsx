import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField, Typography, Alert } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import PermissionSelector from '../../shared/ui/permission-selector';

const ProfileFormModal = ({ open, onClose, profile, onSaved }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingPerms(true);
    BackendAPI.permissions.getAll()
      .then((res) => setGroups(res?.groups || []))
      .catch(() => setGroups([]))
      .finally(() => setLoadingPerms(false));

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

  const allPermissionKeys = useMemo(
    () => groups.flatMap((g) => (g.permissions || []).map((p) => p.key)),
    [groups],
  );

  return (
    <Dialog fullWidth maxWidth={false} open={open} onClose={onClose}
      sx={{ '& .MuiDialog-paper': { width: { xs: '100%', sm: '90%', md: '85%', lg: '80%' }, maxWidth: 1100 } }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {profile ? 'EDITAR PERFIL' : 'NUEVO PERFIL'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField variant="standard" label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required
              sx={{ minWidth: 250 }} />
            <TextField variant="standard" label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)}
              multiline rows={1} sx={{ flex: 1, minWidth: 250 }} />
          </Box>

          {loadingPerms ? (
            <Typography variant="body2" color="text.secondary">Cargando permisos...</Typography>
          ) : groups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No se pudieron cargar los permisos</Typography>
          ) : (
            <>
              <Box sx={{ mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={allPermissionKeys.length > 0 && allPermissionKeys.every((k) => permissions.includes(k))}
                      indeterminate={allPermissionKeys.some((k) => permissions.includes(k)) && !allPermissionKeys.every((k) => permissions.includes(k))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const missing = allPermissionKeys.filter((k) => !permissions.includes(k));
                          missing.forEach((k) => togglePermission(k));
                        } else {
                          permissions.forEach((k) => togglePermission(k));
                        }
                      }}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={600}>Seleccionar todos los permisos</Typography>}
                />
              </Box>
              <PermissionSelector groups={groups} permissions={permissions} onToggle={togglePermission} />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
          <Button type="submit" variant="outlined" color="success" disabled={saving}>Guardar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProfileFormModal;
