import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography } from '@mui/material';

const EvolutiveDialog = React.memo(function EvolutiveDialog({
  open,
  onClose,
  patientName,
  patientCi,
  evolutiveType,
  evolutiveNote,
  onNoteChange,
  onConfirm,
  saving,
}) {
  const isDischarge = evolutiveType === 'discharge';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: isDischarge ? 'success.main' : 'primary.main', color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>
        {isDischarge ? 'NOTA DE EGRESO' : 'NOTA DE INGRESO'}
        <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mt: 0.25, fontSize: '0.7rem', fontWeight: 400 }}>
          {patientName} · CI: {patientCi || '—'}
        </Typography>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 24 }}>
        <TextField
          variant="standard"
          fullWidth
          size="small"
          required
          multiline
          rows={4}
          label={isDischarge ? 'Motivo de Alta Médica' : 'Causa de Ingreso a Hospitalización'}
          value={evolutiveNote}
          onChange={(e) => onNoteChange(e.target.value)}
          error={!evolutiveNote}
          helperText={!evolutiveNote ? 'Requerido' : ''}
        />
      </DialogContent>
      <DialogActions>
        <Button size="small" variant="outlined" color="error" onClick={onClose}>Cancelar</Button>
        <Button size="small" variant="outlined" color="success" onClick={onConfirm} disabled={saving || !evolutiveNote}>
          {saving ? 'Guardando...' : 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default EvolutiveDialog;
