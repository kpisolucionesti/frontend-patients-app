import React, { useCallback, useMemo, useState } from 'react';
import { Box, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { Add, Block, CheckCircle, Edit, Lock, AdminPanelSettings, History } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import UserFormModal from './UserFormModal';
import UserPasswordModal from './UserPasswordModal';
import UserPermissionModal from './UserPermissionModal';
import UserConfirmModal from './UserConfirmModal';
import UserCasesModal from './UserCasesModal';

const UsersList = () => {
  const { data: users, loading, refetch } = useFetch(
    () => BackendAPI.users.getAll(), [],
  );
  const permissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');

  const [tab, setTab] = useState('activos');
  const [formModal, setFormModal] = useState(null);
  const [passwordModal, setPasswordModal] = useState(null);
  const [permissionModal, setPermissionModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [casesModal, setCasesModal] = useState(null);

  const activeUsers = useMemo(
    () => (users || []).filter((u) => u.status !== 'suspended'),
    [users],
  );

  const suspendedUsers = useMemo(
    () => (users || []).filter((u) => u.status === 'suspended'),
    [users],
  );

  const currentData = tab === 'activos' ? activeUsers : suspendedUsers;

  const handleToggleStatus = useCallback(async (user) => {
    try {
      const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
      await BackendAPI.users.update({ id: user.id, status: newStatus });
      refetch();
    } catch {
      alert("Error al cambiar estado del usuario");
    }
  }, [refetch]);

  const handleSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const columns = useMemo(
    () => [
      { header: 'Usuario', accessorKey: 'username', size: 120 },
      { header: 'Nombre', accessorFn: (row) => `${row.name || ''} ${row.lastname || ''}`.trim(), grow: true },
      { header: 'Correo', accessorKey: 'email', size: 250 },
      { header: 'Perfil', accessorKey: 'profile_name', size: 150 },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: currentData,
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
      const isAdmin = row.original.username === 'admin';
      return (
        <>
          {permissions.includes('usuarios.edit') && (
            <Tooltip title="Editar usuario" arrow>
              <IconButton color="warning" size="small" onClick={() => setFormModal(row.original)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {permissions.includes('usuarios.change_password') && (
            <Tooltip title="Cambiar contrasena" arrow>
              <IconButton color="info" size="small" onClick={() => setPasswordModal(row.original)}>
                <Lock fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {permissions.includes('usuarios.manage_permissions') && !isAdmin && (
            <Tooltip title="Permisos" arrow>
              <IconButton color="primary" size="small" onClick={() => setPermissionModal(row.original)}>
                <AdminPanelSettings fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {permissions.includes('historial.view') && (
            <Tooltip title="Ver casos creados" arrow>
              <IconButton color="info" size="small" onClick={() => setCasesModal(row.original)}>
                <History fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {permissions.includes('usuarios.suspend') && !isAdmin && (
            <Tooltip title={tab === 'activos' ? 'Suspender usuario' : 'Reactivar usuario'} arrow>
              <IconButton
                color={tab === 'activos' ? 'error' : 'success'}
                size="small"
                onClick={() => setConfirmModal({ user: row.original, action: tab === 'activos' ? 'suspend' : 'reactivate' })}
              >
                {tab === 'activos' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </>
      );
    },
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {tab === 'activos' && permissions.includes('usuarios.create') && (
            <Tooltip title="Agregar usuario" arrow>
              <IconButton color="primary" onClick={() => setFormModal({})}>
                <Add />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
      [tab, permissions],
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Activos (${activeUsers.length})`} value="activos" />
          <Tab label={`Suspendidos (${suspendedUsers.length})`} value="suspendidos" />
        </Tabs>
      </Box>
      <MaterialReactTable table={table} />

      {formModal && (
        <UserFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          user={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
      {passwordModal && (
        <UserPasswordModal
          open={!!passwordModal}
          onClose={() => setPasswordModal(null)}
          user={passwordModal}
        />
      )}
      {permissionModal && (
        <UserPermissionModal
          open={!!permissionModal}
          onClose={() => setPermissionModal(null)}
          user={permissionModal}
        />
      )}
      {casesModal && (
        <UserCasesModal
          open={!!casesModal}
          onClose={() => setCasesModal(null)}
          user={casesModal}
        />
      )}
      {confirmModal && (
        <UserConfirmModal
          open={!!confirmModal}
          onClose={() => setConfirmModal(null)}
          user={confirmModal.user}
          action={confirmModal.action}
          onConfirm={(user) => {
            handleToggleStatus(user);
            setConfirmModal(null);
          }}
        />
      )}
    </>
  );
};

export default UsersList;
