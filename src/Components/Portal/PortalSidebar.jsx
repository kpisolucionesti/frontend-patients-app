import SectionSidebar from '../Commons/SectionSidebar';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import ScienceIcon from '@mui/icons-material/Science';

const ICON_MAP = {
  local_hospital: <LocalHospitalIcon />,
  people: <PeopleIcon />,
  history: <HistoryIcon />,
  lab: <ScienceIcon />,
};

const PortalSidebar = ({ sections, activeSection, onSectionChange, onNewIngreso }) => {
  const sectionsWithIcons = sections.map((s) => ({
    ...s,
    icon: ICON_MAP[s.icon] || s.icon,
  }));

  return (
    <SectionSidebar
      sections={sectionsWithIcons}
      activeSection={activeSection}
      onSectionChange={onSectionChange}
      collapsible
      extraAction={{ label: 'Nuevo Ingreso', icon: <AddCircleIcon />, onClick: onNewIngreso }}
    />
  );
};

export default PortalSidebar;
