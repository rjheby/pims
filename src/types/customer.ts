/**
 * Type definitions for customer-related entities
 */

/**
 * Customer type representing a customer in the system
 */
export type Customer = {
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
};

/**
 * Customer type options for dropdowns
 */
export const CUSTOMER_TYPE_OPTIONS = [
  { value: 'RETAIL', label: 'Retail' },
  { value: 'WHOLESALE', label: 'Wholesale' },
  { value: 'OTHER', label: 'Other' }
];

/**
 * Customer form data for creating/editing customers
 */
export type CustomerFormData = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

/**
 * Customer search filters
 */
export type CustomerFilters = {
  search?: string;
  type?: Customer['type'];
  city?: string;
  state?: string;
}; 