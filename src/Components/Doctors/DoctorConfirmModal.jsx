import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React from "react";

const DoctorConfirmModal = ({ open, onClose, doctor, action, onConfirm }) => {
  const isSuspend = action === 'suspend';

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: isSuspend ? 'error.main' : 'success.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isSuspend ? 'SUSPENDER MEDICO' : 'REACTIVAR MEDICO'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
        <DialogContentText>
          {isSuspend
            ? `¿Está seguro que desea suspender al médico ${doctor.name}?`
            : `¿Está seguro que desea reactivar al médico ${doctor.name}?`
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={onClose} variant="contained" color="inherit">Cancelar</Button>
        <Button
          onClick={() => onConfirm(doctor)}
          variant="contained"
          color={isSuspend ? 'error' : 'success'}
        >
          {isSuspend ? 'Suspender' : 'Reactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DoctorConfirmModal;
