# Scheduling and Dispatch System - Technical Documentation

This document provides detailed technical information about the Scheduling and Dispatch module of the Firewood Delivery Management System. It covers data structures, components, workflows, and implementation details.

## Overview

The Scheduling and Dispatch System manages the creation, editing, and execution of delivery schedules. It handles customer assignments, driver management, stop sequencing, and delivery status tracking, with optimizations for capacity and route efficiency.

## Data Model

### Core Entities

#### Dispatch Schedules
```typescript
interface DispatchSchedule {
  id: string;                // Primary key
  schedule_date: string;     // Date of deliveries
  schedule_number: string;   // Unique identifier (e.g., "SCH-2025-03-15")
  status: ScheduleStatus;    // Planning, Ready, In Progress, Completed
  notes: string;             // Additional information
  created_by: string;        // User reference
  created_at: string;        // Creation timestamp
  updated_at: string;        // Last update timestamp
}

type ScheduleStatus = 'PLANNING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED';
```

#### Delivery Stops
```typescript
interface DeliveryStop {
  id: string;                // Primary key
  schedule_id: string;       // Reference to DispatchSchedule
  customer_id: string;       // Reference to customer
  driver_id: string;         // Reference to driver
  sequence: number;          // Delivery order in route
  items: string;             // Formatted string of items (e.g., "2x Oak Bundle, 1x Kindling")
  price: number;             // Total price for this delivery
  status: DeliveryStatus;    // Pending, En Route, Completed, etc.
  arrive_by: string;         // Required arrival time
  notes: string;             // Delivery instructions
  created_at: string;        // Creation timestamp
  updated_at: string;        // Last update timestamp
  customer?: Customer;       // Joined customer data
  driver?: Driver;           // Joined driver data
}

type DeliveryStatus = 'PENDING' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'ISSUE' | 'CANCELLED';
```

#### Drivers
```typescript
interface Driver {
  id: string;                // Primary key
  name: string;              // Driver's name
  email: string;             // Contact email
  phone: string;             // Contact phone
  status: DriverStatus;      // Active, Inactive, On Leave
  max_stops: number;         // Maximum stops per day
  max_items: number;         // Maximum items per load
  areas: string[];           // Preferred delivery areas
  profile_id?: string;       // Link to user profile (if applicable)
  created_at: string;        // Creation timestamp
  updated_at: string;        // Last update timestamp
}

type DriverStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
```

#### Delivery Archives
```typescript
interface DeliveryArchive {
  id: string;                // Primary key
  schedule_id: string;       // Reference to original schedule
  delivery_date: string;     // Date delivered
  total_stops: number;       // Number of stops
  total_items: number;       // Number of items delivered
  total_revenue: number;     // Total revenue
  drivers: string[];         // Array of driver IDs
  created_at: string;        // Archive creation timestamp
}
```

### Database Schema

The Supabase PostgreSQL database implements these tables with the following relationships:

- `dispatch_schedules`: Stores master delivery schedule information
- `delivery_stops`: Stores individual delivery information, with foreign keys to schedules, customers, and drivers
- `drivers`: Stores driver information and capabilities
- `delivery_archives`: Stores completed schedule summaries for historical reference
- `delivery_photos`: Stores delivery confirmation photos with foreign keys to delivery_stops

Additional supporting tables:
- `delivery_templates`: Stores reusable schedule templates
- `driver_availability`: Tracks when drivers are available
- `delivery_zones`: Defines geographic delivery boundaries

## Components

### DispatchContext

The `DispatchContext` provides global state management for scheduling operations:

