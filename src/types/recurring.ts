
/**
 * Type definitions for recurring order related entities
 */

import type { Customer } from './customer';

/**
 * Frequency type for recurring orders
 */
export type RecurringFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly';

/**
 * Preferred day type for recurring orders
 */
export type PreferredDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Recurring order type - simplified to match new database structure
 */
export interface RecurringOrder {
  id: string;
  client_id?: string;
  customer_id: string;  // Added to match code usage in RecurringOrderScheduler
  customer?: Customer;
  items: string;
  frequency: RecurringFrequency;
  preferred_day?: PreferredDay;
  start_date?: string | Date;
  end_date?: string | Date;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Recurrence data for recurring stops - simplified to match new structure
 */
export interface RecurrenceData {
  isRecurring: boolean;
  frequency: RecurringFrequency;
  preferred_day?: PreferredDay;
  start_date?: string | Date;
  end_date?: string | Date;
  client_id?: string;
  items?: string;
}

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' }
] as const;

export const PREFERRED_DAY_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
] as const;
