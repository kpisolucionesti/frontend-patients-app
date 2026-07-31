import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../../hooks/useAuth';
import SignIn from './SignIn';

vi.mock('../../services/BackendApi');
vi.mock('../../hooks/useCompanySettings', () => ({
  default: () => ({ companyName: 'Test', logoUrl: null }),
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('SignIn', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders username and password fields', () => {
    renderWithProviders(<SignIn />);
    const inputs = screen.getAllByRole('textbox');
    const passwordInputs = screen.getAllByLabelText(/contraseña/i);
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders login button', () => {
    renderWithProviders(<SignIn />);
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
});