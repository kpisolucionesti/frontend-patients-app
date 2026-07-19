import React, { useCallback, useMemo, useState } from 'react';
import { Box, IconButton, Paper, Tab, Tabs, Tooltip } from '@mui/material';
import { Add, Block, CheckCircle, Edit, History as HistoryIcon } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import DoctorFormModal from './DoctorFormModal';
import ConfirmActionModal from '../Commons/ConfirmActionModal';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';
import DoctorHistoryModal from './DoctorHistoryModal';
import ExportModal from '../Commons/ExportModal';

const DoctorsList = () => {
  const { data: doctors, loading, refetch } = useFetch(
    () => BackendAPI.doctors.getAll(), [],
  );
  const permissions = usePermissions();

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

  const currentData = useMemo(
    () => {
      const data = tab === 'activos' ? activeDoctors : suspendedDoctors;
      return [...data].sort((a, b) => a.name.localeCompare(b.name));
    },
    [activeDoctors, suspendedDoctors, tab],
  );

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
      { header: 'Especialidad', accessorKey: 'specialty.name', size: 130 },
      { header: 'Correo', accessorKey: 'email', size: 180, enableClickToCopy: true },
      { header: 'Teléfono', accessorKey: 'phone', size: 140, enableClickToCopy: true },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: currentData,
    ...MRT_DEFAULTS,
    enableRowActions: true,
    positionPagination: 'top',
    muiTableContainerProps: { sx: { flex: 1, overflow: 'auto' } },
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
          <ExportModal data={currentData} columns={columns} filename="Medicos" />
          {tab === 'activos' && permissions.includes('medicos.create') && (
            <Tooltip title="Agregar medico" arrow>
              <IconButton color="primary" onClick={() => setFormModal({})}>
                <Add />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
      [tab, permissions, currentData, columns],
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 }, '& .Mui-selected': { color: '#1565c0', fontWeight: 700 } }}
          TabIndicatorProps={{ sx: { bgcolor: '#1565c0', height: 3 } }}
        >
          <Tab label={`Activos (${activeDoctors.length})`} value="activos" />
          <Tab label={`Suspendidos (${suspendedDoctors.length})`} value="suspendidos" />
        </Tabs>
      </Box>
      <Paper sx={{ bgcolor: 'white', boxShadow: 3, borderRadius: 1, overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', '& .MuiTablePagination-root': { marginTop: 0 } }}>
        <MaterialReactTable table={table} />
      </Paper>

      {formModal && (
        <DoctorFormModal
          open={!!formModal}
          onClose={() => setFormModal(null)}
          doctor={formModal.id ? formModal : null}
          onSaved={handleSaved}
        />
      )}
      {confirmModal && (
        <ConfirmActionModal
          open={!!confirmModal}
          onClose={() => setConfirmModal(null)}
          entityType="MEDICO"
          entityName={confirmModal.doctor.name}
          action={confirmModal.action}
          onConfirm={() => {
            handleToggleActive(confirmModal.doctor);
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
    </Box>
  );
};

export default DoctorsList;
