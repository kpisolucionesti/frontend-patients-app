import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormLabel, Paper, Switch, TextField, Typography, Alert } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

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

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {profile ? 'EDITAR PERFIL' : 'NUEVO PERFIL'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField variant="standard" fullWidth label="Nombre" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} required />
          <TextField variant="standard" fullWidth label="Descripcion" value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} multiline rows={2} />

          <FormControl component="fieldset" variant="standard" fullWidth>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'bold' }}>Permisos</FormLabel>
            {loadingPerms ? (
              <Typography variant="body2" color="text.secondary">Cargando permisos...</Typography>
            ) : groups.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No se pudieron cargar los permisos</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {groups.map((group) => (
                  <Paper
                    key={group.section}
                    variant="outlined"
                    sx={{ p: 1.5, borderLeft: 4, borderColor: group.color || 'primary.main' }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: group.color ? '#333' : 'primary.main' }}>
                      {group.section}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(group.permissions || []).map((perm) => (
                        <Box
                          key={perm.key}
                          onClick={() => togglePermission(perm.key)}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.3,
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: permissions.includes(perm.key) ? (group.color || '#e3f2fd') : 'grey.100',
                            border: 1,
                            borderColor: permissions.includes(perm.key) ? (group.color || '#90caf9') : 'grey.300',
                            '&:hover': { opacity: 0.8 },
                            userSelect: 'none',
                          }}
                        >
                          <Switch
                            size="small"
                            checked={permissions.includes(perm.key)}
                            sx={{ m: 0 }}
                          />
                          <Typography variant="body2">{perm.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
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
