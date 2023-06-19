import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Chip, Stack, Typography } from '@mui/material';
import CreatePatients from '../Modals/addPatientsModal';
import { BackendAPI } from '../../services/BackendApi';
import AsignRoom from '../Modals/asignRoomModal';
import ReleasePatient from '../Modals/releasePatientModal';
import EditPatients from '../Modals/editPatientModal';
import MovePatient from '../Modals/movePatientsModal';

const TablePatients = () => {
    const [tableData, setTableData] = useState([])
    
    useEffect(() => {
      refresh()
    },[])

    const refresh = () => {
      console.log("Voy a actualizar")
      BackendAPI.patients.getAll().then(res => setTableData(res))
      setTimeout(refresh,10000)
    }

    const handleCreatePatients = (data, room) => {
      BackendAPI.patients.create(data).then(res => {
        setTableData([...tableData, res])
        BackendAPI.rooms.update({...room, patient_id: res.id}).then(rest => console.log(rest))
      })
    }

    const handleUpdatePatients = (patient) => {
      BackendAPI.patients.update(patient).then(res => {
        let userIndex = tableData.findIndex(x=>x.id === patient.id)
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
                  color={cell.getValue() === 0 ? 'success' : cell.getValue() === 1 ? "warning" : cell.getValue() === 3 ? "info" : "error" } 
                  label={cell.getValue() === 0 ? "ESPERANDO" : cell.getValue() === 1 ? "ATENDIDO" : cell.getValue() === 3 ? 'INGRESADO' : "ALTA" } 
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
                  size: 100,
                },
                'mrt-row-expand': {
                  muiTableHeadCellProps: {
                    align: 'right',
                  },
                  muiTableBodyCellProps: {
                    align: 'right',
                  },
                  header: "Detalles",
                  size: 5,
                },
            }}
            renderDetailPanel={({ row }) => {
              return (
              <div>
                <Typography sx={{ fontWeight: 'bold' }} h2>DETALLES DE LA EMERGENCIA</Typography>
                <p>DIAGNOSTICO: {row.original.current_diagnostic} </p>
                <p>{row.original.medical_exit ? "CAUSA DE ALTA MEDICA: " : "AREA DE INGRESO: " } {row.original.medical_exit ? row.original.medical_exit : row.original.transfer}</p>
                <p>{row.original.medical_exit ? "OBSERVACIONES: " : "" } {row.original.medical_exit ? row.original.observations : ""}</p>
              </div>
              )}
            }
            enableFullScreenToggle
            positionExpandColumn="last"
            columns={columns}
            data={tableData}
            initialState={{ pagination: { pageSize: 25 } ,columnVisibility: { id: false, age: false, gender: false,  treatment: false, current_diagnostic: false }, density: 'compact'} }
            editingMode='modal'
            enableRowActions
            enableColumnOrdering={false}
            enableEditing
            enableStickyHeader
            enableHiding={false}
            enableGlobalFilter={false}
            enableColumnResizing
            renderRowActions={({ row, table }) => (
              <Stack direction="row" spacing={1} >
                <EditPatients onSubmit={handleUpdatePatients} row={row.original} />
                <AsignRoom row={row.original} />
                <MovePatient row={row.original} />
                <ReleasePatient row={row.original} />
              </Stack>
            )}
            renderTopToolbarCustomActions={() => {
              return (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <CreatePatients onSubmit={handleCreatePatients} />
                </div>
              );
            }}
        />
    )
}

export default TablePatients

