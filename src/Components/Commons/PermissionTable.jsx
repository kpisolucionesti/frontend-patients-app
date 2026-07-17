import { useMemo } from 'react';
import {
  Box, Checkbox, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography
} from '@mui/material';

const COLUMNS = [
  { id: 'Crear', matchLabel: 'Crear' },
  { id: 'Editar', matchLabel: 'Editar' },
  { id: 'Eliminar', matchLabel: 'Eliminar' },
  { id: 'Ver', matchLabel: 'Ver' },
  { id: 'Suspender', matchLabel: 'Suspender' },
  { id: 'Exportar', matchLabel: 'Exportar' },
  { id: 'Triaje', matchLabel: 'Asignar Triage' },
  { id: 'Alta Médica', matchLabel: 'Dar de Alta' },
  { id: 'Asignar Sala', matchLabel: 'Asignar Sala' },
  { id: 'G. Permisos', matchLabel: 'Gestionar Permisos' },
  { id: 'C. Contraseña', matchLabel: 'Cambiar Contraseña' },
];

const PermissionTable = ({ groups, permissions, onToggle, readOnly }) => {
  const groupData = useMemo(() =>
    (groups || []).map((group) => {
      const permMap = {};
      (group.permissions || []).forEach((p) => { permMap[p.label] = p.key; });
      const perms = COLUMNS.map((col) => ({
        colId: col.id,
        key: permMap[col.matchLabel] || null,
      }));
      const activeKeys = perms.filter((p) => p.key).map((p) => p.key);
      const activeCount = activeKeys.filter((k) => permissions.includes(k)).length;
      const allActive = activeKeys.length > 0 && activeCount === activeKeys.length;
      const someActive = activeCount > 0 && activeCount < activeKeys.length;
      return { ...group, permMap, perms, activeKeys, allActive, someActive };
    }),
    [groups, permissions],
  );

  const handleToggleAll = (group) => {
    if (group.allActive) {
      group.activeKeys.forEach((k) => onToggle(k));
    } else {
      group.activeKeys.forEach((k) => { if (!permissions.includes(k)) onToggle(k); });
    }
  };

  return (
    <TableContainer sx={{ maxHeight: '55vh', overflowX: 'auto' }}>
      <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap', bgcolor: '#f5f5f5', position: 'sticky', left: 0, zIndex: 2, minWidth: 140 }}>
              Módulo
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap', bgcolor: '#f5f5f5', minWidth: 70 }}>
              Todos
            </TableCell>
            {COLUMNS.map((col) => (
              <TableCell key={col.id} align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap', bgcolor: '#f5f5f5', minWidth: 90 }}>
                {col.id}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {groupData.map((group) => (
            <TableRow
              key={group.section}
              sx={{ '&:hover': { bgcolor: 'action.hover' }, bgcolor: group.color || 'transparent' }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  position: 'sticky',
                  left: 0,
                  bgcolor: group.color || '#fafafa',
                  zIndex: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                {group.section}
              </TableCell>
              <TableCell align="center" sx={{ px: 0.5 }}>
                {group.activeKeys.length > 0 && !readOnly && (
                  <Checkbox
                    size="small"
                    checked={group.allActive}
                    indeterminate={group.someActive}
                    onChange={() => handleToggleAll(group)}
                    sx={{ p: 0.5 }}
                  />
                )}
              </TableCell>
              {COLUMNS.map((col) => {
                const perm = group.perms.find((p) => p.colId === col.id);
                const key = perm?.key;
                const active = key ? permissions.includes(key) : false;
                const exists = !!key;
                return (
                  <TableCell key={col.id} align="center" sx={{ px: 0.5 }}>
                    {exists ? (
                      <Checkbox
                        size="small"
                        checked={active}
                        onChange={() => onToggle(key)}
                        disabled={readOnly}
                        sx={{ p: 0.5 }}
                      />
                    ) : (
                      <Box sx={{ width: 32, height: 32 }} />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PermissionTable;
