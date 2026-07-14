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
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchPatients = async () => {
            try {
                setLoading(true);
                const res = await BackendAPI.patients.getAll();
                if (isMounted) {
                    const filtered = res?.filter(r => r.status === 1) || [];
                    setTableData(filtered);
                }
            } catch (error) {
                console.error('Error fetching patients:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPatients();
        return () => { isMounted = false; };
    }, []);

    const handleCreatePatients = async (data, room) => {
        try {
            const res = await BackendAPI.patients.create(data);
            setTableData(prev => [...prev, res]);
            await BackendAPI.rooms.update({ ...room, patient_id: res.id });
        } catch (error) {
            console.error('Error creating patient:', error);
        }
    };

    const handleUpdatePatients = async (patient) => {
        try {
            const res = await BackendAPI.patients.update(patient);
            setTableData(prev => prev.map(p => p.id === patient.id ? res : p));
        } catch (error) {
            console.error('Error updating patient:', error);
        }
    };

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
    );

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
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} lg={12}>
                        <NotesTable row={row.original} />
                    </Grid>
                </Grid>
            );
        },
        renderRowActions: ({ row }) => (
            <Stack direction="row">
                <EditPatients onSubmit={handleUpdatePatients} row={row.original} />
                <NotesPatient row={row.original} />
                <AsignRoom row={row.original} />
                <MovePatient row={row.original} />
                <ReleasePatient row={row.original} />
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
        state: {
            isLoading: loading,
        },
    });

    return (
        <MaterialReactTable table={table} />
    );
};

export default CurrentPatients;
