import { Box, Tabs, Tab, Badge } from '@mui/material';

const findActiveGroup = (groups, activeTab) => {
  if (!activeTab || !groups) return null;
  return groups.find((g) => g.sections.some((s) => s.key === activeTab)) || null;
};

export default function GroupedTabBar({ groups, standaloneTab, standaloneTabs, activeTab, onTabChange, sectionBadges }) {
  const allStandalone = standaloneTabs || (standaloneTab ? [standaloneTab] : []);
  const activeGroup = findActiveGroup(groups, activeTab);
  const isStandaloneActive = allStandalone.some((s) => s.key === activeTab);

  const handleTabChange = (_, tabKey) => {
    const isStandalone = allStandalone.some((s) => s.key === tabKey);
    if (isStandalone) {
      onTabChange(tabKey);
      return;
    }
    const group = groups.find((g) => g.key === tabKey);
    if (group && group.sections.length > 0) {
      onTabChange(group.sections[0].key);
    }
  };

  const badgeSx = { '& .MuiBadge-badge': { top: 6, right: -6, width: 8, height: 8, minWidth: 8 } };

  const tabSx = {
    textTransform: 'none', fontWeight: 600, fontSize: '0.78rem', minHeight: 32,
    '& .MuiTab-iconWrapper': { mr: 0.5 },
  };
  const selectedSx = { color: 'primary.main', fontWeight: 700 };
  const indicatorSx = { height: 3 };
  const groupTabSx = { ...tabSx, fontSize: '0.75rem', minHeight: 34, py: 0.5 };

  const currentRow1Value = isStandaloneActive ? activeTab : (activeGroup?.key || false);

  return (
    <Box>
      <Tabs
        value={currentRow1Value}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: activeGroup ? 0.5 : 0,
          bgcolor: 'white',
          borderRadius: '8px 8px 0 0',
          '& .MuiTab-root': groupTabSx,
          '& .Mui-selected': selectedSx,
          '& .MuiTabs-indicator': indicatorSx,
        }}
      >
        {allStandalone.map((s) => (
          <Tab key={s.key} value={s.key} label={s.label} icon={s.icon} iconPosition="start" />
        ))}
        {groups.map((g) => (
          <Tab key={g.key} value={g.key} label={g.label} icon={g.icon} iconPosition="start" />
        ))}
      </Tabs>

      {activeGroup && (
        <Tabs
          value={activeTab}
          onChange={(_, v) => onTabChange(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 1,
            bgcolor: '#f5f5f5',
            borderRadius: '0 0 8px 8px',
            minHeight: 30,
            '& .MuiTab-root': { ...tabSx, fontSize: '0.72rem', minHeight: 28, py: 0.15 },
            '& .Mui-selected': selectedSx,
            '& .MuiTabs-indicator': { ...indicatorSx, bgcolor: 'primary.main' },
          }}
        >
          {activeGroup.sections.map((s) => {
            const hasBadge = sectionBadges?.[s.key];
            return (
              <Tab
                key={s.key}
                value={s.key}
                label={hasBadge ? (
                  <Badge color="error" variant="dot" sx={badgeSx}>{s.label}</Badge>
                ) : s.label}
              />
            );
          })}
        </Tabs>
      )}
    </Box>
  );
}
