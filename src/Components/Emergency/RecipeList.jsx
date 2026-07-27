import { useState, useEffect } from 'react';
import {
  Box, Button, CircularProgress, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Typography, Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MedicationIcon from '@mui/icons-material/Medication';
import RecipeFormModal from './RecipeFormModal';
import { BackendAPI } from '../../services/BackendApi';

const RecipeList = ({ emergencyId, readOnly, loggedDoctorId }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadRecipes = async () => {
    if (!emergencyId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.recipes.getAll(emergencyId);
      setRecipes(data || []);
    } catch {
      setRecipes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (emergencyId) loadRecipes();
  }, [emergencyId]);

  const handleOpenAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setEditing(r);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editing) {
        await BackendAPI.recipes.update(emergencyId, editing.id, formData);
      } else {
        await BackendAPI.recipes.create(emergencyId, formData);
      }
      setModalOpen(false);
      setEditing(null);
      await loadRecipes();
    } catch {
      alert('Error al guardar la receta. Verifique que el backend esté disponible.');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try {
      await BackendAPI.recipes.destroy(emergencyId, id);
      await loadRecipes();
    } catch {
      alert('Error al eliminar la receta.');
    }
  };

  return (
    <Paper sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: recipes.length > 0 ? 1 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <MedicationIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.75rem', letterSpacing: '0.03em' }}>
            RECETAS
          </Typography>
        </Box>
        {!readOnly && (
          <Button size="small" variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAdd}
            sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}>
            Agregar Receta
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
          <CircularProgress size={18} />
        </Box>
      ) : recipes.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 1, fontSize: '0.7rem' }}>
          Sin recetas registradas
        </Typography>
      ) : (
        <TableContainer sx={{ borderRadius: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Medicamento</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Dosis</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Frecuencia</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Duración</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Vía</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Médico</TableCell>
                {!readOnly && <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: 0.5, width: 72 }}>Acción</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {recipes.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.medication}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.dosage || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.frequency || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.duration || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.route || '—'}</TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>{r.doctor?.name || '—'}</TableCell>
                  {!readOnly && (
                    <TableCell sx={{ py: 0.5, width: 72 }}>
                      {r.doctor_id === loggedDoctorId && (
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          <Tooltip title="Editar" arrow>
                            <IconButton size="small" onClick={() => handleOpenEdit(r)} sx={{ p: 0.15 }}>
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar" arrow>
                            <IconButton size="small" onClick={() => handleDelete(r.id)} sx={{ p: 0.15 }}>
                              <DeleteIcon sx={{ fontSize: 14, color: '#e53935' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <RecipeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
        initialValues={editing}
      />
    </Paper>
  );
};

export default RecipeList;
