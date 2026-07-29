import React, { useCallback, useState, useEffect } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { catalogsApi } from "../../services/catalogsApi";
import { Button, Dialog, DialogContent, DialogTitle, Stack, FormControl, Select, InputLabel, MenuItem, DialogActions, TextField, Alert, IconButton, Tooltip, Typography } from "@mui/material";
import { HealthAndSafetyOutlined } from "@mui/icons-material";
import { useRooms } from '../../hooks/useApiData';

const ReleasePatient = ({ row, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const [extraData, setExtraData] = useState({ medical_exit: '', observations: '', cause_of_death: '', death_at: '' });
  const [validation, setValidation] = useState(false);
  const [error, setError] = useState('');
  const [dischargeTypes, setDischargeTypes] = useState([]);

  const { data: rooms = [] } = useRooms();

  useEffect(() => {
    catalogsApi.dischargeTypes.list().then(setDischargeTypes).catch(() => {});
  }, []);

  const handleOpen = () => setOpen(true);

  const handleClose = useCallback(() => {
    setOpen(false); setValidation(false); setError('');
    setExtraData({ medical_exit: '', observations: '', cause_of_death: '', death_at: '' });
  }, []);

  const handleValueChange = useCallback((target) => {
    setExtraData((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const selectedDischargeType = dischargeTypes.find((d) => d.name === extraData.medical_exit);
  const isDeath = selectedDischargeType?.requires_cause_of_death || false;

  const handleReleasePatient = useCallback(() => {
    if (!extraData.medical_exit) { setValidation(true); setError('Seleccione la causa de egreso'); return; }
    if (isDeath && !extraData.cause_of_death) { setValidation(true); setError('Debe especificar la causa de muerte'); return; }
    setError('');

    const currentRoom = rooms.find((f) => f.patient_id === row.patient?.id);
    if (isDeath) {
      BackendAPI.emergencies.update({
        id: row.id, status: 5, cause_of_death: extraData.cause_of_death,
        observations: extraData.observations, egress_at: extraData.death_at || new Date().toISOString(),
      });
      if (row.patient?.id) BackendAPI.patients.update(row.patient.id, { disabled: true });
    } else {
      BackendAPI.emergencies.update({ id: row.id, ...extraData, status: 2 });
    }
    if (currentRoom) BackendAPI.rooms.update({ ...currentRoom, patient_id: null });
    if (onStatusChange) onStatusChange();
    handleClose();
  }, [extraData, rooms, row, onStatusChange, handleClose, isDeath]);

  return (
    <>
      <Tooltip title='Alta Médica' arrow>
        <span>
          <IconButton color="error" onClick={handleOpen} disabled={row.status !== 1}>
            <HealthAndSafetyOutlined />
          </IconButton>
        </span>
      </Tooltip>
      <Dialog fullWidth maxWidth='xs' open={open} onClose={handleClose}>
        <DialogTitle sx={{ bgcolor: isDeath ? 'error.main' : 'primary.main', color: 'white', fontWeight: 700, textAlign: 'center', fontSize: '0.95rem' }}>
          {isDeath ? 'REGISTRAR FALLECIMIENTO' : 'ALTA PACIENTE'}
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mt: 0.25, fontSize: '0.7rem', fontWeight: 400 }}>
            {row.patient?.name} {row.patient?.lastname} · CI: {row.patient?.ci || '—'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
            {isDeath ? 'Se registrará el fallecimiento. Estos datos no pueden ser modificados.'
              : 'Una vez dada el alta, estos datos no pueden ser modificados'}
          </Alert>
          <Stack spacing={2}>
            <TextField variant="standard" disabled label="Paciente"
              value={`${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim()} />
            <FormControl variant="standard" error={validation}>
              <InputLabel id="release-cause-label">Causa de egreso</InputLabel>
              <Select labelId="release-cause-label" variant="standard" value={extraData.medical_exit}
                onChange={({ target }) => handleValueChange(target)} name="medical_exit">
                {dischargeTypes.map((r) => (<MenuItem key={r.id || r.name} value={r.name}>{r.name}</MenuItem>))}
              </Select>
            </FormControl>
            {isDeath && (
              <>
                <TextField variant="standard" multiline rows={2} label="Causa de Muerte" name="cause_of_death"
                  value={extraData.cause_of_death} onChange={({ target }) => handleValueChange(target)}
                  required error={validation && !extraData.cause_of_death}
                  helperText={validation && !extraData.cause_of_death ? 'Requerido' : ''} />
                <TextField variant="standard" type="datetime-local" label="Fecha y Hora de Muerte" name="death_at"
                  value={extraData.death_at} onChange={({ target }) => handleValueChange(target)} InputLabelProps={{ shrink: true }} />
              </>
            )}
            <TextField variant="standard" multiline rows={4} label="Observaciones" name="observations"
              value={extraData.observations} onChange={({ target }) => handleValueChange(target)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error" size="small">Cancelar</Button>
          <Button onClick={handleReleasePatient} variant="outlined" color={isDeath ? 'error' : 'success'} size="small">
            {isDeath ? 'Registrar Fallecimiento' : 'Dar de Alta'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReleasePatient;
