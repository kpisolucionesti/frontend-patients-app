import React, { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';

const DoctorsList = () => {
  const { data: doctors, loading } = useFetch(
    () => BackendAPI.doctors.getAll(), [],
  );

  const columns = useMemo(
    () => [
      { header: 'Nombre', accessorKey: 'name', grow: true },
      { header: 'Especialidad', accessorKey: 'speciality', size: 150 },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: doctors || [],
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

export default DoctorsList;
