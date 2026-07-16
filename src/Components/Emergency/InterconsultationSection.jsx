import { Autocomplete, Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const InterconsultationForm = ({ inter, index, doctors, onUpdate, onRemove }) => (
  <Box sx={{ p: 0.75, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
      <Typography variant="caption" fontWeight={600} color="text.secondary">
        Interconsulta #{index + 1}
      </Typography>
      <IconButton size="small" color="error" onClick={() => onRemove(inter._key)}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Stack>
    <Stack spacing={0.5}>
      <Autocomplete
        size="small" fullWidth
        options={doctors || []}
        getOptionLabel={(option) => `${option.name}${option.speciality ? ` (${option.speciality})` : ''}`}
        value={(doctors || []).find((d) => d.id === inter.doctor_requested_id) || null}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        onChange={(_e, newValue) => onUpdate(inter._key, 'doctor_requested_id', newValue ? newValue.id : null)}
        renderInput={(params) => (
          <TextField variant="standard" {...params} size="small" label="Médico Solicitado" required />
        )}
      />
      <TextField
        variant="standard"
        size="small" fullWidth
        label="Motivo"
        value={inter.reason}
        onChange={(e) => onUpdate(inter._key, 'reason', e.target.value)}
      />
      <TextField
        variant="standard"
        size="small" fullWidth multiline rows={1}
        label="Observaciones"
        value={inter.observations}
        onChange={(e) => onUpdate(inter._key, 'observations', e.target.value)}
      />
    </Stack>
  </Box>
);

const InterconsultationSection = ({ interconsultations, doctors, onAdd, onUpdate, onRemove }) => (
  <Box>
    <Typography variant="caption" fontWeight={600} color="info.dark" sx={{ mb: 0.5, display: 'block' }}>
      INTERCONSULTAS
    </Typography>
    <Stack spacing={0.75}>
      {interconsultations.map((ic, i) => (
        <InterconsultationForm key={ic._key} inter={ic} index={i} doctors={doctors} onUpdate={onUpdate} onRemove={onRemove} />
      ))}
      <Button
        variant="text" size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={onAdd}
        sx={{ textTransform: 'none', fontSize: '0.7rem', alignSelf: 'flex-start', p: 0, minHeight: 0 }}
      >
        Agregar Interconsulta
      </Button>
    </Stack>
  </Box>
);

export default InterconsultationSection;
