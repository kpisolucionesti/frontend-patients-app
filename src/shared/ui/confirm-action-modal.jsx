import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import React from "react";

const ACTION_CONFIG = {
  suspend: { bgcolor: 'error.main', color: 'error', label: 'Suspender', verb: 'suspender' },
  reactivate: { bgcolor: 'success.main', color: 'success', label: 'Reactivar', verb: 'reactivar' },
  block: { bgcolor: 'error.main', color: 'error', label: 'Bloquear', verb: 'bloquear' },
  unblock: { bgcolor: 'success.main', color: 'success', label: 'Desbloquear', verb: 'desbloquear' },
};

const ConfirmActionModal = ({ open, onClose, entityType, entityName, action, onConfirm }) => {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.suspend;
  const upperType = entityType.toUpperCase();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: config.bgcolor, color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
        {config.label.toUpperCase()} {upperType}
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <DialogContentText>
          ¿Está seguro que desea {config.verb} al {entityType.toLowerCase()} {entityName}?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button
          onClick={() => onConfirm()}
          variant="outlined"
          color={config.color}
        >
          {config.label}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmActionModal;
