
/**
 * Type definitions for delivery-related entities
 */

import type { Customer } from './customer';
import type { Driver } from './driver';
import type { DeliveryStatus } from './status';
import type { RecurringFrequency, PreferredDay } from './recurring';

/**
 * Base stop type with common properties
 */
export type BaseStop = {
  id?: string;
  stop_number: number;
  client_id: string;
  customer?: Customer;
  driver_id?: string;
  driver?: Driver;
  driver_name?: string;
  items: string;
  itemsData?: Record<string, unknown>;
  notes?: string;
  status?: DeliveryStatus;
  arrival_time?: string;
  departure_time?: string;
  created_at?: string;
  updated_at?: string;
  master_schedule_id?: string;
  
  // New recurring fields
  is_recurring?: boolean;
  recurrence_frequency?: RecurringFrequency;
  preferred_day?: PreferredDay;
  next_occurrence_date?: string | Date;
  recurrence_end_date?: string | Date;
  recurring_order_id?: string;
};

/**
 * Delivery stop type - now just an alias for BaseStop since we've consolidated the fields
 * Alias maintained for clarity in service and component signatures
 */
export type DeliveryStop = BaseStop;

/**
 * Stop form data for creating/editing stops
 */
export type StopFormData = Omit<BaseStop, 'id' | 'created_at' | 'updated_at'> & {
  customer: string;  // Changed from client_id for form usage
  driver: string;    // Changed from driver_id for form usage
  is_recurring: boolean;
  stop_number: number; // Ensure stop_number is required
};

/**
 * Stop search filters
 */
export type StopFilters = {
  search?: string;
  status?: DeliveryStatus;
  driver_id?: string;
  client_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  is_recurring?: boolean;
}; 
