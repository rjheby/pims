
import { generateOrderPDF } from '../utils/pdfGenerator';
import { OrderItem } from '../types';

describe('Order PDF Generator', () => {
  const mockOrderData = {
    order_number: 'TEST-001',
    order_date: '2024-01-01',
    delivery_date: '2024-01-10',
    items: [
      {
        id: 1,
        species: 'Pine',
        length: '8ft',
        bundleType: 'Standard',
        thickness: '2inch',
        packaging: 'Pallets',
        pallets: 10,
        unitCost: 250,
      },
    ] as OrderItem[],
    totalPallets: 10,
    totalValue: 2500,
  };

  it('should generate a PDF document', () => {
    const pdf = generateOrderPDF(mockOrderData);
    expect(pdf).toBeTruthy();
    expect(typeof pdf.output).toBe('function');
  });
});
