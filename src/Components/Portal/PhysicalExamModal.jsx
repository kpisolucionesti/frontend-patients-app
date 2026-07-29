import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel, Box, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { sanitizeInput } from '../../utils/sanitize';

const ANATOMY_REGIONS = [
  { label: 'Cabeza', key: 'cabeza' },
  { label: 'Ojo', key: 'ojo' },
  { label: 'Cuello', key: 'cuello' },
  { label: 'ORL', key: 'orl' },
  { label: 'Tórax', key: 'torax' },
  { label: 'Cardiovascular', key: 'cardiovascular' },
  { label: 'Abdomen', key: 'abdomen' },
  { label: 'Genitales', key: 'genitales' },
  { label: 'Extremidades', key: 'extremidades' },
  { label: 'Neurológico', key: 'neurologico' },
];

const PhysicalExamModal = ({ open, onClose, initialValues, onSave, saving }) => {
  const [selected, setSelected] = useState(0);
  const [values, setValues] = useState({});

  useEffect(() => {
    if (open) {
      setValues(initialValues || {});
      setSelected(0);
    }
  }, [open, initialValues]);

  const current = ANATOMY_REGIONS[selected];

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: sanitizeInput(val, { maxLength: 5000 }) }));
  };

  const handlePrev = () => setSelected((s) => Math.max(0, s - 1));
  const handleNext = () => setSelected((s) => Math.min(ANATOMY_REGIONS.length - 1, s + 1));

  const handleSave = () => {
    const final = {};
    ANATOMY_REGIONS.forEach(({ key }) => {
      final[key] = values[key] && values[key].trim() ? values[key] : 'SLA - DLN';
    });
    onSave(final);
  };

  const hasAnyData = Object.values(values).some((v) => v && typeof v === 'string' && v.trim());

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
        {hasAnyData ? 'EDITAR EXAMEN FÍSICO' : 'NUEVO EXAMEN FÍSICO'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, mt: 3 }}>
        {/* region navigator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <Tooltip title="Región anterior" arrow>
              <span>
                <IconButton size="small" onClick={handlePrev} disabled={selected === 0}
                  sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.light' } }}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <FormControl size="small" variant="standard" sx={{ flex: 1 }}>
              <InputLabel id="anatomy-region-label" sx={{ fontSize: '0.75rem' }}>Región Anatómica</InputLabel>
              <Select
                labelId="anatomy-region-label"
                variant="standard"
                value={selected}
                onChange={(e) => setSelected(Number(e.target.value))}
                sx={{ '& .MuiSelect-select': { fontSize: '0.75rem', py: 0.75 } }}>
                {ANATOMY_REGIONS.map((region, idx) => (
                  <MenuItem key={region.key} value={idx} sx={{ fontSize: '0.75rem' }}>
                    {region.label}{values[region.key] && values[region.key].trim() ? ' ✓' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Región siguiente" arrow>
              <span>
                <IconButton size="small" onClick={handleNext} disabled={selected === ANATOMY_REGIONS.length - 1}
                  sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.light' } }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

        <TextField variant="standard" fullWidth multiline rows={4}
          label={current.label}
          value={values[current.key] || ''}
          onChange={(e) => handleChange(current.key, e.target.value)}
          placeholder={`Describir hallazgos para ${current.label.toLowerCase()}...`}
          sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error" sx={{ fontSize: '0.7rem' }}>Cancelar</Button>
        <Button onClick={handleSave} variant="outlined" color="success" disabled={saving} sx={{ fontSize: '0.7rem' }}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhysicalExamModal;
