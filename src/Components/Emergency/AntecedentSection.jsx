import { Box, Button, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import moment from 'moment';

const AntecedentForm = ({ antecedent, index, onUpdate, onRemove }) => (
  <Box sx={{ p: 0.5, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ fontSize: '0.65rem' }}>
        #{index + 1}
      </Typography>
      <IconButton size="small" color="error" onClick={() => onRemove(antecedent._key)} sx={{ p: 0.25 }}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Stack>
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        <TextField
          variant="standard"
          size="small" fullWidth required
          label="Condición"
          value={antecedent.condition_type}
          onChange={(e) => onUpdate(antecedent._key, 'condition_type', e.target.value)}
          sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' }, '& .MuiInputLabel-root': { fontSize: '0.7rem' } }}
        />
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DatePicker
            format="DD/MM/YYYY"
            label="Fecha"
            value={antecedent.diagnosed_at ? moment(antecedent.diagnosed_at, 'YYYY-MM-DD') : null}
            onChange={(v) => onUpdate(antecedent._key, 'diagnosed_at', v ? moment(v).format('YYYY-MM-DD') : null)}
            slotProps={{ textField: { variant: 'standard', size: 'small', sx: { width: 120, '& .MuiInputBase-input': { fontSize: '0.7rem' }, '& .MuiInputLabel-root': { fontSize: '0.7rem' } } } }}
          />
        </LocalizationProvider>
      </Stack>
      <TextField
        variant="standard"
        size="small" fullWidth
        label="Descripción"
        value={antecedent.description}
        onChange={(e) => onUpdate(antecedent._key, 'description', e.target.value)}
        sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' }, '& .MuiInputLabel-root': { fontSize: '0.7rem' } }}
      />
      <TextField
        variant="standard"
        size="small" fullWidth
        label="Medicación"
        value={antecedent.medication}
        onChange={(e) => onUpdate(antecedent._key, 'medication', e.target.value)}
        sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' }, '& .MuiInputLabel-root': { fontSize: '0.7rem' } }}
      />
      <TextField
        variant="standard"
        size="small" fullWidth multiline rows={1}
        label="Notas"
        value={antecedent.notes}
        onChange={(e) => onUpdate(antecedent._key, 'notes', e.target.value)}
        sx={{ '& .MuiInputBase-input': { fontSize: '0.7rem' }, '& .MuiInputLabel-root': { fontSize: '0.7rem' } }}
      />
    </Stack>
  </Box>
);

const AntecedentSection = ({ antecedents, onAdd, onUpdate, onRemove }) => (
  <Paper sx={{ boxShadow: 3, borderRadius: 1, p: 2 }}>
    <Typography variant="caption" fontWeight={600} color="secondary.dark" sx={{ mb: 1, display: 'block' }}>
      ANTECEDENTES
    </Typography>
    <Stack spacing={1.5}>
      {antecedents.map((a, i) => (
        <AntecedentForm key={a._key} antecedent={a} index={i} onUpdate={onUpdate} onRemove={onRemove} />
      ))}
      <Button
        variant="text" size="small"
        startIcon={<AddCircleOutlineIcon />}
        onClick={onAdd}
        sx={{ textTransform: 'none', fontSize: '0.7rem', alignSelf: 'flex-start', p: 0, minHeight: 0 }}
      >
        Agregar Antecedente
      </Button>
    </Stack>
  </Paper>
);

export default AntecedentSection;
