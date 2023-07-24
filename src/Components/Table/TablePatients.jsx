import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Chip, Grid, Stack } from '@mui/material';
import CreatePatients from '../Modals/addPatientsModal';
import { BackendAPI } from '../../services/BackendApi';
import AsignRoom from '../Modals/asignRoomModal';
import ReleasePatient from '../Modals/releasePatientModal';
import EditPatients from '../Modals/editPatientModal';
import MovePatient from '../Modals/movePatientsModal';
import NotesPatient from '../Modals/notesPatientModal';
import NotesTable from './NotesTables';
import DetailsPatients from './DetailsPatients';
import moment from 'moment';
import ExportData from '../Modals/exportDatamodal';

const TablePatients = () => {
    const [tableData, setTableData] = useState([])
    
    useEffect(() => {
      refresh()
    },[])

    const refresh = () => {
      BackendAPI.patients.getAll().then(res => {
        let newData = res.map(x => { return {...x, ingress_date: moment(x.ingress_date, 'DD/M/YYYY').format('MM/DD/YYYY')}})
        setTableData(newData)
      })
      setTimeout(refresh,10000)
    }

    const handleCreatePatients = (data, room) => {
      BackendAPI.patients.create(data).then(res => {
        setTableData([...tableData, res])
        BackendAPI.rooms.update({...room, patient_id: res.id}).then()
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
                header: "F. Ingreso",
                accessorKey: "ingress_date",
                enableEditing: false,
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
                header: "Medico",
                accessorKey: 'current_doctor',
                size: 80,
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
                  header: "Acciones",
                  size: 80,
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
              <Grid container spacing={2} >
                <Grid item xs={4}>
                  <DetailsPatients row={row.original} />       
                </Grid>
                <Grid item xs={8}>
                  <NotesTable row={row.original} />
                </Grid>
              </Grid> 
                
              )}
            }
            enableFullScreenToggle={false}
            positionExpandColumn="last"
            columns={columns}
            data={tableData}
            initialState={{ pagination: { pageSize: 25 }, density: 'compact', sorting: [{ id: 'ingress_date', desc: true }, { id: 'status', desc: false }], isFullScreen: true }}
            editingMode='modal'
            enableSorting
            enableRowActions
            enableColumnOrdering={false}
            enableEditing
            enableStickyHeader
            enableHiding={false}
            enableGlobalFilter={false}
            enableColumnResizing
            enableDensityToggle={false}
            renderRowActions={({ row, table }) => (
              <Stack direction="row" >
                <EditPatients onSubmit={handleUpdatePatients} row={row.original} />
                <NotesPatient row={row.original} />
                <AsignRoom row={row.original} />
                <MovePatient row={row.original} />
                <ReleasePatient row={row.original} />
              </Stack>
            )}
            renderTopToolbarCustomActions={() => {
              return (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <CreatePatients onSubmit={handleCreatePatients} />
                  <ExportData apiData={tableData} />
                </div>
              );
            }}
        />
    )
}

export default TablePatients