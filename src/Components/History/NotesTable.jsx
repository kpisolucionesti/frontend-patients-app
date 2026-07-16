import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, tableCellClasses } from "@mui/material";
import React, { useMemo } from "react";
import { BackendAPI } from "../../services/BackendApi";
import { useFetch } from "../../hooks/useFetch";
import styled from "@emotion/styled";

const StyledTableCell = styled(TableCell)({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'darkblue',
    color: 'white',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
});

const StyledTableRow = styled(TableRow)({
  '&:nth-of-type(odd)': {
    backgroundColor: 'lightgrey',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
});

const NotesTable = ({ row }) => {
  const patientId = row.patient?.id || row.patient_id;
  const { data: patientNotes } = useFetch(
    () => patientId ? BackendAPI.notes.getAll({ patient_id: patientId }) : Promise.resolve([]),
    [patientId],
  );

  if (!patientNotes.length) return null;

  return (
    <TableContainer component={Paper} sx={{ m: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ color: 'white', textAlign: 'center', fontSize: '1.5rem', p: 1 }}>
              NOTAS
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patientNotes.map((note) => (
            <StyledTableRow key={note.id}>
              <StyledTableCell component='th' scope="row">{note.note}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NotesTable;
