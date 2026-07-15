import React, { useCallback, useMemo, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Add, Edit, Delete, People } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import ProfileFormModal from './ProfileFormModal';
import ProfileUsersModal from './ProfileUsersModal';

const ProfilesList = () => {
  const { data: profiles, loading, refetch } = useFetch(
    () => BackendAPI.profiles.getAll(), [],
  );
  const permissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');

  const [formModal, setFormModal] = useState(null);
  const [usersModal, setUsersModal] = useState(null);

  const handleSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDelete = useCallback(async (profile) => {
    if (!window.confirm(`Eliminar el perfil "${profile.name}"?`)) return;
    try {
      await BackendAPI.profiles.delete(profile.id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar perfil');
    }
  }, [refetch]);

  const columns = useMemo(
    () => [
      { header: 'Nombre', accessorKey: 'name', grow: true },
      { header: 'Descripcion', accessorKey: 'description', size: 250 },
      { header: 'Usuarios', accessorKey: 'users_count', size: 80 },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: profiles || [],
    layoutMode: 'grid',
    enableEditing: false,
    enableFullScreenToggle: false,
    enableSorting: true,
    enableStickyHeader: true,
    enableHiding: false,
    enableGlobalFilter: true,
    enableDensityToggle: false,
    enableRowActions: true,
    renderRowActions: ({ row }) => {
      const isProtectedProfile = ['Administrador', 'User'].includes(row.original.name);
      return (
        <>
          <Tooltip title="Ver usuarios" arrow>
            <IconButton color="info" size="small" onClick={() => setUsersModal(row.original)}>
              <People fontSize="small" />
            </IconButton>
          </Tooltip>
          {permissions.includes('perfiles.edit') && (
            <Tooltip title="Editar perfil" arrow>
              <IconButton color="warning" size="small" onClick={() => setFormModal(row.original)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {permissions.includes('perfiles.delete') && !isProtectedProfile && (
            <Tooltip title="Eliminar perfil" arrow>
              <IconButton color="error" size="small" onClick={() => handleDelete(row.original)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {permissions.includes('perfiles.create') && (
            <Tooltip title="Agregar perfil" arrow>
              <IconButton color="primary" onClick={() => setFormModal({})}>
                <Add />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
      [permissions],
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <>
      <MaterialReactTable table={table} />
      {formModal && (
        <ProfileFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          profile={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
      {usersModal && (
        <ProfileUsersModal
          open={!!usersModal}
          onClose={() => setUsersModal(null)}
          profile={usersModal}
        />
      )}
    </>
  );
};

export default ProfilesList;
