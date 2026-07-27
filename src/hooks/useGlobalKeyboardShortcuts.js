import { useEffect, useCallback } from 'react';

const SHORTCUTS = [
  {
    key: 'k',
    ctrl: true,
    description: 'Buscar paciente',
    action: (navigate) => navigate('/patients/pacientes'),
  },
  {
    key: 'd',
    ctrl: true,
    description: 'Ir al dashboard',
    action: (navigate) => navigate('/patients/dashboard'),
  },
  {
    key: 'e',
    ctrl: true,
    description: 'Portal de emergencia',
    action: (navigate) => navigate('/patients/portal'),
  },
];

export default function useGlobalKeyboardShortcuts(navigate) {
  const handleKeyDown = useCallback(
    (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      const key = e.key.toLowerCase();

      const shortcut = SHORTCUTS.find((s) => s.key === key);
      if (shortcut) {
        e.preventDefault();
        shortcut.action(navigate);
      }
    },
    [navigate],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return SHORTCUTS;
}
