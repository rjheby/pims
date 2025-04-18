/**
 * Type definitions for the dispatch stops components
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

/**
 * DeliveryStop interface representing a stop in a delivery route
 */
export interface DeliveryStop {
  id?: string;
  stop_number: number;
  client_id: string;
  customer?: Customer;
  driver_id?: string;
  driver?: Driver;
  items: string;
  itemsData?: any;
  notes?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  arrival_time?: string;
  departure_time?: string;
  created_at?: string;
  updated_at?: string;
  master_schedule_id?: string;
  recurrence_id?: string;
}

/**
 * Form data for editing a stop
 */
export interface StopFormData {
  client_id: string;
  customer?: Customer;
  driver_id?: string;
  driver?: Driver;
  items: string;
  notes?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  stop_number?: number;
  master_schedule_id?: string;
  recurrence_id?: string;
  itemsData?: any;
}

/**
 * Recurrence data for recurring stops
 */
export interface RecurrenceData {
  isRecurring: boolean;
  frequency: string;
  preferred_day?: string;
  start_date?: string;
  end_date?: string;
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
