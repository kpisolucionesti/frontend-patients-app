import React, { useCallback, useMemo, useState } from 'react';
import { Box, IconButton, Tab, Tabs, Tooltip } from '@mui/material';
import { Add, Block, CheckCircle, Edit, History as HistoryIcon } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import DoctorFormModal from './DoctorFormModal';
import DoctorConfirmModal from './DoctorConfirmModal';
import DoctorHistoryModal from './DoctorHistoryModal';

const DoctorsList = () => {
  const { data: doctors, loading, refetch } = useFetch(
    () => BackendAPI.doctors.getAll(), [],
  );
  const permissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');

  const [tab, setTab] = useState('activos');
  const [formModal, setFormModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [historyDoctor, setHistoryDoctor] = useState(null);

  const activeDoctors = useMemo(
    () => (doctors || []).filter((d) => d.status !== 'suspended'),
    [doctors],
  );

  const suspendedDoctors = useMemo(
    () => (doctors || []).filter((d) => d.status === 'suspended'),
    [doctors],
  );

  const currentData = tab === 'activos' ? activeDoctors : suspendedDoctors;

  const handleToggleActive = useCallback(async (doctor) => {
    try {
      const newStatus = doctor.status === 'suspended' ? 'active' : 'suspended';
      await BackendAPI.doctors.update({ id: doctor.id, status: newStatus });
      refetch();
    } catch {
      alert("Error al cambiar estado del medico");
    }
  }, [refetch]);

  const handleSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const columns = useMemo(
    () => [
      { header: 'Nombre', accessorKey: 'name', grow: true },
      { header: 'Especialidad', accessorKey: 'speciality', size: 150 },
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
    renderRowActions: ({ row }) => (
      <>
        {permissions.includes('medicos.edit') && (
          <Tooltip title="Editar medico" arrow>
            <IconButton color="warning" size="small" onClick={() => setFormModal(row.original)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Ver pacientes atendidos" arrow>
          <IconButton color="info" size="small" onClick={() => setHistoryDoctor(row.original)}>
            <HistoryIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {permissions.includes('medicos.suspend') && (
          <Tooltip title={tab === 'activos' ? 'Suspender medico' : 'Reactivar medico'} arrow>
            <IconButton
              color={tab === 'activos' ? 'error' : 'success'}
              size="small"
              onClick={() => setConfirmModal({ doctor: row.original, action: tab === 'activos' ? 'suspend' : 'reactivate' })}
            >
              {tab === 'activos' ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </>
    ),
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {tab === 'activos' && permissions.includes('medicos.create') && (
            <Tooltip title="Agregar medico" arrow>
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
          <Tab label={`Activos (${activeDoctors.length})`} value="activos" />
          <Tab label={`Suspendidos (${suspendedDoctors.length})`} value="suspendidos" />
        </Tabs>
      </Box>
      <MaterialReactTable table={table} />

      {formModal && (
        <DoctorFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          doctor={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
      {confirmModal && (
        <DoctorConfirmModal
          open={!!confirmModal}
          onClose={() => setConfirmModal(null)}
          doctor={confirmModal.doctor}
          action={confirmModal.action}
          onConfirm={(doctor) => {
            handleToggleActive(doctor);
            setConfirmModal(null);
          }}
        />
      )}
      {historyDoctor && (
        <DoctorHistoryModal
          open={!!historyDoctor}
          onClose={() => setHistoryDoctor(null)}
          doctor={historyDoctor}
        />
      )}
    </>
  );
};

export default DoctorsList;
