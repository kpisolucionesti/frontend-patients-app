import React, { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Chip, Grid, Box } from '@mui/material';
import { BackendAPI } from '../../services/BackendApi';
import NotesTable from './NotesTables';
import DetailsPatients from './DetailsPatients';
import moment from 'moment';
import ExportData from '../Modals/exportDatamodal';

const TablePatients = () => {
    const [tableData, setTableData] = useState([])
    
    useEffect(() => {
      BackendAPI.patients.getAll().then(res => {
        let newData = res.filter(r => r.status !== 1).map(x => { return {...x, ingress_date: moment(x.ingress_date, 'DD/M/YYYY').format('YYYY/MM/DD')}})
        setTableData(newData)
    })
    },[])

    const columns = useMemo(
        () => [
            {
              header: "F. Ingreso",
              accessorKey: "ingress_date",
              enableEditing: false,
              minSize: 50,
              maxSize: 150,
              size: 150,
            },
            {
              header: "Cedula",
              accessorKey: 'ci',
              minSize: 30,
              maxSize: 150,
              size: 150,
            },
            {
              header: "Paciente",
              accessorKey: 'name',
              grow: true,
              minSize: 80,
              maxSize: 200,
              size: 200,
            },
            {
              header: "Edad",
              accessorKey: 'age',
              minSize: 50,
              maxSize: 100,
              size: 100,
            },
            {
              header: "Medico",
              accessorKey: 'current_doctor',
              grow: true,
              minSize: 100,
              maxSize: 250,
              size: 250,
            },
            {
              header: 'Estatus',
              accessorKey: 'status',
              minSize: 80,
              maxSize: 100,
              size: 180,
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

    const table = useMaterialReactTable({
      columns: columns,
      data: tableData,
      enableRowPinning: true,
      enableExpandAll: false,
      enableFullScreenToggle: false,
      positionExpandColumn: "last",
      editDisplayMode: 'modal',
      enableSorting: true,
      enableColumnOrdering: false,
      enableStickyHeader: true,
      enableHiding: false,
      enableGlobalFilter: false,
      enableDensityToggle: false,
      renderTopToolbarCustomActions: () => (
          <Box sx={{ display: 'flex', gap: '1rem', p: '4px'}}>
            <ExportData apiData={tableData} />
          </Box>
      ),
      displayColumnDefOptions: {
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
          <Grid item xs={4}>
            <DetailsPatients row={row.original} />       
          </Grid>
          <Grid item xs={8}>
            <NotesTable row={row.original} />
          </Grid>
        </Grid> 
      )},
      initialState: {
        pagination: { pageSize: 25 }, 
        density: 'compact', 
        sorting: [{ id: 'ingress_date', desc: true }, { id: 'status', desc: false }]
      },
    })

    return(
        <MaterialReactTable table={table} />
    )
}

export default TablePatients