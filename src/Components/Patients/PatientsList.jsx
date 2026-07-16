import React, { useCallback, useMemo, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit, History } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import moment from 'moment';
import EditPatientData from './editPatientDataModal';
import PatientHistoryModal from './PatientHistoryModal';
import ExportModal from '../Commons/ExportModal';
import usePermissions from '../../hooks/usePermissions';
import { MRT_DEFAULTS } from '../Commons/mrtConfig';

const PatientsList = () => {
  const { data: patients, loading, refetch } = useFetch(
    () => BackendAPI.patients.getAll(), [],
  );
  const permissions = usePermissions();

  const [editPatient, setEditPatient] = useState(null);
  const [historyPatient, setHistoryPatient] = useState(null);

  const handlePatientSaved = useCallback(() => {
    refetch();
  }, [refetch]);

  const columns = useMemo(
    () => [
      { header: 'Cedula', accessorKey: 'ci', size: 30 },
      { header: 'Nombre', accessorKey: 'name', size: 100 },
      { header: 'Apellido', accessorKey: 'lastname', size: 100 },
      { header: 'Edad', accessorKey: 'age', size: 10 },
      { header: 'Genero', accessorKey: 'gender', size: 50 },
      { header: 'F. Nacimiento', accessorKey: 'birthday', size: 80, Cell: ({ cell }) => cell.getValue() ? moment(cell.getValue(), 'YYYY-MM-DD').format('DD-MM-YYYY') : '' },
      { header: 'Representante', accessorKey: 'representante', size: 120 },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: patients || [],
    ...MRT_DEFAULTS,
    enableFilters: false,
    enableColumnFilters: false,
    enableRowActions: true,
    renderTopToolbarCustomActions: useCallback(
      () => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ExportModal data={patients || []} columns={columns} filename="Pacientes" />
        </Box>
      ),
      [patients, columns],
    ),
    renderRowActions: ({ row }) => (
      <>
        {permissions.includes('pacientes.edit') && (
          <Tooltip title="Editar datos del paciente" arrow>
            <IconButton color="warning" size="small" onClick={() => setEditPatient(row.original)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Ver historial de casos" arrow>
          <IconButton color="info" size="small" onClick={() => setHistoryPatient(row.original)}>
            <History fontSize="small" />
          </IconButton>
        </Tooltip>
      </>
    ),
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return (
    <>
      <MaterialReactTable table={table} />
      {editPatient && (
        <EditPatientData
          open={!!editPatient}
          onClose={() => setEditPatient(null)}
          patient={editPatient}
          onSaved={handlePatientSaved}
        />
      )}
      {historyPatient && (
        <PatientHistoryModal
          open={!!historyPatient}
          onClose={() => setHistoryPatient(null)}
          patient={historyPatient}
        />
      )}
    </>
  );
};

export default PatientsList;
