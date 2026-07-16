import { render, screen, waitFor } from '@testing-library/react';
import MedicalPlanSection from './MedicalPlanSection';

const mockPlans = [
  { id: 1, description: 'Paracetamol 500mg', indication_type: 'medication', status: 'active', doctor: { id: 1, name: 'Dr. Test' } },
  { id: 2, description: 'Radiografia de torax', indication_type: 'image', status: 'completed', doctor: null },
];

jest.mock('../../hooks/useFetch');
const { useFetch } = require('../../hooks/useFetch');

describe('MedicalPlanSection', () => {
  beforeEach(() => {
    localStorage.setItem('user_permissions', JSON.stringify(['emergencia.edit']));
    useFetch.mockReturnValue({ data: mockPlans, loading: false, error: null, refetch: jest.fn() });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('shows active medical plans', async () => {
    render(<MedicalPlanSection emergencyId={1} />);
    await waitFor(() => {
      expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument();
    });
  });

  it('shows completed plans under a separate section', async () => {
    render(<MedicalPlanSection emergencyId={1} />);
    await waitFor(() => {
      expect(screen.getByText('Completadas (1)')).toBeInTheDocument();
      expect(screen.getByText('Radiografia de torax')).toBeInTheDocument();
    });
  });

  it('shows add button with edit permission', async () => {
    render(<MedicalPlanSection emergencyId={1} />);
    await waitFor(() => {
      expect(screen.getByText('Agregar Indicación')).toBeInTheDocument();
    });
  });

  it('hides add button in read-only mode', () => {
    render(<MedicalPlanSection emergencyId={1} readOnly />);
    expect(screen.queryByText('Agregar Indicación')).not.toBeInTheDocument();
  });
});
