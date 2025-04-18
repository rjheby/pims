/**
 * Type definitions for status-related entities and constants
 */

/**
 * Delivery status enum
 */
export type DeliveryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Delivery status options for dropdowns
 */
export const DELIVERY_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

/**
 * Get the badge variant for a delivery status
 */
export const getStatusBadgeVariant = (status: DeliveryStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'IN_PROGRESS':
      return 'default';
    case 'COMPLETED':
      return 'outline';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'secondary';
  }
}; 