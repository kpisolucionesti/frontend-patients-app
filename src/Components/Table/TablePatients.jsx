import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Chip, Grid, Stack } from '@mui/material';
import CreatePatients from '../Modals/addPatientsModal';
import AsignRoom from '../Modals/asignRoomModal';
import ReleasePatient from '../Modals/releasePatientModal';
import EditPatients from '../Modals/editPatientModal';
import MovePatient from '../Modals/movePatientsModal';
import NotesPatient from '../Modals/notesPatientModal';
import NotesTable from './NotesTables';
import DetailsPatients from './DetailsPatients';
import ExportData from '../Modals/exportDatamodal';
import { useCallList } from '../Hooks/useCallsList';

const TablePatients = () => {
    const { patients, callPatientsList } = useCallList()
    const [edit, setEdit] = useState(false)
    
    useEffect(() => {
      refresh()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[edit])

    const refresh = () => {
      callPatientsList()
      console.log('Actualizado')
      setTimeout(refresh,10000)
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
            data={patients}
            initialState={{ pagination: { pageSize: 25 }, density: 'compact', sorting: [{ id: 'ingress_date', desc: true }, { id: 'status', desc: false }], isFullScreen: true }}
            editingMode='modal'
            enableSorting
            enableRowActions
            enableColumnOrdering={false}
            enableEditing
            enableStickyHeader
            enableHiding={false}
            enableGlobalFilter={false}
            enableDensityToggle={false}
            renderRowActions={({ row }) => (
              <Stack direction="row" >
                <EditPatients row={row.original} />
                <NotesPatient row={row.original} onChange={setEdit} />
                <AsignRoom row={row.original} />
                <MovePatient row={row.original} onChange={setEdit} edit={edit} />
                <ReleasePatient row={row.original} onChange={setEdit} edit={edit} />
              </Stack>
            )}
            renderTopToolbarCustomActions={() => {
              return (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <CreatePatients patientsList={patients} onChange={setEdit} />
                  <ExportData apiData={patients} />
                </div>
              );
            }}
        />
    )
}

export default TablePatients