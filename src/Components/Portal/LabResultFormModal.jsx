import { useState, useEffect, useCallback } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Box, Typography, Autocomplete, createFilterOptions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useLabParameters } from '../../hooks/useApiData';

const filter = createFilterOptions();

const LabResultFormModal = ({ open, onClose, onSave, saving, emergencyId, editResult }) => {
  const { show } = useSnackbar();
  const [resultDate, setResultDate] = useState('');
  const [notes, setNotes] = useState('');
  const [values, setValues] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const { data: allParams, refetch: refetchParams } = useLabParameters({ enabled: open });
  const { data: groups } = useFetch(
    () => open ? BackendAPI.labParameters.getGroups() : Promise.resolve([]),
    [open],
  );

  const predefinedOptions = (allParams || []).map((p) => ({
    label: p.abbreviation ? `${p.abbreviation} - ${p.name}` : p.name,
    name: p.name,
    unit: p.unit || '',
    abbreviation: p.abbreviation || '',
    reference_ranges: p.reference_ranges || {},
    id: p.id,
  }));

  useEffect(() => {
    if (open) {
      refetchParams();
      if (editResult) {
        setResultDate(editResult.result_date?.slice(0, 16) || '');
        setNotes(editResult.notes || '');
        setSelectedGroup(null);
        setValues(
          (editResult.lab_result_values || []).map((v) => ({
            _key: Math.random().toString(36).slice(2),
            id: v.id,
            parameter_name: v.parameter_name,
            value: v.value || '',
            unit: v.unit || '',
            reference_range: v.reference_range || '',
          })),
        );
      } else {
        setResultDate(new Date().toISOString().slice(0, 16));
        setNotes('');
        setSelectedGroup(null);
        setValues([]);
      }
    }
  }, [open, editResult, refetchParams]);

  const rangeToDisplay = useCallback((ranges) => {
    const r = ranges?.male;
    if (!r?.type) return '';
    if (r.type === 'range') return `${r.min}-${r.max}`;
    if (r.type === 'inequality') return `${r.comparator}${r.value}`;
    return r.value || '';
  }, []);

  const handleGroupChange = useCallback((_, group) => {
    setSelectedGroup(group);
    if (!group) return;
    const groupParams = group.lab_parameters || [];
    if (groupParams.length === 0) return;

    if (values.some((v) => v.parameter_name)) {
      if (!window.confirm('¿Cargar los parámetros del grupo? Se reemplazarán los valores actuales.')) return;
    }

    setValues(
      groupParams.map((p) => ({
        _key: Math.random().toString(36).slice(2),
        parameter_name: p.name,
        value: '',
        unit: p.unit || '',
        reference_range: rangeToDisplay(p.reference_ranges) || '',
      })),
    );
  }, [values, rangeToDisplay]);

  const handleParamChange = useCallback(async (key, val) => {
    if (!val) return;

    if (typeof val === 'object' && val.id) {
      const displayRange = rangeToDisplay(val.reference_ranges);
      setValues((prev) => prev.map((v) =>
        v._key === key
          ? { ...v, parameter_name: val.name, unit: val.unit || v.unit, reference_range: displayRange || v.reference_range }
          : v
      ));
    } else if (typeof val === 'object' && val.isNew) {
      try {
        const created = await BackendAPI.labParameters.create({ name: val.name.trim() });
        show(`Parámetro "${created.name}" creado`, 'success');
        await refetchParams();
        const displayRange = rangeToDisplay(created.reference_ranges);
        setValues((prev) => prev.map((v) =>
          v._key === key
            ? { ...v, parameter_name: created.name, unit: created.unit || '', reference_range: displayRange || '' }
            : v
        ));
      } catch {
        show('Error al crear el parámetro', 'error');
        setValues((prev) => prev.map((v) =>
          v._key === key ? { ...v, parameter_name: val.name } : v
        ));
      }
    } else {
      setValues((prev) => prev.map((v) =>
        v._key === key ? { ...v, parameter_name: val } : v
      ));
    }
  }, [show, refetchParams, rangeToDisplay]);

  const handleValueChange = useCallback((key, field, val) => {
    setValues((prev) => prev.map((v) => (v._key === key ? { ...v, [field]: val } : v)));
  }, []);

  const addRow = useCallback(() => {
    setValues((prev) => [
      ...prev,
      { _key: Math.random().toString(36).slice(2), parameter_name: '', value: '', unit: '', reference_range: '' },
    ]);
  }, []);

  const removeRow = useCallback((key) => {
    setValues((prev) => prev.filter((v) => v._key !== key));
  }, []);

  const handleSubmit = () => {
    const payload = {
      result_date: resultDate,
      notes,
      lab_result_values_attributes: values.map((v) => ({
        id: v.id || undefined,
        parameter_name: v.parameter_name,
        value: v.value,
        unit: v.unit,
        reference_range: v.reference_range,
        _destroy: false,
      })),
    };
    onSave(payload);
  };

  return (
    <Dialog fullWidth maxWidth="lg" open={open} onClose={onClose}>
      <DialogTitle>
        {editResult ? 'EDITAR RESULTADO DE LABORATORIO' : 'NUEVO RESULTADO DE LABORATORIO'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            variant="standard"
            type="datetime-local"
            label="Fecha del resultado"
            value={resultDate}
            onChange={(e) => setResultDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 220 }}
          />
          <TextField
            variant="standard"
            fullWidth
            label="Notas"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={1}
          />
        </Box>

        {!editResult && (
          <Autocomplete
            options={groups || []}
            getOptionLabel={(o) => o.name}
            value={selectedGroup}
            onChange={handleGroupChange}
            renderInput={(params) => (
              <TextField {...params} variant="standard" label="Cargar grupo de parámetros" />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            sx={{ mb: 2 }}
          />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>Valores</Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addRow} variant="outlined" sx={{ fontSize: '0.75rem' }}>
            Agregar parámetro
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', px: 1 }}>
            <Typography sx={{ width: 200, fontSize: '0.75rem', fontWeight: 600 }}>Parámetro</Typography>
            <Typography sx={{ width: 120, fontSize: '0.75rem', fontWeight: 600 }}>Valor</Typography>
            <Typography sx={{ width: 100, fontSize: '0.75rem', fontWeight: 600 }}>Unidad</Typography>
            <Typography sx={{ width: 130, fontSize: '0.75rem', fontWeight: 600 }}>Rango Ref.</Typography>
            <Box sx={{ width: 40 }} />
          </Box>
          {values.map((v) => (
            <Box key={v._key} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Autocomplete
                options={predefinedOptions}
                getOptionLabel={(o) => o.label || o}
                value={predefinedOptions.find((o) => o.name === v.parameter_name) || v.parameter_name}
                onChange={(_, val) => handleParamChange(v._key, val)}
                filterOptions={(options, params) => {
                  const filtered = filter(options, params);
                  const { inputValue } = params;
                  const exists = options.some((o) => o.name.toLowerCase() === inputValue.toLowerCase());
                  if (inputValue.trim() && !exists) {
                    filtered.push({
                      isNew: true,
                      label: `+ Crear "${inputValue.trim()}" como nuevo parámetro`,
                      name: inputValue.trim(),
                    });
                  }
                  return filtered;
                }}
                freeSolo
                renderInput={(params) => (
                  <TextField {...params} variant="standard" placeholder="Parámetro" sx={{ width: 200 }} />
                )}
                sx={{ width: 200 }}
                size="small"
              />
              <TextField
                variant="standard"
                size="small"
                value={v.value}
                onChange={(e) => handleValueChange(v._key, 'value', e.target.value)}
                sx={{ width: 120 }}
                placeholder="Valor"
              />
              <TextField
                variant="standard"
                size="small"
                value={v.unit}
                onChange={(e) => handleValueChange(v._key, 'unit', e.target.value)}
                sx={{ width: 100 }}
                placeholder="Unidad"
              />
              <TextField
                variant="standard"
                size="small"
                value={v.reference_range}
                onChange={(e) => handleValueChange(v._key, 'reference_range', e.target.value)}
                sx={{ width: 130 }}
                placeholder="Rango ref."
              />
              <IconButton size="small" onClick={() => removeRow(v._key)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSubmit} variant="outlined" color="success" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabResultFormModal;
