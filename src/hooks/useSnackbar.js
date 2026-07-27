import { createContext, useCallback, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const SnackbarContext = createContext({ show: () => {} });

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [snack, setSnack] = useState({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 4000,
  });

  const show = useCallback((message, opts) => {
    if (typeof opts === 'string') {
      setSnack({ open: true, message, severity: opts, autoHideDuration: 4000 });
    } else if (opts && typeof opts === 'object') {
      setSnack({
        open: true,
        message,
        severity: opts.severity || 'info',
        autoHideDuration: opts.autoHideDuration || 4000,
      });
    } else {
      setSnack({ open: true, message, severity: 'info', autoHideDuration: 4000 });
    }
  }, []);

  const handleClose = useCallback(() => {
    setSnack((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <Snackbar
        open={snack.open}
        autoHideDuration={snack.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
