/**
 * Type definitions for customer-related entities
 */

/**
 * Customer interface representing a customer in the system
 */
export interface Customer {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  notes?: string;
  type?: 'RETAIL' | 'WHOLESALE' | 'OTHER';
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
} 