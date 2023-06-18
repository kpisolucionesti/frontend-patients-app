import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Chip } from '@mui/material';
import CreatePatients from '../Modals/addPatientsModal';
import { BackendAPI } from '../../services/BackendApi';
import AsignRoom from '../Modals/asignRoomModal';
import ReleasePatient from '../Modals/releasePatientModal';
import EditPatients from '../Modals/editPatientModal';

const TablePatients = () => {
    const [tableData, setTableData] = useState([])
    
    useEffect(() => {
      refresh()
    },[])

    const refresh = () => {
      console.log("Voy a actualizar")
      BackendAPI.patients.getAll().then(res => {
          setTableData(res)
          console.log(res)
      })
      setTimeout(refresh,10000)
    }

    const handleCreatePatients = (data) => {
      BackendAPI.patients.create(data).then(res => {
        setTableData([...tableData, res])
        console.log(res)
      })
    }

    const handleUpdatePatients = (values) => {
      console.log(values)
      BackendAPI.patients.update(values).then(res => {
        let userIndex = tableData.findIndex(x=>x.id === values.id)
        let newState = [...tableData];
        newState[userIndex]=res;
        setTableData(newState);
      })
    }

    const columns = useMemo(
        () => [
            {
                header: "ID",
                accessorKey: 'id',
                enableColumnOrdering: false,
                enableEditing: false,
                enableSorting: false,
            },
            {
                header: "F. Ingreso",
                accessorKey: "ingress_date",
                enableColumnOrdering: false,
                enableEditing: false,
                enableSorting: false,
                size: 30,
            },
            {
                header: "Cedula",
                accessorKey: 'ci',
                size: 30,
            },
            {
                header: "Paciente",
                accessorKey: 'name',
                size: 80,
            },
            {
                header: "Edad",
                accessorKey: 'age',
                size: 10,
            },
            {
                header: "Genero",
                accessorKey: 'gender',
                size: 40,
            },
            {
                header: "Diagnostico",
                accessorKey: 'current_diagnostic',
                size: 150,
                minSize: 100,
                maxSize: 300,
            },
            {
                header: "Medico",
                accessorKey: 'current_doctor',
                size: 80,
            },
            {
                header: "Plan Medico",
                accessorKey: 'treatment',
                size: 150,
                minSize: 100,
                maxSize: 300,
            },
            {
              header: 'Estatus',
              accessorKey: 'status',
              size: 50,
              Cell: ({ cell }) => 
                <Chip 
                  color={cell.getValue() === 0 ? 'success' : cell.getValue() === 1 ? "warning" : "error" } 
                  label={cell.getValue() === 0 ? "ESPERANDO" : cell.getValue() === 1 ? "ASIGNADO" : "ALTA" } 
                />,
                enableColumnOrdering: false,
                enableEditing: false,
                enableSorting: false,
            }
        ],
        [],
    )

    return(
        <MaterialReactTable
            displayColumnDefOptions={{
                'mrt-row-actions': {
                muiTableHeadCellProps: {
                    align: 'center',
                },
                header: "Editar",
                size: 30,
                },
            }}
            renderDetailPanel={({ row }) => {
              return (
              <div>
                <p> {row.original.patient_id} + {row.original.name} + {row.original.ingress_date} + {row.original.ci} + {row.original.age} </p>
              </div>
              )}
            }
            enableFullScreenToggle
            columns={columns}
            data={tableData}
            initialState={{ columnVisibility: { id: false, age: false, gender: false,  treatment: false }, density: 'compact'} }
            editingMode='modal'
            enableRowActions
            enableColumnOrdering={false}
            enableEditing
            enableStickyHeader
            enableHiding={false}
            enableGlobalFilter={false}
            enableColumnResizing
            renderRowActions={({ row, table }) => (
                <EditPatients onSubmit={handleUpdatePatients} row={row.original} />
            )}
            renderTopToolbarCustomActions={() => {
              return (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <CreatePatients onSubmit={handleCreatePatients} />
                  <AsignRoom patients={tableData} />
                  <ReleasePatient patients={tableData} /> 
                </div>
              );
            }}
        />
    )
}

export default TablePatients