```typescript
// src/context/DispatchContext.tsx
export const DispatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State variables for dispatch data
  const [schedules, setSchedules] = useState<DispatchSchedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<DispatchSchedule | null>(null);
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  // Loading state flags
  const [loadingSchedules, setLoadingSchedules] = useState<boolean>(false);
  const [loadingStops, setLoadingStops] = useState<boolean>(false);
  const [loadingDrivers, setLoadingDrivers] = useState<boolean>(false);
  
  // Fetch functions to load data from Supabase
  const refreshSchedules = async (startDate?: Date, endDate?: Date) => { /* ... */ };
  const loadScheduleDetails = async (scheduleId: string) => { /* ... */ };
  const refreshDrivers = async () => { /* ... */ };
  
  // CRUD operations for schedule management
  const createSchedule = async (date: Date, notes?: string) => { /* ... */ };
  const updateSchedule = async (id: string, updates: Partial<DispatchSchedule>) => { /* ... */ };
  const deleteSchedule = async (id: string) => { /* ... */ };
  
  // CRUD operations for stop management
  const addStop = async (stop: Omit<DeliveryStop, 'id' | 'created_at' | 'updated_at'>) => { /* ... */ };
  const updateStop = async (id: string, updates: Partial<DeliveryStop>) => { /* ... */ };
  const deleteStop = async (id: string) => { /* ... */ };
  const reorderStops = async (stopIds: string[]) => { /* ... */ };
  
  // Schedule utilities
  const calculateCapacity = (scheduleId: string, driverId?: string) => { /* ... */ };
  const validateSchedule = (scheduleId: string) => { /* ... */ };
  const finalizeSchedule = async (scheduleId: string) => { /* ... */ };
  const generateDriverSchedules = async (scheduleId: string) => { /* ... */ };
  
  // Value object for context provider
  const value = {
    schedules,
    currentSchedule,
    stops,
    drivers,
    loadingSchedules,
    loadingStops,
    loadingDrivers,
    refreshSchedules,
    loadScheduleDetails,
    createSchedule,
    // ... other properties and methods
  };
  
  return (
    <DispatchContext.Provider value={value}>
      {children}
    </DispatchContext.Provider>
  );
};
```

### Key Components

#### DispatchCalendar
Provides a calendar view of all scheduled deliveries:

```tsx
// src/components/dispatch/DispatchCalendar.tsx
const DispatchCalendar: React.FC = () => {
  const { schedules, loadingSchedules, refreshSchedules } = useDispatch();
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');
  
  // Component state and functionality
  // ...

  return (
    // Calendar rendering with different view types
    // ...
  );
};
```

#### DispatchForm
Manages the creation and editing of delivery schedules:

```tsx
// src/components/dispatch/DispatchForm.tsx
interface DispatchFormProps {
  scheduleId?: string;
}

const DispatchForm: React.FC<DispatchFormProps> = ({ scheduleId }) => {
  const { 
    currentSchedule, 
    stops, 
    loadScheduleDetails, 
    updateSchedule,
    addStop,
    updateStop,
    deleteStop,
    reorderStops
  } = useDispatch();
  
  // Component state and functionality
  // ...

  return (
    // Dispatch form rendering
    // ...
  );
};
```

#### StopsTable
Displays and manages delivery stops within a schedule:

```tsx
// src/components/dispatch/StopsTable.tsx
interface StopsTableProps {
  stops: DeliveryStop[];
  onAddStop: () => void;
  onEditStop: (id: string) => void;
  onDeleteStop: (id: string) => void;
  onReorderStops: (stopIds: string[]) => void;
  isEditable: boolean;
}

const StopsTable: React.FC<StopsTableProps> = ({ 
  stops,
  onAddStop,
  onEditStop,
  onDeleteStop,
  onReorderStops,
  isEditable
}) => {
  // Component state and functionality
  // ...

  return (
    <div className="overflow-x-auto">
      {/* Table rendering with desktop and mobile variants */}
      {isMobile() ? <StopsMobileCards {...props} /> : <StopsDesktopTable {...props} />}
    </div>
  );
};
```

#### StopEditor
Handles the creation and editing of individual delivery stops:

```tsx
// src/components/dispatch/StopEditor.tsx
interface StopEditorProps {
  initialData?: Partial<DeliveryStop>;
  scheduleId: string;
  onSave: (stop: Omit<DeliveryStop, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
}

const StopEditor: React.FC<StopEditorProps> = ({ 
  initialData, 
  scheduleId,
  onSave, 
  onCancel 
}) => {
  // Form state and handlers
  // ...

  return (
    // Form rendering with customer, driver, and item selection
    // ...
  );
};
```

#### ItemSelector
Allows selecting products for delivery:

