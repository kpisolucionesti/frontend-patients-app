import React from 'react';
import * as serviceWorker from './serviceWorker';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
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
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter basename={'/'} >
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();