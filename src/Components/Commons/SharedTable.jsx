import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';

const HEADER_CELL_SX = {
  bgcolor: 'primary.main',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.75rem',
  py: 0.75,
};

const SharedTable = ({
  columns = [],
  rows = [],
  renderRow,
  emptyMessage = 'No hay datos',
  loading = false,
  stickyHeader = true,
  size = 'small',
  containerSx = {},
  scrollContainer = true,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const table = (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 1, ...containerSx }}>
      <Table stickyHeader={stickyHeader} size={size}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                sx={{
                  ...HEADER_CELL_SX,
                  ...(col.width ? { width: col.width } : {}),
                  ...(col.sx || {}),
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={row.id || index} hover sx={{ cursor: 'pointer' }}>
                {renderRow(row, index)}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (scrollContainer) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {table}
      </Box>
    );
  }

  return table;
};

export default SharedTable;