```tsx
// src/components/dispatch/ItemSelector.tsx
interface ItemSelectorProps {
  initialItems?: string;
  onChange: (items: string) => void;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({ initialItems, onChange }) => {
  const { firewoodProducts } = useInventory();
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Parse initial items on component mount
  useEffect(() => {
    if (initialItems) {
      parseItemsString(initialItems);
    }
  }, [initialItems]);
  
  // Convert selected items back to string format
  const formatItemsAsString = (): string => {
    let result: string[] = [];
    
    // Add product items
    selectedItems.forEach((quantity, productId) => {
      const product = firewoodProducts.find(p => p.id === productId);
      if (product && quantity > 0) {
        result.push(`${quantity}x ${product.item_name}`);
      }
    });
    
    // Add custom items
    customItems.forEach(item => {
      if (item.trim()) {
        result.push(item);
      }
    });
    
    return result.join(', ');
  };
  
  // Parse items string into selected items and custom items
  const parseItemsString = (itemsStr: string) => {
    const newSelectedItems = new Map<string, number>();
    const newCustomItems: string[] = [];
    
    if (!itemsStr) return;
    
    const itemsArray = itemsStr.split(',').map(s => s.trim()).filter(Boolean);
    
    itemsArray.forEach(item => {
      // Check for quantity format (e.g., "2x Oak Bundle")
      const quantityMatch = item.match(/^(\d+)x\s+(.+)$/);
      
      if (quantityMatch) {
        const quantity = parseInt(quantityMatch[1], 10);
        const itemName = quantityMatch[2].trim();
        
        // Try to find matching product
        const product = firewoodProducts.find(p => 
          p.item_name.toLowerCase() === itemName.toLowerCase()
        );
        
        if (product) {
          newSelectedItems.set(product.id, quantity);
        } else {
          newCustomItems.push(item);
        }
      } else {
        newCustomItems.push(item);
      }
    });
    
    setSelectedItems(newSelectedItems);
    setCustomItems(newCustomItems);
  };
  
  // Handle quantity changes
  const handleQuantityChange = (productId: string, quantity: number) => {
    const newItems = new Map(selectedItems);
    
    if (quantity <= 0) {
      newItems.delete(productId);
    } else {
      newItems.set(productId, quantity);
    }
    
    setSelectedItems(newItems);
    onChange(formatItemsAsString());
  };
  
  // Handle adding custom items
  const handleAddCustomItem = (item: string) => {
    if (item.trim()) {
      setCustomItems([...customItems, item]);
      onChange(formatItemsAsString());
    }
  };
  
  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return firewoodProducts;
    
    const search = searchTerm.toLowerCase();
    return firewoodProducts.filter(product => 
      product.item_name.toLowerCase().includes(search) ||
      product.species.toLowerCase().includes(search)
    );
  }, [firewoodProducts, searchTerm]);
  
  return (
    <div className="space-y-4">
      {/* Search input */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
      
      {/* Product list */}
      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
        {filteredProducts.map(product => (
          <div key={product.id} className="flex items-center justify-between p-2 border-b">
            <div>
              <span className="font-medium">{product.item_name}</span>
              <span className="text-sm text-gray-500 ml-1">({product.species})</span>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleQuantityChange(
                  product.id, 
                  (selectedItems.get(product.id) || 0) - 1
                )}
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                -
              </button>
              <span className="w-8 text-center">
                {selectedItems.get(product.id) || 0}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(
                  product.id, 
                  (selectedItems.get(product.id) || 0) + 1
                )}
                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Custom item input */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Add custom item (e.g., '2x Special Bundle')"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddCustomItem(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            const input = document.querySelector('input[placeholder="Add custom item"]') as HTMLInputElement;
            if (input) {
              handleAddCustomItem(input.value);
              input.value = '';
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Add
        </button>
      </div>
      
      {/* Selected items preview */}
      <div className="mt-2">
        <h4 className="font-medium">Selected Items:</h4>
        <div className="mt-1 p-2 border border-gray-200 rounded-md min-h-[40px]">
          {formatItemsAsString() || 'No items selected'}
        </div>
      </div>
    </div>
  );
};
```

#### DriverSelector
Facilitates assigning drivers to deliveries:

```tsx
// src/components/dispatch/DriverSelector.tsx
interface DriverSelectorProps {
  value?: string;
  onChange: (driverId: string) => void;
  scheduleId: string;
}

const DriverSelector: React.FC<DriverSelectorProps> = ({ 
  value, 
  onChange,
  scheduleId
}) => {
  const { drivers, calculateCapacity } = useDispatch();
  
  // Get capacity percentage for each driver
  const getDriverCapacity = (driverId: string) => {
    const capacity = calculateCapacity(scheduleId, driverId);
    return capacity ? `${capacity}%` : 'N/A';
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Assign Driver</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="">Select a driver</option>
        {drivers
          .filter(driver => driver.status === 'ACTIVE')
          .map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.name} (Capacity: {getDriverCapacity(driver.id)})
            </option>
          ))}
      </select>
    </div>
  );
};
```

