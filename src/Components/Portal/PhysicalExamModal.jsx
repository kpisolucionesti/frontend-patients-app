import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { sanitizeInput } from '../../utils/sanitize';

const FIELDS = [
  'Cabeza', 'Ojo', 'Cuello', 'ORL', 'Torax',
  'Cardiovascular', 'Abdomen', 'Genitales', 'Extremidades', 'Neurologico',
];

const FIELD_KEY_MAP = {
  Cabeza: 'cabeza',
  Ojo: 'ojo',
  Cuello: 'cuello',
  ORL: 'orl',
  Torax: 'torax',
  Cardiovascular: 'cardiovascular',
  Abdomen: 'abdomen',
  Genitales: 'genitales',
  Extremidades: 'extremidades',
  Neurologico: 'neurologico',
};

const PhysicalExamModal = ({ open, onClose, initialValues, onSave, saving }) => {
  const [values, setValues] = useState({});

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
    }
  }, [open, initialValues]);

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: sanitizeInput(val, { maxLength: 5000 }) }));
  };

  const handleSave = () => {
    onSave(values);
  };

  const hasAnyData = Object.values(values).some((v) => v && typeof v === 'string' && v.trim());

  return (
    <Dialog fullWidth maxWidth="md" open={open} onClose={onClose}>
      <DialogTitle>
        {hasAnyData ? 'EDITAR EXAMEN FÍSICO' : 'NUEVO EXAMEN FÍSICO'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {FIELDS.map((label) => {
          const key = FIELD_KEY_MAP[label];
          return (
            <TextField
              key={key}
              variant="standard"
              fullWidth
              multiline
              rows={2}
              label={label}
              value={values[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              sx={{ mb: 2 }}
            />
          );
        })}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSave} variant="outlined" color="success" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhysicalExamModal;
