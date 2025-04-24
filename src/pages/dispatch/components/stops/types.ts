
/**
 * Type definitions for the dispatch stops components
 */

import { 
  Customer, 
  Driver, 
  DeliveryStatus, 
  ItemData,
  DeliveryStop as BaseDeliveryStop,
  StopFormData as BaseStopFormData,
  RecurringFrequency,
  PreferredDay,
  RecurrenceData as BaseRecurrenceData,
  RecurringOrder as BaseRecurringOrder
} from '@/types';

// Re-export status options and variant helper from centralized types
import { DELIVERY_STATUS_OPTIONS, getStatusBadgeVariant } from '@/types/status';
export { DELIVERY_STATUS_OPTIONS, getStatusBadgeVariant };

/**
 * Represents a date range with start and end dates
 * Used for filtering and querying date-based operations
 */
export type DateRange = {
  start: string;
  end: string;
};

/**
 * DeliveryStop interface - ensure compatibility with the centralized type
 * while adding any component-specific extensions
 */
export interface DeliveryStop extends BaseDeliveryStop {
  // Any component-specific extensions can go here
}

/**
 * Form data for editing a stop - ensure compatibility with centralized type
 */
export interface StopFormData extends BaseStopFormData {
  // Any component-specific extensions can go here
}

/**
 * Recurrence data for recurring stops
 */
export interface RecurrenceData extends BaseRecurrenceData {
  // Any component-specific extensions can go here
}

/**
 * RecurringOrder interface 
 */
export interface RecurringOrder extends BaseRecurringOrder {
  // Any component-specific extensions can go here
}

/**
 * Props for the StopsTable component
 */
export interface StopsTableProps {
  stops: DeliveryStop[];
  onStopsChange: (newStops: DeliveryStop[]) => void;
  useMobileLayout?: boolean;
  readOnly?: boolean;
  masterScheduleId?: string;
  customers?: Customer[];
  drivers?: Driver[];
}

/**
 * Props for the StopDialogs component
 */
export interface StopDialogsProps {
  customerDialogOpen: boolean;
  setCustomerDialogOpen: (open: boolean) => void;
  itemsDialogOpen: boolean;
  setItemsDialogOpen: (open: boolean) => void;
  onCustomerSelect: (customer: Customer) => void;
  onItemsSelect: (items: string) => void;
  onCancel: () => void;
  initialCustomerId?: string;
  initialItems?: string;
  recurrenceData?: RecurrenceData;
  onRecurrenceChange?: (data: RecurrenceData) => void;
  customers: Customer[];
}

/**
 * Props for the CustomerDialog component
 */
export interface CustomerDialogProps {
  onSelect: (customer: Customer) => void;
  onCancel: () => void;
  selectedCustomerId?: string;
  customers: Customer[];
}

/**
 * Props for the ItemSelector component
 */
export interface ItemSelectorProps {
  onSelect: (items: string) => void;
  onCancel: () => void;
  initialItems?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  recurrenceData?: RecurrenceData;
}

/**
 * Props for the RecurrenceSettingsForm component
 */
export interface RecurrenceSettingsFormProps {
  data: RecurrenceData;
  onChange: (data: RecurrenceData) => void;
  onCancel: () => void;
}

/**
 * Props for the UseStopsDialogs hook
 */
export interface UseStopsDialogsProps {
  stops: DeliveryStop[];
  onStopsChange: (newStops: DeliveryStop[]) => void;
  customers: Customer[];
  drivers: Driver[];
  initialItems?: string;
  masterScheduleId?: string;
}

/**
 * Return type for the useStopsDialogs hook
 */
export interface UseStopsDialogsReturn {
  editingIndex: number | null;
  isAddingNewStop: boolean;
  customerDialogOpen: boolean;
  setCustomerDialogOpen: (open: boolean) => void;
  itemsDialogOpen: boolean;
  setItemsDialogOpen: (open: boolean) => void;
  editForm: StopFormData;
  setEditForm: (form: StopFormData) => void;
  recurrenceData: RecurrenceData | undefined;
  handleAddStop: () => void;
  handleEditStart: (index: number) => void;
  handleEditSave: () => void;
  handleEditCancel: () => void;
  handleCustomerSelect: (customer: Customer) => void;
  handleItemsSelect: (items: string) => void;
  openCustomerDialog: () => void;
  openItemsDialog: () => void;
}