## Core Scheduling Workflows

### Creating a New Delivery Schedule

1. User navigates to Dispatch > Schedules
2. User clicks "Create New Schedule" button
3. User selects the delivery date
4. System generates a unique schedule number (e.g., "SCH-2025-03-15")
5. User adds any notes about the schedule
6. On submit, the system calls `createSchedule` from DispatchContext
7. The function executes INSERT query via Supabase
8. On success, the system redirects to the schedule detail page

### Adding Delivery Stops

1. User opens a schedule in "PLANNING" status
2. User clicks "Add Stop" button
3. StopEditor component renders with empty fields
4. User selects a customer using CustomerSelector
5. User selects a driver using DriverSelector
6. User adds delivery items using ItemSelector
7. User provides any special delivery instructions
8. On submit, the system calls `addStop` from DispatchContext
9. The function executes INSERT query via Supabase
10. On success, the stop appears in the StopsTable
11. System recalculates driver capacity and schedule summary

### Reordering Delivery Stops

1. User opens a schedule in "PLANNING" status
2. In the StopsTable, user can reorder stops via:
   - Drag and drop interaction using @hello-pangea/dnd library
   - Direct editing of sequence numbers
3. After reordering, the system calls `reorderStops` from DispatchContext
4. The function updates the sequence numbers for all affected stops
5. Stops are displayed in the new sequence order
6. Estimated delivery times update based on the new sequence

### Finalizing a Schedule

1. User reviews the complete schedule
2. System validates the schedule for:
   - Driver capacity limits
   - Proper sequencing
   - Inventory availability
   - Time window conflicts
3. If validation passes, user clicks "Finalize Schedule"
4. System calls `finalizeSchedule` from DispatchContext
5. The function changes schedule status to "READY"
6. System generates individual driver schedules
7. Notification is sent to assigned drivers
8. Inventory is confirmed as allocated

## Delivery Management Workflows

### Updating Delivery Status

1. Driver accesses their schedule via mobile interface
2. Driver selects a delivery stop
3. Driver updates the status (En Route, Arrived, Completed, Issue)
4. System calls `updateStop` with the new status
5. If status is "Completed":
   - System records completion time
   - Customer is notified of successful delivery
   - Inventory is marked as delivered
6. If status is "Issue":
   - Driver selects issue reason and provides details
   - System alerts dispatcher for intervention
   - Status remains pending until resolved

### Multi-Driver Scheduling

For schedules requiring multiple drivers:

1. User creates a schedule as normal
2. User adds stops and assigns them to different drivers
3. System tracks capacity for each driver separately
4. When finalizing, system creates:
   - Master schedule with all stops
   - Individual driver schedules with only their assigned stops
5. Drivers see only their own stops in the mobile interface
6. Dispatcher can view and manage the complete schedule

## Schedule Calculation Logic

### Capacity Calculation

Driver capacity is calculated based on item counts and stop limits:

```typescript
const calculateCapacity = (
  scheduleId: string, 
  driverId?: string
): number => {
  // Get relevant stops for this driver or all stops
  const relevantStops = driverId 
    ? stops.filter(stop => stop.schedule_id === scheduleId && stop.driver_id === driverId)
    : stops.filter(stop => stop.schedule_id === scheduleId);
  
  if (relevantStops.length === 0) return 0;
  
  // Get the driver to check their capacity limits
  const driver = driverId 
    ? drivers.find(d => d.id === driverId)
    : null;
  
  // Calculate total item count
  let totalItems = 0;
  
  relevantStops.forEach(stop => {
    // Parse the items string to count individual items
    if (stop.items) {
      const itemsArray = stop.items.split(',').map(s => s.trim()).filter(Boolean);
      
      itemsArray.forEach(item => {
        const quantityMatch = item.match(/^(\d+)x\s+(.+)$/);
        if (quantityMatch) {
          totalItems += parseInt(quantityMatch[1], 10);
        } else {
          totalItems += 1; // Count as one if no quantity specified
        }
      });
    }
  });
  
  // Calculate capacity percentage
  if (driver) {
    const stopCapacityPercentage = (relevantStops.length / driver.max_stops) * 100;
    const itemCapacityPercentage = (totalItems / driver.max_items) * 100;
    
    // Return the higher of the two percentages
    return Math.max(stopCapacityPercentage, itemCapacityPercentage);
  } else {
    // If no specific driver, use average capacity limits
    const avgMaxStops = drivers.reduce((sum, d) => sum + d.max_stops, 0) / drivers.length || 20;
    const avgMaxItems = drivers.reduce((sum, d) => sum + d.max_items, 0) / drivers.length || 50;
    
    const stopCapacityPercentage = (relevantStops.length / avgMaxStops) * 100;
    const itemCapacityPercentage = (totalItems / avgMaxItems) * 100;
    
    return Math.max(stopCapacityPercentage, itemCapacityPercentage);
  }
};
```

