import React from 'react';
import * as serviceWorker from './serviceWorker';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from './hooks/useSnackbar';

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0', light: '#e3f2fd', dark: '#0d47a1' },
    secondary: { main: '#7b1fa2', light: '#f3e5f5', dark: '#4a148c' },
    info: { main: '#0288d1' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02', light: '#fff3e0', dark: '#e65100' },
    error: { main: '#d32f2f' },
    background: { default: '#f0f4ff', paper: '#ffffff' },
    text: { primary: '#212121' },
  },
  typography: {
    fontSize: 14,
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          padding: '3px 10px',
          minHeight: 30,
        },
        contained: {
          padding: '3px 12px',
        },
        outlined: {
          padding: '3px 12px',
        },
      },
      defaultProps: {
        size: 'small',
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 5,
        },
      },
      defaultProps: {
        size: 'small',
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
          fontSize: '0.7rem',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#1565c0',
          color: '#ffffff',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.95rem',
          padding: '12px 24px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          paddingTop: 16,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: 16,
          gap: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename={'/'} >
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider><App /></SnackbarProvider>
    </ThemeProvider>
  </BrowserRouter>
);

serviceWorker.register();
