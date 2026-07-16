import { Box, Button, Typography } from '@mui/material';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
          <Typography variant="h5" color="error">Algo salió mal</Typography>
          <Typography variant="body2" color="text.secondary">{this.state.error?.message}</Typography>
          <Button variant="contained" onClick={this.handleReload}>Reintentar</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
