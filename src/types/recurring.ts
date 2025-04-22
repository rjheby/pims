/**
 * Type definitions for recurring order related entities
 */

import type { Customer } from './customer';
import type { DeliveryStatus } from './status';

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
export type RecurringOrder = {
  id: string;
  client_id: string;
  customer?: Customer;
  items: string;
  frequency: RecurringFrequency;
  preferred_day?: PreferredDay;
  start_date: string | Date;
  end_date: string | Date;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Recurrence data for recurring stops - simplified to match new structure
 */
export type RecurrenceData = {
  isRecurring: boolean;
  frequency: RecurringFrequency;
  preferred_day?: PreferredDay;
  start_date?: string | Date;
  end_date?: string | Date;
  client_id?: string;
  items?: string;
};

/**
 * Recurring order form data
 */
export type RecurringOrderFormData = Omit<RecurringOrder, 'id' | 'created_at' | 'updated_at'>;

/**
 * Frequency options for dropdowns
 */
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' }
] as const;

/**
 * Preferred day options for dropdowns
 */
export const PREFERRED_DAY_OPTIONS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
] as const; 