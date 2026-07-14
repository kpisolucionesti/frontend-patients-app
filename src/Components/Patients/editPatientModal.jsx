import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, Button, IconButton, Tooltip } from "@mui/material";
import React, { useCallback, useState } from "react";
import { Edit } from '@mui/icons-material';
import DoctorSelect from "../Commons/DoctorSelect";

const EditPatients = ({ onSubmit, row }) => {
    const [values, setValues] = useState({
      diagnostic: row.diagnostic || '',
      treatment: row.treatment || '',
      current_doctor: row.primary_doctor?.name || '',
      observations: row.observations || '',
    });
    const [openModal, setOpenModal] = useState(false);
    const [validation, setValidation] = useState(false);

    const handleValueChange = useCallback((target) => {
      setValues((prev) => ({ ...prev, [target.name]: target.value }));
    }, []);

    const handleOpen = () => setOpenModal(true);

    const handleClose = useCallback(() => {
      setOpenModal(false);
    }, []);

    const handleSubmit = useCallback((event) => {
      event.preventDefault();
      if (!values.diagnostic || !values.treatment) {
        alert("FALTAN DATOS POR LLENAR");
        setValidation(true);
        return;
      }
      onSubmit({ id: row.id, ...values });
      setValidation(false);
      handleClose();
    }, [values, row.id, onSubmit, handleClose]);

    return (
      <>
        <Tooltip title='Editar' arrow>
          <span>
            <IconButton color="success" onClick={handleOpen} disabled={row.status !== 1}>
              <Edit />
            </IconButton>
          </span>
        </Tooltip>
        <Dialog open={openModal} onClose={handleClose}>
          <DialogTitle textAlign="center" sx={{ bgcolor: 'success.main', color: 'text.primary', fontWeight: 'bold' }}>
            EDITAR EMERGENCIA - {row.patient?.name}
          </DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField sx={{ mb: 3 }} fullWidth label="Diagnostico" name="diagnostic" value={values.diagnostic || ''} onChange={({ target }) => handleValueChange(target)} error={validation && !values.diagnostic} helperText={validation && !values.diagnostic ? 'Requerido' : ''} />
                <TextField sx={{ mb: 3 }} fullWidth label="Plan" name="treatment" value={values.treatment || ''} onChange={({ target }) => handleValueChange(target)} error={validation && !values.treatment} helperText={validation && !values.treatment ? 'Requerido' : ''} />
                <DoctorSelect value={values.current_doctor} onChange={({ target }) => setValues((prev) => ({ ...prev, [target.name]: target.value }))} />
                <TextField multiline rows={2} fullWidth label="Observaciones" name="observations" value={values.observations || ''} onChange={({ target }) => handleValueChange(target)} />
              </Stack>
            </form>
          </DialogContent>
          <DialogActions sx={{ p: '1.25rem' }}>
            <Button onClick={handleClose} variant="contained" color='error'>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" color='success'>Guardar</Button>
          </DialogActions>
        </Dialog>
      </>
    );
};

export default EditPatients;
