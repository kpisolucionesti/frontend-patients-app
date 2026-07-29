import { useCallback, useEffect, useState } from 'react';
import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, IconButton } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { BackendAPI } from '../../services/BackendApi';
import { useLabParameters } from '../../hooks/useApiData';

const LabParameterGroupFormModal = ({ open, onClose, group, onSaved }) => {
  const isEdit = !!group;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [params, setParams] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: allGlobalParams } = useLabParameters({ enabled: open });

  const globalOptions = (allGlobalParams || []).map((p) => ({
    label: p.name,
    name: p.name,
    unit: p.unit || '',
    abbreviation: p.abbreviation || '',
    reference_ranges: p.reference_ranges || {},
    id: p.id,
  }));

  useEffect(() => {
    if (open) {
      setName(group?.name || '');
      setDescription(group?.description || '');
      setParams(
        (group?.lab_parameters || []).map((p) => ({
          _key: Math.random().toString(36).slice(2),
          id: p.id,
          name: p.name,
          abbreviation: p.abbreviation || '',
          unit: p.unit || '',
        })),
      );
    }
  }, [open, group]);

  const addParam = useCallback(() => {
    setParams((prev) => [...prev, { _key: Math.random().toString(36).slice(2), id: undefined, name: '', abbreviation: '', unit: '' }]);
  }, []);

  const removeParam = useCallback((key) => {
    setParams((prev) => prev.filter((p) => p._key !== key));
  }, []);

  const updateParam = useCallback((key, field, val) => {
    setParams((prev) => prev.map((p) => (p._key === key ? { ...p, [field]: val } : p)));
  }, []);

  const handleParamSelect = useCallback((key, option) => {
    if (!option) return;
    if (typeof option === 'object' && option.id) {
      updateParam(key, 'id', option.id);
      updateParam(key, 'name', option.name);
      updateParam(key, 'abbreviation', option.abbreviation || '');
      updateParam(key, 'unit', option.unit || '');
    } else if (typeof option === 'string') {
      updateParam(key, 'id', undefined);
      updateParam(key, 'name', option);
    }
  }, [updateParam]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        lab_parameters_attributes: params.map((p, idx) => ({
          id: p.id || undefined,
          name: p.name.trim(),
          abbreviation: p.abbreviation.trim(),
          unit: p.unit.trim(),
          sort_order: idx,
          _destroy: false,
        })),
      };
      if (isEdit) {
        await BackendAPI.labParameters.updateGroup(group.id, payload);
      } else {
        await BackendAPI.labParameters.createGroup(payload);
      }
      onSaved?.();
      onClose();
    } catch {
      // handled by interceptor
    }
    setSaving(false);
  }, [name, description, params, isEdit, group, onSaved, onClose]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem' }}>
        {isEdit ? 'EDITAR GRUPO' : 'AGREGAR GRUPO'}
      </DialogTitle>
      <DialogContent>
        <TextField
          variant="standard"
          fullWidth
          required
          label="Nombre del Grupo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="standard"
          fullWidth
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <strong style={{ fontSize: '0.85rem' }}>Parámetros del grupo</strong>
          <Button size="small" startIcon={<Add />} onClick={addParam} variant="outlined" sx={{ fontSize: '0.75rem' }}>
            Agregar
          </Button>
        </Box>

        {params.map((p) => {
          const matchedOption = globalOptions.find((o) => o.name === p.name);
          return (
            <Box key={p._key} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <Autocomplete
                options={globalOptions}
                getOptionLabel={(o) => {
                  if (typeof o === 'object' && o.abbreviation) return `${o.abbreviation} - ${o.name}`;
                  return o.label || o;
                }}
                value={matchedOption || p.name}
                onChange={(_, val) => {
                  if (typeof val === 'object' && val?.id) {
                    handleParamSelect(p._key, val);
                  } else {
                    handleParamSelect(p._key, val || '');
                  }
                }}
                freeSolo
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Nombre" sx={{ flex: 2 }} />
                )}
                sx={{ flex: 2 }}
                size="small"
              />
              <TextField
                variant="standard"
                size="small"
                label="Abrev."
                value={p.abbreviation}
                onChange={(e) => updateParam(p._key, 'abbreviation', e.target.value)}
                sx={{ flex: 0.7 }}
              />
              <TextField
                variant="standard"
                size="small"
                label="Unidad"
                value={p.unit}
                onChange={(e) => updateParam(p._key, 'unit', e.target.value)}
                sx={{ flex: 0.7 }}
              />
              <IconButton size="small" onClick={() => removeParam(p._key)} color="error">
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">Cancelar</Button>
        <Button onClick={handleSave} variant="outlined" color="success" disabled={saving || !name.trim()}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabParameterGroupFormModal;
