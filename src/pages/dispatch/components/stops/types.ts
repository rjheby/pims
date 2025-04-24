
/**
 * Type definitions for the dispatch stops components
 */

import { Customer } from "@/types/customer";
import { Driver } from "@/types/driver";
import { DeliveryStatus, DELIVERY_STATUS_OPTIONS, getStatusBadgeVariant } from "@/types/status";
import { RecurringFrequency, PreferredDay } from "@/types/recurring";

/**
 * Represents a date range with start and end dates
 * Used for filtering and querying date-based operations
 */
export type DateRange = {
  start: string;
  end: string;
};

/**
 * Item data structure for delivery items
 * Represents the detailed information about a single item in a delivery
 */
export interface ItemData {
  quantity: number;
  unit: string;
  product: string;
  price: number;
}

/**
 * DeliveryStop interface representing a stop in a delivery route
 * This is the hydrated version with full objects for customer and driver
 * Alias maintained for clarity in service and component signatures
 */
export interface DeliveryStop {
  id?: string;
  stop_number: number;
  client_id: string;
  customer?: Customer;
  driver_id?: string;
  driver?: Driver;
  driver_name?: string;
  items: string;
  itemsData?: ItemData[];
  notes?: string;
  status?: DeliveryStatus;
  arrival_time?: string;
  departure_time?: string;
  created_at?: string;
  updated_at?: string;
  master_schedule_id?: string;
  is_recurring?: boolean;
  recurrence_id?: string;
  recurring_order_id?: string;
}

/**
 * Form data for editing a stop
 * This version uses IDs for customer and driver instead of full objects
 * for form handling and API submission
 */
export interface StopFormData {
  customer: string;
  driver: string;
  notes: string;
  is_recurring: boolean;
  recurrence_frequency: RecurringFrequency;
  preferred_day: PreferredDay;
  next_occurrence_date: Date | null;
  recurrence_end_date: Date | null;
  recurring_order_id?: string;
  stop_number: number;
  client_id?: string;
  items?: string;
}

/**
 * Recurrence data for recurring stops
 */
export interface RecurrenceData {
  isRecurring: boolean;
  frequency: RecurringFrequency;
  preferred_day?: PreferredDay;
  start_date?: string | Date;
  end_date?: string | Date;
  client_id?: string;
  items?: string;
}

/**
 * RecurringOrder interface representing a recurring order
 */
export interface RecurringOrder {
  id: string;
  client_id: string;
  customer?: Customer;
  items: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  preferred_day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_date: string;
  end_date: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Export status options and variant helper function
export { DELIVERY_STATUS_OPTIONS, getStatusBadgeVariant };

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
