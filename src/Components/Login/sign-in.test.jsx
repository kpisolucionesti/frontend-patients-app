import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from './sign-in';

jest.mock('../../services/BackendApi');

describe('SignIn', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders username and password fields', () => {
    render(<BrowserRouter><SignIn /></BrowserRouter>);
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrasena/i)).toBeInTheDocument();
  });

  it('shows error when fields are empty', async () => {
    render(<BrowserRouter><SignIn /></BrowserRouter>);
    fireEvent.click(screen.getByText('Entrar'));
    await waitFor(() => {
      expect(screen.getByText('Por favor llenar todos los campos')).toBeInTheDocument();
    });
  });
});
