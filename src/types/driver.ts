/**
 * Type definitions for driver-related entities
 */

/**
 * Driver type representing a delivery driver
 */
export type Driver = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type?: string;
  license_number?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Driver form data for creating/editing drivers
 */
export type DriverFormData = Omit<Driver, 'id' | 'created_at' | 'updated_at'>;

/**
 * Driver status type
 */
export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

/**
 * Driver status options for dropdowns
 */
export const DRIVER_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BUSY', label: 'Busy' },
  { value: 'OFFLINE', label: 'Offline' }
];

/**
 * Driver search filters
 */
export type DriverFilters = {
  search?: string;
  status?: DriverStatus;
  is_active?: boolean;
}; 