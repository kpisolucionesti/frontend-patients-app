import React, { useCallback, useMemo, useState } from 'react';
import { Box, IconButton, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Add, Block, CheckCircle, Edit, History as HistoryIcon, FileUpload } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useDoctors } from '../../hooks/useApiData';
import DoctorFormModal from '../../Components/Doctors/DoctorFormModal';
import ConfirmActionModal from '../../Components/Commons/ConfirmActionModal';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../../Components/Commons/mrtConfig';
import DoctorHistoryModal from '../../Components/Doctors/DoctorHistoryModal';
import ExportModal from '../../Components/Commons/ExportModal';
import ImportModal from '../../shared/ui/import-excel-modal';
import { useSnackbar } from '../../hooks/useSnackbar';

const DOCTOR_IMPORT_COLUMNS = [
  { field: 'name', label: 'Nombre', required: true, aliases: ['name', 'nombre', 'nombre del medico'] },
  { field: 'specialty', label: 'Especialidad', required: false, aliases: ['specialty', 'especialidad'] },
  { field: 'email', label: 'Correo', required: false, aliases: ['email', 'correo', 'correo electronico'] },
  { field: 'phone', label: 'Teléfono', required: false, aliases: ['phone', 'telefono', 'tel'] },
];

const DOCTOR_TEMPLATE_ROWS = [
  { name: 'Dr. Juan Pérez', specialty: 'Medicina Interna', email: 'jperez@hospital.com', phone: '+58 412 1234567' },
  { name: 'Dra. María García', specialty: 'Cardiología', email: 'mgarcia@hospital.com', phone: '' },
];

const DoctorsList = () => {
  useDocumentTitle('Médicos');
  const { data: doctors, isLoading: loading, refetch } = useDoctors();
  const permissions = usePermissions();

  const [tab, setTab] = useState('activos');
  const [formModal, setFormModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [historyDoctor, setHistoryDoctor] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const { show: showSnack } = useSnackbar();

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
            <IconButton size="small" onClick={() => setFormModal(row.original)}>
              <Edit sx={{ fontSize: 15 }} />
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
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <ExportModal data={currentData} columns={columns} filename="Medicos" />
          {tab === 'activos' && permissions.includes('medicos.create') && (
            <>
              <Tooltip title="Agregar médico" arrow>
                <IconButton size="small" color="primary" onClick={() => setFormModal({})}><Add fontSize="small" /></IconButton>
              </Tooltip>
              <Tooltip title="Importar desde Excel" arrow>
                <IconButton size="small" color="info" onClick={() => setImportOpen(true)}><FileUpload fontSize="small" /></IconButton>
              </Tooltip>
            </>
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
      <Box sx={{ px: 2, py: 1.25, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1rem' }}>
          Médicos
        </Typography>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 }, '& .Mui-selected': { color: 'primary.main', fontWeight: 700 } }}
          TabIndicatorProps={{ sx: { bgcolor: 'primary.main', height: 3 } }}
        >
          <Tab label={`Activos (${activeDoctors.length})`} value="activos" />
          <Tab label={`Suspendidos (${suspendedDoctors.length})`} value="suspendidos" />
        </Tabs>
      </Box>
      <MaterialReactTable key={tab} table={table} />

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
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)}
        onImported={refetch} sectionLabel="Medicos" templateName="plantilla_medicos"
        columns={DOCTOR_IMPORT_COLUMNS} templateRows={DOCTOR_TEMPLATE_ROWS}
        apiImportFn={async (rows) => {
          const errors = []; let created = 0;
          for (const row of rows) {
            try { await BackendAPI.doctors.create({ name: row.name, specialty_name: row.specialty, email: row.email, phone: row.phone }); created++; }
            catch { errors.push({ row: row._row, error: 'Error al crear' }); }
          }
          return { created, errors };
        }}
      />
    </Box>
  );
};

export default DoctorsList;
