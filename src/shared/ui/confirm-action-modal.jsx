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
      <DialogTitle sx={{ bgcolor: config.bgcolor, color: 'white', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
        {config.label} {upperType}
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <DialogContentText>
          ¿Esta seguro que desea {config.verb} al {entityType.toLowerCase()} {entityName}?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button onClick={onClose} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }}>Cancelar</Button>
        <Button onClick={() => onConfirm()} size="small" variant="contained" color={config.color} sx={{ fontSize: '0.75rem' }}>
          {config.label}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmActionModal;
