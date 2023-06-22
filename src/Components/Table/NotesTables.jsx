import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, tableCellClasses } from "@mui/material";
import React, { useEffect, useState } from "react";
import { BackendAPI } from "../../services/BackendApi";
import styled from "@emotion/styled";

const NotesTable = ({ row }) => {
    const [notesList, setNotesList] = useState([])

    useEffect(() => {
        BackendAPI.notes.getAll().then(res => setNotesList(res))
    })

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
          backgroundColor: 'darkblue',
          color: 'white',
        },
        [`&.${tableCellClasses.body}`]: {
          fontSize: 14,
        },
      }));

      const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
          backgroundColor: 'lightgrey',
        },
        '&:last-child td, &:last-child th': {
          border: 0,
        },
      }));

    return (
        <TableContainer component={Paper} sx={{ m: 2 }} >
            <Table size="small" >
                <TableHead sx={{ textAlign: 'center', bgcolor: 'darkblue' }} >
                    <TableRow >
                        <StyledTableCell sx={{ color: 'white', textAlign: 'center', fontSize: 30, p: 2 }} >NOTAS</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                        {notesList.filter(f =>  f.patient_id === row.id).map((note) => (
                            <StyledTableRow key={note.name}>
                                <StyledTableCell component='th' scope="note" >{note.note}</StyledTableCell>
                            </StyledTableRow>
                        ) )}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default NotesTable