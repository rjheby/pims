
/**
 * Type exports for wholesale order module
 */

// Re-export types using proper 'export type' syntax for isolated modules
export type { Palette } from './palette';
export type { WoodProduct } from './wood';
export type { WoodOrder } from './order';
export type { OrderItem, OrderItemDetail } from './orderItem';
export type { BundleType, Length, Species, Thickness } from './orderOptions';
export type { PricingTier } from './pricing';
export type { OrderStatus } from './status';
export type { OrderTemplate } from './template';
export * from './utils';

// Export any non-type values normally
export { formatCurrency, calculateOrderTotal } from './utils';
export { BUNDLE_TYPES, SPECIES_OPTIONS, LENGTH_OPTIONS, THICKNESS_OPTIONS } from './orderOptions';
export { ORDER_STATUS_OPTIONS, getStatusColor } from './status';
