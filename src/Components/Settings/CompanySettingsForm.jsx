import { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, TextField, Typography, Alert, Avatar } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { companySettingsApi } from '../../services/companySettingsApi';
import { useSnackbar } from '../../hooks/useSnackbar';

const CompanySettingsForm = () => {
  const [values, setValues] = useState({
    company_name: '',
    rif: '',
    address: '',
    city: '',
    state: '',
    country: 'UY',
    phone: '',
    email: '',
    website: '',
  });
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const { show: showSnackbar } = useSnackbar();

  useEffect(() => {
    (async () => {
      try {
        const data = await companySettingsApi.show();
        setValues((prev) => ({ ...prev, ...data, logo_url: undefined }));
        if (data.logo_url) setLogoUrl(data.logo_url);
      } catch { /* first time */ }
      setLoaded(true);
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => formData.append(`company_setting[${k}]`, v));
      if (logoFile) formData.append('company_setting[logo]', logoFile);
      await companySettingsApi.update(formData);
      showSnackbar('Identidad visual guardada', 'success');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }, [values, logoFile, showSnackbar]);

  if (!loaded) return null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem', mb: 3 }}>
          Identidad visual
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar variant="rounded" src={logoUrl} sx={{ width: 80, height: 80, bgcolor: 'primary.light', borderRadius: 1 }}>
              {values.company_name?.charAt(0) || 'E'}
            </Avatar>
            <Button variant="outlined" component="label" size="small" startIcon={<UploadIcon />}
              sx={{ fontSize: '0.7rem' }}>
              Subir Logo
              <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
            </Button>
          </Box>
          <TextField variant="standard" size="small" label="Nombre de la Institucion" name="company_name" value={values.company_name} onChange={handleChange} required />
          <TextField variant="standard" size="small" label="RIF / RUT" name="rif" value={values.rif} onChange={handleChange} />
          <TextField variant="standard" size="small" label="Direccion" name="address" value={values.address} onChange={handleChange} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField variant="standard" size="small" label="Ciudad" name="city" value={values.city} onChange={handleChange} sx={{ flex: 1 }} />
            <TextField variant="standard" size="small" label="Departamento / Estado" name="state" value={values.state} onChange={handleChange} sx={{ flex: 1 }} />
          </Box>
          <TextField variant="standard" size="small" label="Pais" name="country" value={values.country} onChange={handleChange} />
          <TextField variant="standard" size="small" label="Telefono" name="phone" value={values.phone} onChange={handleChange} />
          <TextField variant="standard" size="small" label="Email Institucional" name="email" value={values.email} onChange={handleChange} type="email" />
          <TextField variant="standard" size="small" label="Sitio Web" name="website" value={values.website} onChange={handleChange} placeholder="https://" />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleSave} disabled={saving}
              sx={{ fontSize: '0.75rem', py: 0.25, px: 1.5 }}>
              {saving ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CompanySettingsForm;
