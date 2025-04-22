/**
 * Test data fixtures for development and testing
 */

import type { BaseStop, DeliveryStop } from './delivery';
import type { RecurringFrequency, PreferredDay } from './recurring';
import type { DeliveryStatus } from './status';

/**
 * Sample customer data
 */
export const sampleCustomer = {
  id: 'cust-123',
  name: 'Acme Corporation',
  address: '123 Main St, Anytown, USA',
  phone: '555-123-4567',
  email: 'contact@acme.com',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

/**
 * Sample driver data
 */
export const sampleDriver = {
  id: 'drv-456',
  name: 'John Doe',
  phone: '555-987-6543',
  email: 'john.doe@example.com',
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
};

/**
 * Sample regular delivery stop
 */
export const sampleRegularStop: DeliveryStop = {
  id: 'stop-789',
  stop_number: 1,
  client_id: 'client-123',
  customer: sampleCustomer,
  driver_id: 'drv-456',
  driver: sampleDriver,
  driver_name: 'John Doe',
  items: '10 cords of firewood',
  itemsData: {
    quantity: 10,
    unit: 'cords',
    product: 'firewood',
    price: 350
  },
  notes: 'Leave at back entrance',
  status: 'PENDING' as DeliveryStatus,
  arrival_time: '2023-05-15T09:00:00Z',
  departure_time: '2023-05-15T10:00:00Z',
  created_at: '2023-05-01T00:00:00Z',
  updated_at: '2023-05-01T00:00:00Z'
};

/**
 * Sample recurring delivery stop
 */
export const sampleRecurringStop: DeliveryStop = {
  id: 'stop-790',
  stop_number: 1,
  client_id: 'client-123',
  customer: sampleCustomer,
  driver_id: 'drv-456',
  driver: sampleDriver,
  driver_name: 'John Doe',
  items: '5 cords of firewood',
  itemsData: {
    quantity: 5,
    unit: 'cords',
    product: 'firewood',
    price: 175
  },
  notes: 'Monthly delivery',
  status: 'PENDING' as DeliveryStatus,
  arrival_time: '2023-05-15T09:00:00Z',
  departure_time: '2023-05-15T10:00:00Z',
  created_at: '2023-05-01T00:00:00Z',
  updated_at: '2023-05-01T00:00:00Z',
  
  // Recurring-specific fields
  is_recurring: true,
  recurrence_frequency: 'monthly' as RecurringFrequency,
  preferred_day: 'monday' as PreferredDay,
  next_occurrence_date: '2023-06-19T00:00:00Z',
  recurrence_end_date: '2023-12-31T00:00:00Z',
  recurring_order_id: 'recur-123'
};

/**
 * Sample stop form data
 */
export const sampleStopFormData = {
  stop_number: 1,
  client_id: 'client-123',
  customer: sampleCustomer,
  driver_id: 'drv-456',
  driver: sampleDriver,
  driver_name: 'John Doe',
  items: '10 cords of firewood',
  itemsData: {
    quantity: 10,
    unit: 'cords',
    product: 'firewood',
    price: 350
  },
  notes: 'Leave at back entrance',
  status: 'PENDING' as DeliveryStatus,
  arrival_time: '2023-05-15T09:00:00Z',
  departure_time: '2023-05-15T10:00:00Z',
  
  // Recurring-specific fields
  is_recurring: false
}; 