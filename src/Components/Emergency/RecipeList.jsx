import { useState, useEffect } from 'react';
import {
  Box, Button, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Typography, Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 0.5 }}>
          RECETAS
        </Typography>
        {!readOnly && (
          <Button size="small" variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAdd}
            sx={{ textTransform: 'none', fontSize: '0.7rem', minWidth: 0 }}>
            Agregar Receta
          </Button>
        )}
      </Box>

      {loading ? (
        <Typography variant="caption" color="text.secondary">Cargando...</Typography>
      ) : recipes.length === 0 ? (
        <Typography variant="caption" color="text.disabled">Sin recetas registradas</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Medicamento</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Dosis</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Frecuencia</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Duración</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Vía</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Médico</TableCell>
                {!readOnly && <TableCell sx={{ fontWeight: 600, fontSize: '0.65rem', py: 0.5 }}>Acción</TableCell>}
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
                    <TableCell sx={{ py: 0.5 }}>
                      {r.doctor_id === loggedDoctorId && (
                        <>
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
                        </>
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
    </Box>
  );
};

export default RecipeList;
