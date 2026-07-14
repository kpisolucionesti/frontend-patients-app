import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';

const ProfileUsersModal = ({ open, onClose, profile }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !profile) return;
    (async () => {
      setLoading(true);
      const data = await BackendAPI.profiles.getUsers(profile.id);
      setUsers(data || []);
      setLoading(false);
    })();
  }, [open, profile]);

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
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.status === 'suspended' ? 'Suspendido' : 'Activo'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={onClose} variant="contained" color="error">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileUsersModal;
