import React, { useCallback, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { KingBed } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, IconButton, Alert } from "@mui/material";
import { useRooms } from '../../hooks/useApiData';
import { PEDIATRIC_AGE_THRESHOLD } from "../../constants";

const AsignRoom = ({ row, onStatusChange, iconOnly }) => {
  const [openModal, setOpenModal] = useState(false);
  const [roomSelected, setRoomSelected] = useState(null);
  const [validation, setValidation] = useState(false);
  const [error, setError] = useState('');

  const { data: rooms } = useRooms();

  const handleClose = useCallback(() => {
    setOpenModal(false);
    setRoomSelected(null);
    setValidation(false);
    setError('');
  }, []);

  const handleOpen = () => setOpenModal(true);

  const handleSubmit = useCallback(() => {
    if (!roomSelected) {
      setValidation(true);
      setError('Seleccione una ubicación');
      return;
    }
    const currentRoom = (rooms || []).find((f) => f.patient_id === row.patient?.id);
    BackendAPI.rooms.update({ ...roomSelected, patient_id: row.patient?.id });
    if (currentRoom) BackendAPI.rooms.update({ ...currentRoom, patient_id: null });
    setRoomSelected(null);
    setValidation(false);
    setError('');
    handleClose();
    if (onStatusChange) onStatusChange();
  }, [roomSelected, rooms, row.patient?.id, onStatusChange, handleClose]);

  const availableRooms = useMemo(
    () => (rooms || []).filter((r) =>
      !r.patient_id && (
        !r.room_type || r.room_type === 'hospitalizacion' ||
        (r.room_type === 'pediatria' && (row.patient?.age || 0) < PEDIATRIC_AGE_THRESHOLD) ||
        (r.room_type === 'adulto' && (row.patient?.age || 0) >= PEDIATRIC_AGE_THRESHOLD)
      )
    ),
    [rooms, row.patient?.age],
  );

  return (
    <>
      {iconOnly ? (
        <Tooltip title='Camas' arrow>
          <span>
            <IconButton color="warning" onClick={handleOpen} disabled={row.status !== 1 && row.status !== 3}>
              <KingBed />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Button variant="outlined" size="small" startIcon={<KingBed />} onClick={handleOpen}
          disabled={row.status !== 1 && row.status !== 3}
          sx={{ color: 'warning.main', borderColor: 'warning.main', '&:hover': { borderColor: 'warning.main', bgcolor: 'warning.light' }, fontSize: '0.7rem' }}>
          Cama
        </Button>
      )}
      <Dialog fullWidth maxWidth="xs" open={openModal} onClose={handleClose}>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, textAlign: 'center', fontSize: '0.95rem' }}>
          CAMBIAR UBICACIÓN
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          <Stack spacing={2}>
            <TextField variant="standard" disabled label="Paciente"
              value={`${row.patient?.name || ''} ${row.patient?.lastname || ''}`.trim()} />
            <FormControl variant="standard" error={validation}>
              <InputLabel id="asign-room-label">Ubicación</InputLabel>
              <Select labelId="asign-room-label" variant="standard" value={roomSelected?.id || ''}
                onChange={({ target }) => setRoomSelected(availableRooms.find((r) => r.id === target.value) || null)}>
                {availableRooms.map((r) => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error" size="small">Cancelar</Button>
          <Button onClick={handleSubmit} variant="outlined" color="success" size="small">Asignar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AsignRoom;
