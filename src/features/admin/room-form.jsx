import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useFetch } from "../../hooks/useFetch";
import { useSnackbar } from "../../hooks/useSnackbar";

const ROOM_TYPE_LABELS = {
  adulto: 'Adultos',
  pediatria: 'Pediatría',
};

const RoomFormModal = ({ open, onClose, room, onSaved }) => {
  const isEdit = !!room;
  const { show } = useSnackbar();
  const { data: areas } = useFetch(() => BackendAPI.areas.getAll(), []);

  const [values, setValues] = useState({
    name: room?.name || '',
    area_id: room?.area_id || '',
  });
  const [validation, setValidation] = useState(false);

  const selectedArea = useMemo(
    () => (areas || []).find((a) => a.id === values.area_id),
    [areas, values.area_id],
  );

  const areaRoomType = selectedArea?.room_type;

  const handleChange = useCallback((target) => {
    setValues((prev) => ({ ...prev, [target.name]: target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const errors = {};
    if (!values.name) errors.name = true;
    if (!values.area_id) errors.area_id = true;

    if (Object.keys(errors).length > 0) {
      setValidation(errors);
      return;
    }

    const payload = {
      name: values.name,
      area_id: values.area_id,
    };

    try {
      if (isEdit) {
        await BackendAPI.rooms.update({ id: room.id, ...payload });
        show('Sala actualizada exitosamente', 'success');
      } else {
        await BackendAPI.rooms.create(payload);
        show('Sala creada exitosamente', 'success');
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      show(err.response?.data?.error || 'Error al guardar', 'error');
    }
  }, [values, room, isEdit, onSaved, onClose, show]);

  const getError = (field) => validation[field];

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'info.main', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        {isEdit ? 'EDITAR SALA' : 'AGREGAR SALA'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          variant="standard"
          fullWidth required label="Nombre" name="name" value={values.name}
          onChange={({ target }) => handleChange(target)}
          error={!!getError('name')}
          helperText={getError('name') ? 'Requerido' : ''}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth variant="standard" sx={{ mb: 2 }}>
          <InputLabel>Área</InputLabel>
          <Select
            variant="standard"
            name="area_id"
            value={values.area_id}
            onChange={({ target }) => handleChange(target)}
            error={!!getError('area_id')}
          >
            {(areas || []).map((a) => (
              <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedArea && (
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
            Tipo: {areaRoomType ? ROOM_TYPE_LABELS[areaRoomType] : 'Sin restricción'}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomFormModal;
