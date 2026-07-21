import React, { useCallback, useMemo, useState } from 'react';
import { Box, Chip, IconButton, Paper, Tab, Tabs, Tooltip } from '@mui/material';
import { Add, Block, CheckCircle, Edit, Lock, AdminPanelSettings, History, LockOpen } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import UserFormModal from './UserFormModal';
import UserPasswordModal from './UserPasswordModal';
import UserPermissionModal from './UserPermissionModal';
import UserActivityLogModal from './UserActivityLogModal';
import ConfirmActionModal from '../Commons/ConfirmActionModal';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';

const STATUS_LABELS = {
  suspend: { title: 'SUSPENDER USUARIO', confirm: 'Suspender', icon: 'Block' },
  reactivate: { title: 'REACTIVAR USUARIO', confirm: 'Reactivar', icon: 'CheckCircle' },
  block: { title: 'BLOQUEAR USUARIO', confirm: 'Bloquear', icon: 'Block' },
  unblock: { title: 'DESBLOQUEAR USUARIO', confirm: 'Desbloquear', icon: 'LockOpen' },
};

const UsersList = () => {
  const { data: users, loading, refetch } = useFetch(
    () => BackendAPI.users.getAll(), [],
  );
  const permissions = usePermissions();
  const canBlock = permissions.includes('usuarios.block');

  const [tab, setTab] = useState('activos');
  const [formModal, setFormModal] = useState(null);
  const [passwordModal, setPasswordModal] = useState(null);
  const [permissionModal, setPermissionModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [activityLogModal, setActivityLogModal] = useState(null);

  const activeUsers = useMemo(
    () => (users || []).filter((u) => u.status !== 'suspended' && !u.blocked_at && !u.locked_at),
    [users],
  );

  const blockedUsers = useMemo(
    () => (users || []).filter((u) => u.status !== 'suspended' && (u.blocked_at || u.locked_at)),
    [users],
  );

  const suspendedUsers = useMemo(
    () => (users || []).filter((u) => u.status === 'suspended'),
    [users],
  );

  const tabData = { activos: activeUsers, bloqueados: blockedUsers, suspendidos: suspendedUsers };
  const currentData = tabData[tab] || [];

  const handleToggleStatus = useCallback(async (user) => {
    try {
      const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
      await BackendAPI.users.update({ id: user.id, status: newStatus });
      refetch();
    } catch {
      alert("Error al cambiar estado del usuario");
    }
  }, [refetch]);

  const handleBlockToggle = useCallback(async (user) => {
    try {
      if (user.blocked_at || user.locked_at) {
        await BackendAPI.users.unblock(user.id);
      } else {
        await BackendAPI.users.block(user.id);
      }
      refetch();
    } catch {
      alert("Error al cambiar bloqueo del usuario");
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
      ...(tab === 'bloqueados' ? [{
        header: 'Motivo',
        accessorFn: (row) => row.blocked_at ? 'Bloqueo manual' : 'Auto-bloqueo',
        size: 130,
        Cell: ({ cell }) => {
          const isAuto = cell.row.original.locked_at && !cell.row.original.blocked_at;
          return (
            <Chip
              label={isAuto ? 'Auto-bloqueo' : 'Bloqueo manual'}
              size="small"
              color={isAuto ? 'warning' : 'error'}
              variant="outlined"
            />
          );
        },
      }] : []),
    ],
    [tab],
  );

  const table = useMaterialReactTable({
    columns,
    data: currentData,
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
    renderRowActions: ({ row }) => {
      const u = row.original;
      const isAdmin = u.username === 'admin';
      return (
        <>
          {permissions.includes('usuarios.edit') && (
            <Tooltip title="Editar usuario" arrow>
              <IconButton color="warning" size="small" onClick={() => setFormModal(u)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {permissions.includes('usuarios.change_password') && (
            <Tooltip title="Cambiar contrasena" arrow>
              <IconButton color="info" size="small" onClick={() => setPasswordModal(u)}>
                <Lock fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {permissions.includes('usuarios.manage_permissions') && !isAdmin && (
            <Tooltip title="Permisos" arrow>
              <IconButton color="primary" size="small" onClick={() => setPermissionModal(u)}>
                <AdminPanelSettings fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {permissions.includes('usuarios.view') && (
            <Tooltip title="Ver actividad" arrow>
              <IconButton color="info" size="small" onClick={() => setActivityLogModal(u)}>
                <History fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canBlock && !isAdmin && (tab === 'activos' || tab === 'bloqueados') && (
            <Tooltip title={tab === 'activos' ? 'Bloquear usuario' : 'Desbloquear usuario'} arrow>
              <IconButton
                color={tab === 'activos' ? 'error' : 'success'}
                size="small"
                onClick={() => setConfirmModal({ user: u, action: tab === 'activos' ? 'block' : 'unblock' })}
              >
                {tab === 'activos' ? <Block fontSize="small" /> : <LockOpen fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          {permissions.includes('usuarios.suspend') && !isAdmin && tab !== 'bloqueados' && (
            <Tooltip title={tab === 'activos' ? 'Suspender usuario' : 'Reactivar usuario'} arrow>
              <IconButton
                color={tab === 'activos' ? 'error' : 'success'}
                size="small"
                onClick={() => setConfirmModal({ user: u, action: tab === 'activos' ? 'suspend' : 'reactivate' })}
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

  const handleConfirm = useCallback(() => {
    if (!confirmModal) return;
    const { user, action } = confirmModal;
    if (action === 'block') {
      handleBlockToggle(user);
    } else {
      handleToggleStatus(user);
    }
    setConfirmModal(null);
  }, [confirmModal, handleBlockToggle, handleToggleStatus]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 }, '& .Mui-selected': { color: '#1565c0', fontWeight: 700 } }}
          TabIndicatorProps={{ sx: { bgcolor: '#1565c0', height: 3 } }}
        >
          <Tab label={`Activos (${activeUsers.length})`} value="activos" />
          <Tab label={`Bloqueados (${blockedUsers.length})`} value="bloqueados" />
          <Tab label={`Suspendidos (${suspendedUsers.length})`} value="suspendidos" />
        </Tabs>
      </Box>
      <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', '& .MuiTablePagination-root': { marginTop: 0 } }}>
        <MaterialReactTable table={table} />
      </Paper>

      {formModal && (
        <UserFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          user={formModal.id ? formModal : null}
          onSaved={handleSaved}
          existingUsers={users || []}
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
      {activityLogModal && (
        <UserActivityLogModal
          open={!!activityLogModal}
          onClose={() => setActivityLogModal(null)}
          user={activityLogModal}
        />
      )}
      {confirmModal && (
        <ConfirmActionModal
          open={!!confirmModal}
          onClose={() => setConfirmModal(null)}
          entityType="USUARIO"
          entityName={confirmModal.user.name || confirmModal.user.username}
          action={confirmModal.action}
          onConfirm={handleConfirm}
        />
      )}
    </Box>
  );
};

export default UsersList;
