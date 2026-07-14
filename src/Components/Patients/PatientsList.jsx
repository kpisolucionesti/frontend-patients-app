import React, { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';

const PatientsList = () => {
  const { data: patients, loading } = useFetch(
    () => BackendAPI.patients.getAll(), [],
  );

  const columns = useMemo(
    () => [
      { header: 'Cedula', accessorKey: 'ci', size: 30 },
      { header: 'Nombre', accessorKey: 'name', size: 100 },
      { header: 'Apellido', accessorKey: 'lastname', size: 100 },
      { header: 'Edad', accessorKey: 'age', size: 10 },
      { header: 'Genero', accessorKey: 'gender', size: 50 },
      { header: 'F. Nacimiento', accessorKey: 'birthday', size: 80 },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: patients || [],
    layoutMode: 'grid',
    enableEditing: false,
    enableFullScreenToggle: false,
    enableSorting: true,
    enableStickyHeader: true,
    enableHiding: false,
    enableGlobalFilter: true,
    enableDensityToggle: false,
    enableRowActions: false,
    getRowId: (row) => row.id?.toString(),
    initialState: { pagination: { pageSize: 25 }, density: 'compact' },
    state: { isLoading: loading },
  });

  return <MaterialReactTable table={table} />;
};

export default PatientsList;
