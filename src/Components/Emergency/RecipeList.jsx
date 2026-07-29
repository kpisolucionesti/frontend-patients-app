import { useState, useEffect, useMemo } from 'react';
import { Box, Button, IconButton, Paper, Typography, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MedicationIcon from '@mui/icons-material/Medication';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import RecipeFormModal from './RecipeFormModal';
import { BackendAPI } from '../../services/BackendApi';
import { MRT_DEFAULTS } from '../../shared/ui/mrt-config';

const RecipeList = ({ emergencyId, readOnly, loggedDoctorId }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadRecipes = async () => { if (!emergencyId) return; setLoading(true); try { setRecipes(await BackendAPI.recipes.getAll(emergencyId) || []); } catch { setRecipes([]); } setLoading(false); };
  useEffect(() => { if (emergencyId) loadRecipes(); }, [emergencyId]);

  const handleOpenAdd = () => { setEditing(null); setModalOpen(true); };
  const handleOpenEdit = (r) => { setEditing(r); setModalOpen(true); };
  const handleSave = async (fd) => { setSaving(true); try { editing ? await BackendAPI.recipes.update(emergencyId, editing.id, fd) : await BackendAPI.recipes.create(emergencyId, fd); setModalOpen(false); setEditing(null); await loadRecipes(); } catch { alert('Error al guardar'); } setSaving(false); };
  const handleDelete = async (id) => { try { await BackendAPI.recipes.destroy(emergencyId, id); await loadRecipes(); } catch { alert('Error al eliminar'); } };

  const columns = useMemo(() => [
    { accessorKey: 'medication', header: 'Medicamento', size: 150 },
    { accessorKey: 'dosage', header: 'Dosis', size: 100, Cell: ({ row }) => row.original.dosage || '-' },
    { accessorKey: 'frequency', header: 'Frecuencia', size: 100, Cell: ({ row }) => row.original.frequency || '-' },
    { accessorKey: 'duration', header: 'Duracion', size: 80, Cell: ({ row }) => row.original.duration || '-' },
    { accessorKey: 'route', header: 'Via', size: 80, Cell: ({ row }) => row.original.route || '-' },
    { accessorKey: 'doctor.name', header: 'Medico', size: 130, Cell: ({ row }) => row.original.doctor?.name || '-' },
  ], []);

  const table = useMaterialReactTable({
    ...MRT_DEFAULTS, columns, data: recipes, state: { isLoading: loading }, enableRowActions: !readOnly, positionActionsColumn: 'last',
    renderRowActions: ({ row }) => row.original.doctor_id === loggedDoctorId ? (
      <Box sx={{ display: 'flex', gap: 0.25 }}>
        <Tooltip title="Editar" arrow><IconButton size="small" onClick={() => handleOpenEdit(row.original)} sx={{ p: 0.15 }}><EditIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
        <Tooltip title="Eliminar" arrow><IconButton size="small" onClick={() => handleDelete(row.original.id)} sx={{ p: 0.15 }}><DeleteIcon sx={{ fontSize: 14, color: 'error.main' }} /></IconButton></Tooltip>
      </Box>
    ) : null,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <MedicationIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.75rem' }}>RECETAS</Typography>
        {!readOnly && <Button size="small" variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAdd} sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}>Agregar Receta</Button>}
      </Box>
    ),
  });

  return (
    <Paper sx={{ p: 1.5 }}>
      <MaterialReactTable table={table} />
      <RecipeFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving} initialValues={editing} />
    </Paper>
  );
};

export default RecipeList;
