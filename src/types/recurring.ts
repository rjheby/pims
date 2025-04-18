/**
 * Type definitions for recurring order-related entities
 */

import { Customer } from './customer';

/**
 * Recurrence data for recurring stops
 */
export interface RecurrenceData {
  isRecurring: boolean;
  frequency: string;
  preferred_day?: string;
  start_date?: string;
  end_date?: string;
  client_id?: string;
  items?: string;
}

/**
 * RecurringOrder interface representing a recurring order
 */
export interface RecurringOrder {
  id: string;
  client_id: string;
  customer_id?: string;
  customer?: Customer;
  items: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  preferred_day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * RecurringOrderSchedule interface representing a schedule for recurring orders
 */
export interface RecurringOrderSchedule {
  id: string;
  recurring_order_id: string;
  schedule_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
} 