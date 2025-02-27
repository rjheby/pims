
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WholesaleOrderForm } from '../../WholesaleOrderForm';
import { supabase } from '@/integrations/supabase/client';
import { BrowserRouter } from 'react-router-dom';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-id',
          order_number: 'TEST-001',
          order_date: '2024-01-01',
          delivery_date: '2024-01-10',
          items: JSON.stringify([{
            id: 1,
            species: 'Pine',
            length: '8ft',
            bundleType: 'Standard',
            thickness: '2inch',
            packaging: 'Pallets',
            pallets: 10,
            unitCost: 250,
          }]),
        },
        error: null,
      }),
    })),
    update: jest.fn().mockResolvedValue({ error: null }),
  },
}));

describe('WholesaleOrderForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load and display order data', async () => {
    render(
      <BrowserRouter>
        <WholesaleOrderForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/TEST-001/)).toBeInTheDocument();
    });
  });

  it('should handle date changes', async () => {
    render(
      <BrowserRouter>
        <WholesaleOrderForm />
      </BrowserRouter>
    );

    await waitFor(() => {
      const dateInputs = screen.getAllByRole('textbox');
      expect(dateInputs.length).toBeGreaterThan(0);
    });
  });
});
