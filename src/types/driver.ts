/**
 * Type definitions for driver-related entities
 */

/**
 * Driver interface representing a delivery driver
 */
export interface Driver {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  vehicle_type?: string;
  license_number?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
} 