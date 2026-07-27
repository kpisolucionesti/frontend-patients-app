import { createContext, useCallback, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const SnackbarContext = createContext({ show: () => {} });

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  const show = useCallback((message, severity = 'info') => {
    setSnack({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setSnack((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleClose} severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