### Price Calculation

The system calculates delivery price based on items:

```typescript
const calculatePrice = (items: string | null): number => {
  if (!items) return 0;
  
  let totalPrice = 0;
  const itemsArray = items.split(',').map(item => item.trim()).filter(Boolean);
  
  itemsArray.forEach(item => {
    const quantityMatch = item.match(/^(\d+)x\s+(.+)$/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;
    const description = quantityMatch ? quantityMatch[2] : item;
    
    // Set price based on product type
    let unitPrice = 0;
    
    if (description.toLowerCase().includes('cord')) {
      unitPrice = 150; // $150 per cord
    } else if (description.toLowerCase().includes('bundle')) {
      unitPrice = 25;  // $25 per bundle
    } else if (description.toLowerCase().includes('box')) {
      unitPrice = 50;  // $50 per box
    } else if (description.toLowerCase().includes('kindling')) {
      unitPrice = 15;  // $15 per kindling bundle
    } else {
      unitPrice = 35;  // Default price for unknown items
    }
    
    totalPrice += quantity * unitPrice;
  });
  
  return totalPrice;
};
```

### Stop Sequencing Algorithm

The system provides an optimal stop sequence based on delivery addresses:

```typescript
const optimizeStopSequence = async (
  scheduleId: string, 
  driverId: string
): Promise<string[]> => {
  // Get stops for this schedule and driver
  const driverStops = stops.filter(
    stop => stop.schedule_id === scheduleId && stop.driver_id === driverId
  );
  
  if (driverStops.length <= 1) {
    return driverStops.map(stop => stop.id);
  }
  
  // For a simple implementation, we'll use a nearest neighbor algorithm
  // In production, this would use a proper routing API
  
  // Start from warehouse (assumed to be at index 0)
  const warehouse = { lat: WAREHOUSE_LAT, lng: WAREHOUSE_LNG };
  
  // Get coordinates for all stops
  const stopCoordinates = driverStops.map(stop => ({
    id: stop.id,
    lat: stop.customer?.lat || 0,
    lng: stop.customer?.lng || 0,
    visited: false
  }));
  
  // Implement nearest neighbor algorithm
  const optimizedIds: string[] = [];
  let currentPoint = warehouse;
  
  while (optimizedIds.length < stopCoordinates.length) {
    // Find nearest unvisited stop
    let nearestIdx = -1;
    let nearestDist = Infinity;
    
    stopCoordinates.forEach((stop, idx) => {
      if (!stop.visited) {
        const dist = calculateDistance(
          currentPoint.lat, 
          currentPoint.lng, 
          stop.lat, 
          stop.lng
        );
        
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      }
    });
    
    if (nearestIdx !== -1) {
      // Add nearest stop to sequence
      optimizedIds.push(stopCoordinates[nearestIdx].id);
      stopCoordinates[nearestIdx].visited = true;
      currentPoint = {
        lat: stopCoordinates[nearestIdx].lat,
        lng: stopCoordinates[nearestIdx].lng
      };
    }
  }
  
  return optimizedIds;
};

// Helper function to calculate distance between coordinates
const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};
```

## Integration Points

### Inventory System Integration

The scheduling system integrates with inventory management:

1. When stops are added to a schedule, the system:
   - Checks inventory availability for selected items
   - Allocates inventory to confirmed deliveries
   - Prevents scheduling items that aren't in stock

2. When deliveries are completed:
   - Allocated inventory is removed from stock
   - Sales data is recorded for reporting
   - Low inventory alerts are triggered if needed

### Customer Management Integration

The scheduling system integrates with customer data:

1. CustomerSelector component pulls data from the customer database
2. Customer delivery history informs scheduling decisions
3. Customer preferences (delivery windows, access instructions) are applied
4. Customer communication is triggered at appropriate points

### Shopify Integration

For e-commerce orders:

