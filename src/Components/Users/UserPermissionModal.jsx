import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Typography, Alert, Chip } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import PermissionSelector from '../Commons/PermissionSelector';

const UserPermissionModal = ({ open, onClose, user: propUser, onSaved }) => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [extraPermissions, setExtraPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: permissionData } = useFetch(
    () => BackendAPI.permissions.getAll(),
    [open],
  );

  const groups = useMemo(() => permissionData?.groups || [], [permissionData]);

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

  const profilePermissionLabels = useMemo(() => {
    if (!selectedProfile || !groups.length) return [];
    const permKeyToLabel = {};
    groups.forEach((g) => g.permissions?.forEach((p) => { permKeyToLabel[p.key] = g.section + ' - ' + p.label; }));
    return (selectedProfile.permissions || []).map((k) => permKeyToLabel[k] || k);
  }, [selectedProfile, groups]);

  return (
    <Dialog fullWidth maxWidth={false} open={open} onClose={onClose}
      sx={{ '& .MuiDialog-paper': { width: { xs: '100%', sm: '90%', md: '85%', lg: '80%' }, maxWidth: 1100 } }}
    >
      <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        PERMISOS - {propUser.name}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {success && <Alert severity="success" sx={{ mb: 2 }}>Permisos actualizados exitosamente</Alert>}
        <FormControl sx={{ mb: 2, minWidth: 280 }}>
          <InputLabel>Perfil</InputLabel>
          <Select variant="standard" value={selectedProfileId} label="Perfil" onChange={(e) => setSelectedProfileId(e.target.value)}>
            {profiles.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedProfile && !isAdminProfile && profilePermissionLabels.length > 0 && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
              Permisos del perfil &quot;{selectedProfile.name}&quot;:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {profilePermissionLabels.map((label, i) => (
                <Chip key={i} label={label} size="small" variant="outlined" sx={{ fontSize: '0.6rem', height: 18 }} />
              ))}
            </Box>
          </Box>
        )}

        {isAdminProfile ? (
          <Box sx={{ bgcolor: '#e3f2fd', p: 2, borderRadius: 2, mb: 2, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              El perfil Administrador tiene todos los permisos.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
              Permisos adicionales para este usuario:
            </Typography>
            <PermissionSelector groups={groups} permissions={extraPermissions} onToggle={togglePermission} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={onClose} variant="outlined" color="error">
          {success ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!success && (
          <Button onClick={handleSave} variant="outlined" color="success" disabled={saving || !selectedProfileId}>
            Guardar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserPermissionModal;
