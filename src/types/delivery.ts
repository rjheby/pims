
/**
 * Type definitions for delivery-related entities
 */

import type { Customer } from './customer';
import type { Driver } from './driver';
import type { DeliveryStatus } from './status';
import type { RecurringFrequency, PreferredDay } from './recurring';

export interface ItemData {
  quantity: number;
  unit: string;
  product: string;
  price: number;
  name?: string; // Adding name property needed by components
}

/**
 * Base stop type with common properties
 */
export interface BaseStop {
  id?: string;
  stop_number: number;
  client_id: string;
  customer?: Customer;
  driver_id?: string;
  driver?: Driver;
  driver_name?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  items: string;
  itemsData?: ItemData[];
  notes?: string;
  status?: DeliveryStatus;
  arrival_time?: string;
  departure_time?: string;
  created_at?: string;
  updated_at?: string;
  master_schedule_id?: string;
  price?: number;
  
  // Recurring fields
  is_recurring?: boolean;
  recurrence_frequency?: RecurringFrequency;
  preferred_day?: PreferredDay;
  next_occurrence_date?: string | Date;
  recurrence_end_date?: string | Date;
  recurring_order_id?: string;
}

/**
 * Delivery stop type with all required fields
 */
export interface DeliveryStop extends BaseStop {
  stop_number: number;
  customer_name: string;
  driver_name?: string;
  status: DeliveryStatus;
  price?: number;
}

/**
 * Stop form data for creating/editing stops
 */
export interface StopFormData {
  customer: string;  // Changed from client_id for form usage
  driver: string;    // Changed from driver_id for form usage
  notes: string;
  is_recurring: boolean;
  recurrence_frequency: RecurringFrequency;
  preferred_day: PreferredDay;
  next_occurrence_date: Date | null;
  recurrence_end_date: Date | null;
  recurring_order_id?: string;
  stop_number: number;
  client_id?: string;
  items?: string;
}

/**
 * Stop search filters
 */
export interface StopFilters {
  search?: string;
  status?: DeliveryStatus;
  driver_id?: string;
  client_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  is_recurring?: boolean;
}
