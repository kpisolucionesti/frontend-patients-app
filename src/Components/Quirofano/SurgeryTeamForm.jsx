import { useState } from 'react';
import {
  Box, Button, TextField, MenuItem, IconButton, Typography,
  List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { BackendAPI } from '../../services/BackendApi';
import { useDoctors } from '../../hooks/useApiData';

const ROLES = [
  { value: 'surgeon', label: 'Cirujano' },
  { value: 'assistant', label: 'Asistente' },
  { value: 'anesthesiologist', label: 'Anestesiólogo' },
  { value: 'nurse', label: 'Enfermero(a)' },
  { value: 'perfusionist', label: 'Perfusionista' },
];

export default function SurgeryTeamForm({ surgeryId, readOnly = false }) {
  const { data: doctors = [] } = useDoctors();
  const [members, setMembers] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState(null);



  const handleAdd = async () => {
    if (!selectedDoctor || !selectedRole) return;
    try {
      const member = await BackendAPI.surgeryTeam.create({
        surgery_id: surgeryId,
        doctor_id: selectedDoctor,
        role: selectedRole
      });
      setMembers(prev => [...prev, member]);
      setSelectedDoctor('');
      setSelectedRole('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al agregar miembro');
    }
  };

  const handleRemove = async (id) => {
    try {
      await BackendAPI.surgeryTeam.destroy(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch {
      setError('Error al eliminar miembro');
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Equipo Quirúrgico</Typography>
      {!readOnly && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-end' }}>
          <TextField select variant="standard" label="Doctor" value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)} sx={{ minWidth: 200 }} size="small">
            {(doctors || []).map(d =>
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            )}
          </TextField>
          <TextField select variant="standard" label="Rol" value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)} sx={{ minWidth: 150 }} size="small">
            {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
          </TextField>
          <Button variant="contained" size="small" startIcon={<AddIcon />}
            onClick={handleAdd} disabled={!selectedDoctor || !selectedRole}>
            Agregar
          </Button>
        </Box>
      )}
      {error && <Typography color="error" variant="caption">{error}</Typography>}
      <List dense>
        {members.map(m => (
          <ListItem key={m.id}>
            <ListItemText
              primary={m.doctor?.name || 'Doctor'}
              secondary={ROLES.find(r => r.value === m.role)?.label || m.role}
            />
            {!readOnly && (
              <ListItemSecondaryAction>
                <IconButton edge="end" size="small" onClick={() => handleRemove(m.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
