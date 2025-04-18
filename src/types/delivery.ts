/**
 * Type definitions for delivery-related entities
 */

/**
 * DeliveryStop interface representing a stop in a delivery route
 */
export interface DeliveryStop {
  id?: string;
  stop_number: number;
  client_id: string;
  customer_id?: string;
  customer?: Customer;
  driver_id?: string;
  driver?: Driver;
  items: string;
  itemsData?: any;
  notes?: string;
  status?: DeliveryStatus;
  arrival_time?: string;
  departure_time?: string;
  created_at?: string;
  updated_at?: string;
  master_schedule_id?: string;
  recurrence_id?: string;
}

/**
 * Form data for editing a stop
 */
export interface StopFormData {
  client_id: string;
  customer_id?: string;
  customer?: Customer;
  driver_id?: string;
  driver?: Driver;
  items: string;
  notes?: string;
  status?: DeliveryStatus;
  stop_number?: number;
  master_schedule_id?: string;
  recurrence_id?: string;
  itemsData?: any;
}

/**
 * Stop interface for internal use
 */
export interface Stop {
  id?: string;
  stop_number: number;
  client_id: string;
  customer_id?: string;
  customer?: Customer;
  driver_id?: string;
  driver?: Driver;
  items: string;
  itemsData?: any;
  notes?: string;
  status?: DeliveryStatus;
  arrival_time?: string;
  departure_time?: string;
  created_at?: string;
  updated_at?: string;
  master_schedule_id?: string;
  recurrence_id?: string;
}

// Import these types to avoid circular dependencies
import { Customer } from './customer';
import { Driver } from './driver';
import { DeliveryStatus } from './status'; 