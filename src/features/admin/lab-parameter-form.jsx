import { useCallback, useEffect, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Autocomplete, Select, MenuItem, FormControl, InputLabel, Box, Typography, Grid, IconButton, Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { BackendAPI } from '../../services/BackendApi';

const REF_TYPES = [
  { value: 'range', label: 'Rango' },
  { value: 'inequality', label: 'Desigualdad' },
  { value: 'categorical', label: 'Categórico' },
];

const INEQUALITY_OPTIONS = [
  { value: '<', label: 'Menor que (<)' },
  { value: '>', label: 'Mayor que (>)' },
  { value: '<=', label: 'Menor o igual (<=)' },
  { value: '>=', label: 'Mayor o igual (>=)' },
];

function rangeToForm(ranges) {
  if (!ranges || typeof ranges !== 'object') {
    return { male: { type: 'range', min: '', max: '' }, female: { type: 'range', min: '', max: '' } };
  }
  const toEntry = (s) => {
    if (!s || typeof s !== 'object') return { type: 'range', min: '', max: '' };
    return {
      type: s.type || 'range',
      min: s.min !== undefined && s.min !== null ? String(s.min) : '',
      max: s.max !== undefined && s.max !== null ? String(s.max) : '',
      comparator: s.comparator || '<',
      value: s.value !== undefined && s.value !== null ? String(s.value) : '',
      absolute: s.absolute || '',
    };
  };
  return {
    male: toEntry(ranges.male),
    female: toEntry(ranges.female),
  };
}

function formToRanges(form) {
  const toJson = (s) => {
    if (s.type === 'range') {
      return { type: 'range', min: parseFloat(s.min) || 0, max: parseFloat(s.max) || 0 };
    }
    if (s.type === 'inequality') {
      return { type: 'inequality', comparator: s.comparator || '<', value: parseFloat(s.value) || 0 };
    }
    return { type: 'categorical', value: s.absolute || '' };
  };
  return { male: toJson(form.male), female: toJson(form.female) };
}

const SexRefSection = ({ sex, label, data, onChange, onCopyFrom }) => (
  <Box sx={{ p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
      {onCopyFrom && (
        <Tooltip title="Copiar del otro sexo" arrow>
          <IconButton size="small" onClick={onCopyFrom}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
    <FormControl variant="standard" fullWidth size="small" sx={{ mb: 1 }}>
      <InputLabel>Tipo</InputLabel>
      <Select
        value={data.type}
        label="Tipo"
        onChange={(e) => onChange(sex, { ...data, type: e.target.value })}
      >
        {REF_TYPES.map((t) => (
          <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
    {data.type === 'range' && (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField variant="standard" label="Mín" type="number" size="small"
          value={data.min} onChange={(e) => onChange(sex, { ...data, min: e.target.value })}
          sx={{ flex: 1 }} />
        <TextField variant="standard" label="Máx" type="number" size="small"
          value={data.max} onChange={(e) => onChange(sex, { ...data, max: e.target.value })}
          sx={{ flex: 1 }} />
      </Box>
    )}
    {data.type === 'inequality' && (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <FormControl variant="standard" sx={{ flex: 1 }}>
          <InputLabel>Comparador</InputLabel>
          <Select
            value={data.comparator}
            label="Comparador"
            onChange={(e) => onChange(sex, { ...data, comparator: e.target.value })}
          >
            {INEQUALITY_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField variant="standard" label="Valor" type="number" size="small"
          value={data.value} onChange={(e) => onChange(sex, { ...data, value: e.target.value })}
          sx={{ flex: 1 }} />
      </Box>
    )}
    {data.type === 'categorical' && (
      <TextField variant="standard" label="Valor esperado" fullWidth size="small"
        value={data.absolute}
        onChange={(e) => onChange(sex, { ...data, absolute: e.target.value })} />
    )}
  </Box>
);

const LabParameterFormModal = ({ open, onClose, param, groups, classifications, onSaved }) => {
  const isEdit = !!param;
  const [values, setValues] = useState({
    name: '', unit: '', abbreviation: '', lab_parameter_group_id: '', clinical_study_classification_id: '',
    male: { type: 'range', min: '', max: '' },
    female: { type: 'range', min: '', max: '' },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const form = rangeToForm(param?.reference_ranges);
      setValues({
        name: param?.name || '',
        unit: param?.unit || '',
        abbreviation: param?.abbreviation || '',
        lab_parameter_group_id: param?.lab_parameter_group_id || '',
        clinical_study_classification_id: param?.clinical_study_classification_id || '',
        male: form.male,
        female: form.female,
      });
    }
  }, [open, param]);

  const selectedGroup = groups?.find((g) => g.id === values.lab_parameter_group_id) || null;
  const selectedClass = classifications?.find((c) => c.id === values.clinical_study_classification_id) || null;

  const handleSexChange = useCallback((sex, data) => {
    setValues((p) => ({ ...p, [sex]: data }));
  }, []);

  const handleCopyToFemale = useCallback(() => {
    setValues((p) => ({ ...p, female: { ...p.male } }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!values.name.trim() || !values.clinical_study_classification_id) return;
    setSaving(true);
    try {
      const payload = {
        name: values.name.trim(),
        unit: values.unit.trim(),
        abbreviation: values.abbreviation.trim(),
        reference_ranges: formToRanges(values),
        lab_parameter_group_id: values.lab_parameter_group_id || null,
        clinical_study_classification_id: values.clinical_study_classification_id || null,
      };
      if (isEdit) {
        await BackendAPI.labParameters.update(param.id, payload);
      } else {
        await BackendAPI.labParameters.create(payload);
      }
      onSaved?.();
      onClose();
    } catch {
      // handled by interceptor
    }
    setSaving(false);
  }, [values, isEdit, param, onSaved, onClose]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>
        {isEdit ? 'EDITAR PARÁMETRO' : 'AGREGAR PARÁMETRO'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <TextField
          variant="standard" fullWidth required label="Nombre"
          value={values.name}
          onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="standard" fullWidth label="Abreviatura"
          value={values.abbreviation}
          onChange={(e) => setValues((p) => ({ ...p, abbreviation: e.target.value }))}
          sx={{ mb: 2 }}
          placeholder="Ej: Hb"
        />
        <TextField
          variant="standard" fullWidth label="Unidad"
          value={values.unit}
          onChange={(e) => setValues((p) => ({ ...p, unit: e.target.value }))}
          sx={{ mb: 2 }}
        />
        <Autocomplete
          options={groups || []}
          getOptionLabel={(o) => o.name}
          value={selectedGroup}
          onChange={(_, v) => setValues((p) => ({ ...p, lab_parameter_group_id: v?.id || '' }))}
          renderInput={(params) => (
            <TextField {...params} variant="standard" label="Grupo (opcional)" />
          )}
          isOptionEqualToValue={(o, v) => o.id === v.id}
        />

        <Autocomplete
          options={classifications || []}
          getOptionLabel={(o) => o.name}
          value={selectedClass}
          onChange={(_, v) => setValues((p) => ({ ...p, clinical_study_classification_id: v?.id || '' }))}
          renderInput={(params) => (
            <TextField {...params} variant="standard" label="Clasificación" required sx={{ mt: 2 }} />
          )}
          isOptionEqualToValue={(o, v) => o.id === v.id}
        />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 3, mb: 1.5 }}>
          Valores de Referencia
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <SexRefSection
              sex="male" label="Masculino"
              data={values.male} onChange={handleSexChange}
            />
          </Grid>
          <Grid item xs={6}>
            <SexRefSection
              sex="female" label="Femenino"
              data={values.female} onChange={handleSexChange}
              onCopyFrom={handleCopyToFemale}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSave} variant="outlined" color="success" disabled={saving || !values.name.trim() || !values.clinical_study_classification_id}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabParameterFormModal;
