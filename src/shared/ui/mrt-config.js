export const MRT_DEFAULTS = {
  layoutMode: 'grid',
  enableEditing: false,
  enableFullScreenToggle: false,
  enableSorting: true,
  enableStickyHeader: true,
  enableHiding: false,
  enableGlobalFilter: true,
  enableDensityToggle: false,
  muiTablePaperProps: {
    sx: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 },
  },
  muiTableContainerProps: {
    sx: { flex: 1, overflow: 'auto' },
  },
  muiTableHeadCellProps: {
    sx: { bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', p: '4px 6px' },
  },
  initialState: {
    pagination: { pageSize: 25 },
    density: 'compact',
  },
};
