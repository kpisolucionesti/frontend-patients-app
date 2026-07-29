import { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, Box, Typography, CircularProgress,
} from '@mui/material';
import { useFetch } from '../../hooks/useFetch';
import { BackendAPI } from '../../services/BackendApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const ServiceOrderModal = ({ open, onClose, onSaved, attachableType, attachableId, patient }) => {
  const { show: showSnackbar } = useSnackbar();
  const [classifications, setClassifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    study_classification_id: '',
    study_type: '',
    observations: '',
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (open) {
      BackendAPI.clinicalStudyClassifications.getAll()
        .then((data) => setClassifications(data || []))
        .catch(() => setClassifications([]));
    }
  }, [open]);

  const handleClose = () => {
    setForm({ study_classification_id: '', study_type: '', observations: '' });
    setFile(null);
    onClose();
  };

  const handleSave = async () => {
    if (!form.study_classification_id) { showSnackbar('Seleccione una clasificación', 'warning'); return; }
    if (!form.study_type.trim()) { showSnackbar('Ingrese el estudio a realizar', 'warning'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('attachable_type', attachableType);
      fd.append('attachable_id', String(attachableId));
      fd.append('study_classification_id', form.study_classification_id);
      fd.append('study_type', form.study_type.trim());
      if (form.observations.trim()) fd.append('observations', form.observations.trim());
      fd.append('status', 'requested');
      if (file) fd.append('file', file);

      await BackendAPI.documents.create(fd);
      showSnackbar('Orden de servicio creada', 'success');
      handleClose();
      if (onSaved) onSaved();
    } catch {
      showSnackbar('Error al crear la orden de servicio', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pName = patient ? `${patient.name || ''} ${patient.lastname || ''}`.trim() : '—';
  const pInfo = patient ? `CI: ${patient.ci || '—'} · ${patient.age || '?'}a` : '—';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
        NUEVA ORDEN DE SERVICIO
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Paciente</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{pName}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>{pInfo}</Typography>
          </Box>

          <FormControl variant="standard" fullWidth required>
            <InputLabel>Clasificación</InputLabel>
            <Select
              variant="standard"
              value={form.study_classification_id}
              onChange={(e) => setForm((p) => ({ ...p, study_classification_id: e.target.value }))}
            >
              {classifications.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField variant="standard" size="small" label="Estudio a Realizar" required fullWidth
            value={form.study_type}
            onChange={(e) => setForm((p) => ({ ...p, study_type: e.target.value }))}
            inputProps={{ style: { fontSize: '0.75rem' } }} />

          <TextField variant="standard" size="small" label="Observaciones" multiline rows={2} fullWidth
            value={form.observations}
            onChange={(e) => setForm((p) => ({ ...p, observations: e.target.value }))}
            inputProps={{ style: { fontSize: '0.75rem' } }} />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Archivo PDF
            </Typography>
            <Button variant="outlined" size="small" component="label" sx={{ fontSize: '0.7rem' }}>
              {file ? file.name : 'Seleccionar archivo'}
              <input type="file" hidden accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSave} variant="outlined" color="success" disabled={saving}>
          {saving ? 'Guardando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceOrderModal;
