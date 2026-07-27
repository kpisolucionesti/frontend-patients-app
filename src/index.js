import React from 'react';
import * as serviceWorker from './serviceWorker';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from './hooks/useSnackbar';
import { AuthProvider } from './hooks/useAuth';
import ColorModeContext from './context/ColorModeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 3 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const lightPalette = {
  primary: { main: '#1565c0', light: '#e3f2fd', dark: '#0d47a1' },
  secondary: { main: '#7b1fa2', light: '#f3e5f5', dark: '#4a148c' },
  info: { main: '#0288d1' },
  success: { main: '#2e7d32' },
  warning: { main: '#ed6c02', light: '#fff3e0', dark: '#e65100' },
  error: { main: '#d32f2f' },
  background: { default: '#f0f4ff', paper: '#ffffff' },
  text: { primary: '#212121', secondary: '#616161' },
  divider: '#e0e0e0',
};

const darkPalette = {
  primary: { main: '#5b9bd5', light: '#1a3a5c', dark: '#90caf9' },
  secondary: { main: '#ce93d8', light: '#3a1a4a', dark: '#e1bee7' },
  info: { main: '#4fc3f7' },
  success: { main: '#66bb6a' },
  warning: { main: '#ffa726', light: '#3e2a10', dark: '#ffb74d' },
  error: { main: '#ef5350' },
  background: { default: '#0a1628', paper: '#111d2e' },
  text: { primary: '#e8edf5', secondary: '#a0aec0' },
  divider: '#1e2a40',
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        fontSize: '0.875rem',
        padding: '6px 16px',
        minHeight: 44,
      },
      contained: { padding: '6px 20px' },
      outlined: { padding: '6px 20px' },
    },
  },
  MuiIconButton: {
    styleOverrides: { root: { padding: 10 } },
  },
  MuiChip: {
    styleOverrides: { root: { height: 32, fontSize: '0.8125rem' } },
  },
  MuiDialogContent: {
    styleOverrides: { root: { paddingTop: 16 } },
  },
  MuiDialogActions: {
    styleOverrides: { root: { padding: 16, gap: 8 } },
  },
  MuiPaper: {
    styleOverrides: { root: { borderRadius: 8 } },
  },
};

function makeTheme(palette) {
  return createTheme({
    palette: { mode: palette === darkPalette ? 'dark' : 'light', ...palette },
    typography: {
      fontSize: 16,
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      ...sharedComponents,
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: palette.primary.main,
            color: palette.primary.contrastText || '#ffffff',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '12px 24px',
          },
        },
      },
    },
  });
}

function ThemedApp() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState(() => {
    const saved = localStorage.getItem('emr-color-mode');
    return saved || (prefersDark ? 'dark' : 'light');
  });

  const toggleColorMode = React.useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('emr-color-mode', next);
      return next;
    });
  }, []);

  const palette = mode === 'dark' ? darkPalette : lightPalette;
  const theme = React.useMemo(() => makeTheme(palette), [palette]);
  const contextValue = React.useMemo(() => ({ toggleColorMode }), [toggleColorMode]);

  return (
    <ColorModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider><AuthProvider><QueryClientProvider client={queryClient}><App /></QueryClientProvider></AuthProvider></SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export { ColorModeContext };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename={'/'} >
    <ThemedApp />
  </BrowserRouter>
);

serviceWorker.register();