1. Shopify orders are imported through webhooks
2. System maps Shopify product names to internal inventory items
3. Orders are automatically added to the scheduling queue
4. When scheduled, Shopify order status updates
5. Upon delivery completion, Shopify receives fulfillment confirmation

## Database Functions

The system uses several PostgreSQL functions for scheduling operations:

### generate_driver_schedules

```sql
CREATE OR REPLACE FUNCTION generate_driver_schedules(
  p_schedule_id UUID
) RETURNS VOID AS $
DECLARE
  v_driver_id UUID;
  v_driver_stops INTEGER;
  v_schedule_number TEXT;
  v_schedule_date DATE;
  v_driver_schedule_id UUID;
BEGIN
  -- Get schedule info
  SELECT schedule_number, schedule_date INTO v_schedule_number, v_schedule_date
  FROM dispatch_schedules
  WHERE id = p_schedule_id;
  
  -- Process each driver with stops in this schedule
  FOR v_driver_id IN (
    SELECT DISTINCT driver_id FROM delivery_stops 
    WHERE schedule_id = p_schedule_id AND driver_id IS NOT NULL
  ) LOOP
    -- Count stops for this driver
    SELECT COUNT(*) INTO v_driver_stops
    FROM delivery_stops
    WHERE schedule_id = p_schedule_id AND driver_id = v_driver_id;
    
    -- Only create driver schedule if they have stops
    IF v_driver_stops > 0 THEN
      -- Create driver-specific schedule
      INSERT INTO driver_schedules (
        master_schedule_id,
        driver_id,
        schedule_date,
        schedule_number,
        status,
        created_at
      ) VALUES (
        p_schedule_id,
        v_driver_id,
        v_schedule_date,
        v_schedule_number || '-D' || v_driver_id,
        'READY',
        NOW()
      )
      RETURNING id INTO v_driver_schedule_id;
      
      -- Add reference to driver schedule in the stops
      UPDATE delivery_stops
      SET driver_schedule_id = v_driver_schedule_id
      WHERE schedule_id = p_schedule_id AND driver_id = v_driver_id;
    END IF;
  END LOOP;
END;
$ LANGUAGE plpgsql;
```

## Security Considerations

The scheduling system implements these security measures:

1. **Role-Based Access Control**:
   - Admins and managers can create and modify schedules
   - Dispatchers can assign and adjust stops
   - Drivers can only view and update their assigned deliveries
   - Customers can only view their own orders

2. **Data Protection**:
   - Customer addresses and contact info are protected
   - Payment information is not stored in the scheduling system
   - Driver routes and personal information are secured

3. **Audit Trail**:
   - All schedule changes are logged with user and timestamp
   - Status changes record who made the change and when
   - Final route modifications require manager approval

## Performance Optimizations

For handling large schedule datasets:

1. **Pagination**: Schedule lists use pagination for browsing
2. **Date Filtering**: Only load schedules within selected date range
3. **Targeted Loading**: Load stop details only when a schedule is selected
4. **Real-time Updates**: WebSocket connections for live driver status
5. **Optimistic UI**: Interface updates before server confirmation

## Testing Approach

The scheduling system is tested through:

1. **Unit Tests**: Individual component behavior
2. **Integration Tests**: Interactions between scheduling and other modules
3. **User Journey Tests**: Complete workflows from schedule creation to completion
4. **Mobile Testing**: Specific tests for driver mobile interface

## Troubleshooting

Common issues and their resolutions:

1. **Driver Assignment Issues**
   - Check driver availability for the selected date
   - Verify driver capacity limits aren't exceeded
   - Confirm driver has access to the application

2. **Scheduling Conflicts**
   - Look for overlapping time windows
   - Check for duplicate customer assignments
   - Verify stop sequence is realistic for timing

3. **Item Selection Problems**
   - Confirm inventory availability
   - Check for proper formatting of item strings
   - Verify price calculation is working correctly

## Future Enhancements

Planned improvements to the scheduling system:

1. **GPS Integration**: Real-time driver location tracking
2. **Time Window Optimization**: Smarter scheduling based on traffic patterns
3. **Weather Integration**: Adjusting routes based on weather conditions
4. **Customer Self-Scheduling**: Portal for customers to select preferred delivery times
5. **Route Visualization**: Interactive map display of daily routes

This documentation provides a comprehensive overview of the Scheduling and Dispatch System module of the Firewood Delivery Management System. For specific implementation details, refer to the codebase and associated comments.
