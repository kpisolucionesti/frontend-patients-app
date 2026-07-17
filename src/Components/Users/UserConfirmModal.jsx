import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React from "react";

const UserConfirmModal = ({ open, onClose, user, action, onConfirm }) => {
  const isSuspend = action === 'suspend';

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: isSuspend ? 'error.main' : 'success.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isSuspend ? 'SUSPENDER USUARIO' : 'REACTIVAR USUARIO'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
        <DialogContentText>
          {isSuspend
            ? `¿Está seguro que desea suspender al usuario ${user.name}?`
            : `¿Está seguro que desea reactivar al usuario ${user.name}?`
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancelar</Button>
        <Button
          onClick={() => onConfirm(user)}
          variant="outlined"
          color={isSuspend ? 'error' : 'success'}
        >
          {isSuspend ? 'Suspender' : 'Reactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserConfirmModal;
