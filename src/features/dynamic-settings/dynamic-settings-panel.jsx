import { useState, useEffect, useCallback } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DynamicFormGroup from './dynamic-form-group';
import { dynamicSettingsApi } from '../../entities/dynamic-setting/api';
import { useSnackbar } from '../../hooks/useSnackbar';

const DynamicSettingsPanel = ({ category = 'general', companyId = null }) => {
  const { show } = useSnackbar();
  const [schema, setSchema] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const CATEGORY_TITLES = { seguridad: 'Seguridad', regional: 'Regional', ui: 'Interfaz', notificaciones: 'Notificaciones', general: 'Configuracion' };

  useEffect(() => {
    setLoading(true);
    dynamicSettingsApi.show(category, companyId)
      .then((data) => {
        setSchema(data.schema_definition);
        setValues(data.settings_data || {});
      })
      .catch(() => show('Error al cargar configuraciones', 'error'))
      .finally(() => setLoading(false));
  }, [category, companyId]);

  const handleFieldChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dynamicSettingsApi.update(category, companyId, values);
      show('Configuracion guardada', 'success');
    } catch {
      show('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  const groups = {};
  if (schema?.properties) {
    Object.entries(schema.properties).forEach(([key, prop]) => {
      const group = prop.ui?.group || 'General';
      if (!groups[group]) groups[group] = [];
      groups[group].push({ key, ...prop });
    });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem' }}>
        {CATEGORY_TITLES[category] || 'Configuracion'}
      </Typography>
      {Object.entries(groups).map(([groupName, fields]) => (
        <DynamicFormGroup
          key={groupName}
          label={groupName}
          fields={fields}
          values={values}
          onChange={handleFieldChange}
        />
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" size="small"
          startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
          onClick={handleSave} disabled={saving}
          sx={{ fontSize: '0.75rem', py: 0.25 }}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>
    </Box>
  );
};

export default DynamicSettingsPanel;
