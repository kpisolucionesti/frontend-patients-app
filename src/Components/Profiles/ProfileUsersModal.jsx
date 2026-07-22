import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { RemoveCircle } from '@mui/icons-material';
import { BackendAPI } from '../../services/BackendApi';

const ProfileUsersModal = ({ open, onClose, profile }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchUsers = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await BackendAPI.profiles.getUsers(profile.id);
      setUsers(data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !profile) return;
    fetchUsers();
  }, [open, profile]);

  const handleRemove = async (user) => {
    if (!window.confirm(`¿Quitar a "${user.name}" del perfil "${profile?.name}"?`)) return;
    setRemovingId(user.id);
    try {
      await BackendAPI.users.updatePermissions(user.id, { profile_id: null });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al quitar usuario del perfil');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        USUARIOS - {profile?.name}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Typography align="center">Cargando...</Typography>
        ) : users.length === 0 ? (
          <Typography align="center" color="text.secondary">No hay usuarios con este perfil</Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Nombre</strong></TableCell>
                  <TableCell><strong>Correo</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Acción</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => {
                  const cantRemove = profile?.id === 2 && u.username === 'admin';
                  return (
                    <TableRow key={u.id}>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.status === 'suspended' ? 'Suspendido' : 'Activo'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={cantRemove ? 'No se puede quitar a este usuario' : 'Quitar del perfil'} arrow>
                          <span>
                            <IconButton
                              color="error"
                              size="small"
                              disabled={cantRemove || removingId === u.id}
                              onClick={() => handleRemove(u)}
                            >
                              <RemoveCircle fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={onClose} variant="outlined" color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileUsersModal;
