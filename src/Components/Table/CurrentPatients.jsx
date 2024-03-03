import React, { useEffect, useMemo, useState } from 'react';
import { BackendAPI } from '../../services/BackendApi';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Grid, Stack } from '@mui/material';
import NotesTable from './NotesTables';
import CreatePatients from '../Modals/addPatientsModal';
import EditPatients from '../Modals/editPatientModal';
import NotesPatient from '../Modals/notesPatientModal';
import AsignRoom from '../Modals/asignRoomModal';
import MovePatient from '../Modals/movePatientsModal';
import ReleasePatient from '../Modals/releasePatientModal';

const CurrentPatients = () => {
    const [tableData, setTableData] = useState([])
    const [check, setCheck] = useState(false)

    useEffect(() => {
      BackendAPI.patients.getAll().then(res => {
        let newData = res.filter(r => r.status === 1).map(x => { return {...x}})
        setTableData(newData)
      })
      if(check){
        setCheck(false)
      }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[check])
  
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
                header: "Diagnostico",
                accessorKey: 'current_diagnostic',
                grow: true,
            },
        ],
        [],
    )

    const table = useMaterialReactTable({
      columns: columns,
      data: tableData,
      layoutMode: 'grid',
      enableEditing: true,
      enableExpandAll: false,
      enableFullScreenToggle: false,
      positionExpandColumn: 'last',
      editDisplayMode: 'modal',
      enableSorting: true,
      enableRowActions: true,
      enableColumnOrdering: false,
      enableStickyHeader: true,
      enableHiding: false,
      enableGlobalFilter: true,
      enableDensityToggle: false,
      displayColumnDefOptions: {
        'mrt-row-actions': {
          muiTableHeadCellProps: {
            align: 'center',
          },
          muiTableBodyCellProps: {
            align: 'center',
          },
          enableResizing: true,
          header: "Acciones",
          minSize: 50,
          maxSize: 200,
          size: 150,
        },
        'mrt-row-expand': {
          muiTableHeadCellProps: {
            align: 'right',
          },
          muiTableBodyCellProps: {
            align: 'right',
          },
          header: "Detalles",
          grow: true,
          size: 10,
        },
      },
      renderDetailPanel: ({ row }) => {
        return (
        <Grid container spacing={2} >
          <Grid item xs={12} md={12} lg={12} >
            <NotesTable row={row.original} />
          </Grid>
        </Grid> 
      )},
      renderRowActions: ({ row }) => (
        <Stack direction="row" >
          <EditPatients onSubmit={handleUpdatePatients} row={row.original} />
          <NotesPatient row={row.original} />
          <AsignRoom row={row.original} />
          <MovePatient row={row.original} status={setCheck} />
          <ReleasePatient row={row.original} status={setCheck} />
        </Stack>
      ),
      renderTopToolbarCustomActions: () => {
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <CreatePatients onSubmit={handleCreatePatients} />
          </div>
        );
      },
      initialState: { 
        pagination: { pageSize: 25 },
        density: 'compact' 
      },

    })

    return (
      <MaterialReactTable table={table} />
    )
}

export default CurrentPatients