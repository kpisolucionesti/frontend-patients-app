import { useMemo, useState } from 'react';
import {
  Box, Checkbox, Chip, FormControl, FormControlLabel, FormGroup,
  InputLabel, MenuItem, Select, Typography,
} from '@mui/material';

const PermissionSelector = ({ groups, permissions, onToggle, readOnly }) => {
  const [selectedSection, setSelectedSection] = useState('');

  const sections = useMemo(() => groups || [], [groups]);

  const currentGroup = useMemo(
    () => sections.find((s) => s.section === selectedSection),
    [sections, selectedSection],
  );

  const totalSelected = useMemo(() => {
    const allKeys = sections.flatMap((s) => (s.permissions || []).map((p) => p.key));
    return allKeys.filter((k) => permissions.includes(k)).length;
  }, [sections, permissions]);

  const totalAll = useMemo(
    () => sections.reduce((acc, s) => acc + (s.permissions?.length || 0), 0),
    [sections],
  );

  const selectedCount = useMemo(
    () => currentGroup?.permissions?.filter((p) => permissions.includes(p.key)).length || 0,
    [currentGroup, permissions],
  );

  const handleToggleAll = (checkAll) => {
    if (!currentGroup) return;
    currentGroup.permissions.forEach((p) => {
      const has = permissions.includes(p.key);
      if (checkAll && !has) onToggle(p.key);
      if (!checkAll && has) onToggle(p.key);
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Módulo</InputLabel>
          <Select
            value={selectedSection}
            label="Módulo"
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            {sections.map((s) => (
              <MenuItem key={s.section} value={s.section}>
                {s.section}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Chip
          label={`${totalSelected} / ${totalAll} permisos`}
          size="small"
          color={totalSelected === totalAll ? 'success' : 'default'}
          variant="outlined"
        />
      </Box>

      {!currentGroup ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Seleccione un módulo para ver sus permisos
        </Typography>
      ) : (
        <Box
          sx={{
            bgcolor: currentGroup.color || 'transparent',
            borderRadius: 2,
            p: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {currentGroup.section}
            </Typography>
            <Chip
              label={`${selectedCount} / ${currentGroup.permissions.length}`}
              size="small"
              color={selectedCount === currentGroup.permissions.length ? 'success' : 'default'}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>

          {!readOnly && currentGroup.permissions.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <Chip
                label="Seleccionar todos"
                size="small"
                clickable
                color={selectedCount === currentGroup.permissions.length ? 'success' : 'default'}
                variant={selectedCount === currentGroup.permissions.length ? 'filled' : 'outlined'}
                onClick={() => handleToggleAll(true)}
                sx={{ fontSize: '0.65rem', height: 22 }}
              />
              <Chip
                label="Ninguno"
                size="small"
                clickable
                variant={selectedCount === 0 ? 'filled' : 'outlined'}
                color={selectedCount === 0 ? 'error' : 'default'}
                onClick={() => handleToggleAll(false)}
                disabled={selectedCount === 0}
                sx={{ fontSize: '0.65rem', height: 22 }}
              />
            </Box>
          )}

          <FormGroup>
            {currentGroup.permissions.map((perm) => {
              const checked = permissions.includes(perm.key);
              return (
                <FormControlLabel
                  key={perm.key}
                  control={
                    <Checkbox
                      size="small"
                      checked={checked}
                      onChange={() => onToggle(perm.key)}
                      disabled={readOnly}
                      sx={{ py: 0.3 }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {perm.label}
                    </Typography>
                  }
                  sx={{ ml: 0 }}
                />
              );
            })}
          </FormGroup>
        </Box>
      )}
    </Box>
  );
};

export default PermissionSelector;
