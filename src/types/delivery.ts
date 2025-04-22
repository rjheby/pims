/**
 * Type definitions for delivery-related entities
 */

import type { Customer } from './customer';
import type { Driver } from './driver';
import type { DeliveryStatus } from './status';

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
  items: string;
  itemsData?: any;
  notes?: string;
  status?: DeliveryStatus;
  arrival_time?: string;
  departure_time?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Delivery stop type extending base stop with delivery-specific properties
 */
export type DeliveryStop = BaseStop & {
  master_schedule_id: string;
  recurrence_id?: string;
};

/**
 * Stop form data for creating/editing stops
 */
export type StopFormData = Omit<BaseStop, 'id' | 'created_at' | 'updated_at'> & {
  master_schedule_id?: string;
  recurrence_id?: string;
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
}; 