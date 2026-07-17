import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React from "react";

const ConfirmActionModal = ({ open, onClose, entityType, entityName, action, onConfirm }) => {
  const isSuspend = action === 'suspend';
  const upperType = entityType.toUpperCase();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: isSuspend ? 'error.main' : 'success.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isSuspend ? `SUSPENDER ${upperType}` : `REACTIVAR ${upperType}`}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
        <DialogContentText>
          {isSuspend
            ? `¿Está seguro que desea suspender al ${entityType.toLowerCase()} ${entityName}?`
            : `¿Está seguro que desea reactivar al ${entityType.toLowerCase()} ${entityName}?`
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancelar</Button>
        <Button
          onClick={() => onConfirm()}
          variant="outlined"
          color={isSuspend ? 'error' : 'success'}
        >
          {isSuspend ? 'Suspender' : 'Reactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmActionModal;
