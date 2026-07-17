import { useState, useCallback } from 'react';
import { Box, Button, List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 220;

const SectionSidebar = ({ sections, activeSection, onSectionChange, collapsible, extraAction }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const isCollapsible = collapsible !== false;

  return (
    <Box
      sx={{
        width: isCollapsible && collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        minWidth: isCollapsible && collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,
        bgcolor: '#f5f7fa',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: isCollapsible ? 'width 0.2s ease, min-width 0.2s ease' : 'none',
        overflow: 'hidden',
      }}
    >
      {extraAction && (
        <Box sx={{ p: isCollapsible && collapsed ? '8px 4px' : 2, display: 'flex', alignItems: 'center', justifyContent: isCollapsible && collapsed ? 'center' : 'space-between', gap: 1 }}>
          {isCollapsible && collapsed ? (
            <Tooltip title={extraAction.label} arrow>
              <IconButton size="small" onClick={extraAction.onClick} sx={{ color: '#1565c0' }}>
                {extraAction.icon}
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={extraAction.icon}
                onClick={extraAction.onClick}
                sx={{ bgcolor: '#1565c0', color: 'white', '&:hover': { bgcolor: '#0d47a1' }, fontSize: '0.75rem', flex: 1, minWidth: 0 }}
              >
                {extraAction.label}
              </Button>
              {isCollapsible && (
                <IconButton size="small" onClick={handleToggle} sx={{ color: 'text.secondary' }}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              )}
            </>
          )}
        </Box>
      )}
      {extraAction && <Divider />}
      {!extraAction && isCollapsible && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 0.5 }}>
          <IconButton size="small" onClick={handleToggle} sx={{ color: 'text.secondary' }}>
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>
      )}
      <List component="nav" sx={{ flex: 1, pt: extraAction ? 1 : isCollapsible ? 0 : 2 }}>
        {sections.map((section) => {
          const isSelected = activeSection === section.key;
          return (
            <ListItemButton
              key={section.key}
              selected={isSelected}
              onClick={() => onSectionChange(section.key)}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                justifyContent: isCollapsible && collapsed ? 'center' : 'initial',
                px: isCollapsible && collapsed ? 0.5 : 1.5,
                minHeight: 40,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '& .MuiListItemIcon-root': { color: 'white' },
                },
                '&:not(.Mui-selected):hover': { bgcolor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: isCollapsible && collapsed ? 'auto' : 40, justifyContent: 'center', color: isSelected ? 'inherit' : 'text.secondary' }}>
                {section.icon}
              </ListItemIcon>
              {(!isCollapsible || !collapsed) && (
                <ListItemText
                  primary={section.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, noWrap: true }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default SectionSidebar;
