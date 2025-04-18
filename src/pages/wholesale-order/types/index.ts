// Re-export types from separate files to maintain a centralized type hub
export * from './orderTypes';
export * from './productTypes';
export * from './constants';

// Re-export from centralized types
export type { Customer } from '@/types';

// Re-export from parent types.ts, but avoid conflicts
// with constants.ts exports by being explicit
export type {
  WholesaleOrderItem,
  WholesaleOrder,
  DropdownOptions,
  RetailInventoryItem,
  FirewoodProduct,
  ProcessingRecord,
  InventoryItem,
  WoodProduct
} from '../types';

export {
  generateEmptyOrderItem,
  serializeOrderItems,
  safeNumber,
  supabaseSafeFrom,
  supabaseSafeRpc
} from '../types';
