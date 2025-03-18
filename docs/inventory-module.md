# Inventory Management System - Technical Documentation

This document provides detailed technical information about the Inventory Management module of the Firewood Delivery Management System. It covers data structures, components, workflows, and implementation details.

## Overview

The Inventory Management System tracks all firewood products from wholesale acquisition through processing and retail packaging to final delivery. It manages both raw and processed inventory, tracks conversions between formats, and integrates with ordering and delivery systems.

## Data Model

### Core Entities

#### Wood Products (Wholesale)
```typescript
interface WoodProduct {
  id: string;
  species: string;           // Type of wood (Oak, Maple, etc.)
  length: string;            // Length in inches
  thickness: string;         // Split thickness
  bundle_type: string;       // How the wood is bundled
  unit_cost: number;         // Cost per pallet
  full_description: string;  // Detailed description
  is_popular: boolean;       // Frequently used flag
  created_at: string;        // Creation timestamp
}
```

#### Firewood Products (Retail)
```typescript
interface FirewoodProduct {
  id: string;
  item_name: string;         // Display name
  item_full_name: string;    // Complete descriptive name
  species: string;           // Type of wood
  length: string;            // Length in inches
  split_size: string;        // Size of split pieces
  package_size: string;      // Bundle, box, tote, etc.
  product_type: string;      // Category
  minimum_quantity: number;  // Min order quantity
  created_at: string;        // Creation timestamp
}
```

#### Inventory Items (Wholesale)
```typescript
interface InventoryItem {
  id: string;
  wood_product_id: string;   // Reference to WoodProduct
  total_pallets: number;     // Total in inventory
  pallets_available: number; // Available for use
  pallets_allocated: number; // Allocated to orders
  location: string;          // Storage location
  notes: string;             // Additional information
  last_updated: string;      // Last update timestamp
  wood_product?: WoodProduct; // Joined product data
}
```

#### Retail Inventory
```typescript
interface RetailInventoryItem {
  id: string;
  firewood_product_id: string; // Reference to FirewoodProduct
  total_units: number;        // Total in inventory
  units_available: number;    // Available for sale
  units_allocated: number;    // Allocated to orders
  location: string;           // Storage location
  notes: string;              // Additional information
  last_updated: string;       // Last update timestamp
  firewood_product?: FirewoodProduct; // Joined product data
}
```

#### Processing Records
```typescript
interface ProcessingRecord {
  id: string;
  wood_product_id: string;           // Wholesale product used
  firewood_product_id: string;       // Retail product created
  wholesale_pallets_used: number;    // Input quantity
  retail_packages_created: number;   // Output quantity
  actual_conversion_ratio: number;   // Calculated ratio
  expected_ratio: number;            // Expected ratio
  processed_by: string;              // User reference
  processed_at: string;              // Processing timestamp
  notes: string;                     // Additional notes
  wood_product?: WoodProduct;        // Joined product data
  firewood_product?: FirewoodProduct; // Joined product data
}
```

### Database Schema

The Supabase PostgreSQL database implements these tables with the following relationships:

- `wood_products`: Stores all wholesale product definitions
- `firewood_products`: Stores all retail product definitions
- `inventory_items`: Tracks wholesale inventory quantities, with foreign key to `wood_products`
- `retail_inventory`: Tracks retail inventory quantities, with foreign key to `firewood_products`
- `processing_records`: Records conversion activities, with foreign keys to both product tables

Additional tables for tracking:
- `inventory_transactions`: Logs all inventory changes with timestamps and users
- `inventory_locations`: Defines storage locations and zones
- `inventory_counts`: Records physical inventory count results

## Components

### InventoryContext

The `InventoryContext` provides global state management for inventory operations:

```typescript
// src/context/InventoryContext.tsx
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State variables for inventory data
  const [woodProducts, setWoodProducts] = useState<WoodProduct[]>([]);
  const [firewoodProducts, setFirewoodProducts] = useState<FirewoodProduct[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [retailInventory, setRetailInventory] = useState<RetailInventoryItem[]>([]);
  const [processingRecords, setProcessingRecords] = useState<ProcessingRecord[]>([]);
  
  // Loading state flags
  const [loadingWoodProducts, setLoadingWoodProducts] = useState<boolean>(false);
  const [loadingFirewoodProducts, setLoadingFirewoodProducts] = useState<boolean>(false);
  // ... other loading states
  
  // Fetch functions to load data from Supabase
  const refreshWoodProducts = async () => { /* ... */ };
  const refreshFirewoodProducts = async () => { /* ... */ };
  const refreshInventory = async () => { /* ... */ };
  // ... other refresh functions
  
  // CRUD operations for inventory management
  const addWoodProduct = async (product) => { /* ... */ };
  const updateWoodProduct = async (id, updates) => { /* ... */ };
  const deleteWoodProduct = async (id) => { /* ... */ };
  // ... other CRUD functions
  
  // Inventory business logic
  const getLowStockItems = (threshold = 10) => { /* ... */ };
  const convertWoodToFirewood = async (woodProductId, firewoodProductId, palletsUsed, packagesCreated, processedBy, notes) => { /* ... */ };
  
  // Value object for context provider
  const value = {
    woodProducts,
    loadingWoodProducts,
    refreshWoodProducts,
    // ... other properties and methods
  };
  
  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
```

### Key Components

#### WholesaleInventory
Manages and displays wholesale inventory:

```tsx
// src/components/inventory/WholesaleInventory.tsx
const WholesaleInventory: React.FC = () => {
  const { 
    inventoryItems, 
    woodProducts,
    updateInventoryCount,
    getLowStockItems
  } = useInventory();
  
  // Component state and functionality
  // ...

  return (
    // Component rendering
    // ...
  );
};
```

#### RetailInventory
Manages and displays retail inventory:

```tsx
// src/components/inventory/RetailInventory.tsx
const RetailInventory: React.FC = () => {
  const { 
    retailInventory, 
    firewoodProducts,
    updateRetailInventoryCount
  } = useInventory();
  
  // Component state and functionality
  // ...

  return (
    // Component rendering
    // ...
  );
};
```

#### ProcessingRecords
Manages and displays processing activities:

```tsx
// src/components/inventory/ProcessingRecords.tsx
const ProcessingRecords: React.FC = () => {
  const { 
    processingRecords, 
    addProcessingRecord,
    woodProducts,
    firewoodProducts
  } = useInventory();
  
  // Component state and functionality
  // ...

  return (
    // Component rendering
    // ...
  );
};
```

#### WoodProductForm
Handles adding and editing wholesale products:

```tsx
// src/components/inventory/WoodProductForm.tsx
interface WoodProductFormProps {
  initialData?: Partial<WoodProduct>;
  onSubmit: (data: Omit<WoodProduct, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
}

const WoodProductForm: React.FC<WoodProductFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  // Form state and handlers
  // ...

  return (
    // Form rendering
    // ...
  );
};
```

Similar form components exist for FirewoodProductForm, InventoryUpdateForm, and ProcessingForm.

## Core Inventory Workflows

### Adding New Wholesale Products

1. User navigates to Inventory > Wholesale Inventory
2. User clicks "Add New Product" button
3. WoodProductForm renders with empty fields
4. User completes the form with product details
5. On submit, the form calls `addWoodProduct` from InventoryContext
6. The function executes INSERT query via Supabase
7. On success, local state updates and displays the new product
8. System creates a default inventory record for the new product

### Processing Inventory (Wholesale to Retail)

1. User navigates to Inventory > Processing Records
2. User clicks "New Processing Record"
3. ProcessingForm renders with required fields
4. User selects wholesale product, retail product, and enters quantities
5. On submit, the form calls `convertWoodToFirewood` from InventoryContext
6. The function executes a transaction that:
   - Reduces wholesale inventory by pallets used
   - Increases retail inventory by packages created
   - Creates a processing record linking the two
7. System calculates and stores the actual conversion ratio
8. All related inventory displays update to reflect the changes

### Inventory Allocation

The system manages inventory allocation through these processes:

1. **Order Creation**: When an order is created, items are marked as "allocated"
2. **Schedule Assignment**: When orders are added to delivery schedules, allocation is confirmed
3. **Delivery Completion**: When a delivery is marked complete, allocated items are removed from inventory
4. **Order Cancellation**: If an order is cancelled, allocated items return to available status

## Inventory Calculation Logic

### Conversion Ratios

The system calculates conversion ratios based on processing records:

```typescript
const calculateConversionRatio = (palletsUsed: number, packagesCreated: number): number => {
  if (palletsUsed === 0) return 0;
  return packagesCreated / palletsUsed;
};
```

This ratio is used for:
- Forecasting inventory needs
- Validating processing efficiency
- Estimating product yields

### Available Inventory Calculation

```typescript
const calculateAvailableInventory = (
  total: number, 
  allocated: number, 
  minimumReserve: number
): number => {
  return Math.max(0, total - allocated - minimumReserve);
};
```

### Low Stock Detection

```typescript
const isLowStock = (
  available: number, 
  threshold: number, 
  averageDailyUsage: number, 
  restockLeadTime: number
): boolean => {
  // Calculate days of inventory remaining
  const daysRemaining = available / averageDailyUsage;
  // Return true if below safety threshold
  return daysRemaining < (threshold + restockLeadTime);
};
```

## Integration Points

### Order System Integration

The inventory system integrates with order processing:
- When orders are created, the system checks inventory availability
- Order items reserve (allocate) inventory until delivered or cancelled
- Historical order data feeds into inventory forecasting

### Delivery System Integration

The inventory system integrates with delivery scheduling:
- Scheduled deliveries confirm inventory allocations
- Completed deliveries reduce inventory levels
- Cancelled or returned deliveries restore inventory

### Shopify Integration

For e-commerce orders:
- Shopify product SKUs map to internal firewood products
- Inventory levels sync between systems (with buffer settings)
- Incoming Shopify orders automatically allocate inventory
- Product conversion translates retail names to inventory items

## Database Functions

The system uses several PostgreSQL functions for inventory operations:

### convert_inventory

```sql
CREATE OR REPLACE FUNCTION convert_inventory(
  p_wood_product_id UUID,
  p_firewood_product_id UUID,
  p_pallets_used INTEGER,
  p_packages_created INTEGER,
  p_processed_by UUID,
  p_conversion_ratio NUMERIC,
  p_notes TEXT
) RETURNS VOID AS $$
DECLARE
  v_inventory_item_id UUID;
  v_retail_inventory_id UUID;
BEGIN
  -- Begin transaction
  BEGIN
    -- Reduce wholesale inventory
    UPDATE inventory_items
    SET 
      pallets_available = pallets_available - p_pallets_used,
      last_updated = NOW()
    WHERE wood_product_id = p_wood_product_id
    RETURNING id INTO v_inventory_item_id;
    
    -- Check if retail product exists in inventory
    SELECT id INTO v_retail_inventory_id
    FROM retail_inventory
    WHERE firewood_product_id = p_firewood_product_id;
    
    -- If exists, update it
    IF v_retail_inventory_id IS NOT NULL THEN
      UPDATE retail_inventory
      SET 
        total_units = total_units + p_packages_created,
        units_available = units_available + p_packages_created,
        last_updated = NOW()
      WHERE id = v_retail_inventory_id;
    -- If not, create it
    ELSE
      INSERT INTO retail_inventory (
        firewood_product_id,
        total_units,
        units_available,
        units_allocated,
        last_updated
      ) VALUES (
        p_firewood_product_id,
        p_packages_created,
        p_packages_created,
        0,
        NOW()
      );
    END IF;
    
    -- Create processing record
    INSERT INTO processing_records (
      wood_product_id,
      firewood_product_id,
      wholesale_pallets_used,
      retail_packages_created,
      actual_conversion_ratio,
      expected_ratio,
      processed_by,
      processed_at,
      notes
    ) VALUES (
      p_wood_product_id,
      p_firewood_product_id,
      p_pallets_used,
      p_packages_created,
      p_conversion_ratio,
      p_conversion_ratio, -- Use same for now, could be different
      p_processed_by,
      NOW(),
      p_notes
    );
    
    -- Log the transaction
    INSERT INTO inventory_transactions (
      transaction_type,
      wood_product_id,
      firewood_product_id,
      quantity_change,
      performed_by,
      transaction_time,
      notes
    ) VALUES (
      'CONVERSION',
      p_wood_product_id,
      p_firewood_product_id,
      p_pallets_used,
      p_processed_by,
      NOW(),
      p_notes
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Handle errors
    RAISE;
  END;
END;
$$ LANGUAGE plpgsql;
```

## Security Considerations

The inventory system implements these security measures:

1. **Row-Level Security (RLS)**: Supabase policies restrict data access based on user role
2. **Validation Rules**: Server-side validation prevents invalid inventory operations
3. **Transaction Logging**: All inventory changes are logged with user information
4. **Audit Trail**: Historical inventory changes can be reviewed by administrators

## Performance Optimizations

For handling large inventory datasets:

1. **Pagination**: Inventory lists use pagination to limit data transfer
2. **Filtering**: Server-side filters reduce data load
3. **Indexes**: Database indexes on frequently queried fields
4. **Caching**: Frequently accessed product data is cached
5. **Optimistic UI Updates**: UI updates immediately while changes confirm in background

## Testing Approach

The inventory system is tested through:

1. **Unit Tests**: Individual function behavior
2. **Integration Tests**: Interactions between inventory and other modules
3. **End-to-End Tests**: Complete workflows from UI to database and back

## Troubleshooting

Common issues and their resolutions:

1. **Inventory Discrepancies**
   - Check processing records for errors
   - Review allocated vs available calculations
   - Verify order/delivery completion status

2. **Performance Issues**
   - Check for missing indexes
   - Look for N+1 query patterns
   - Verify proper use of pagination

3. **Data Consistency Problems**
   - Examine transaction logs
   - Check for failed operations
   - Review concurrent update patterns

## Future Enhancements

Planned improvements to the inventory system:

1. **Barcode/QR Integration**: Scanning capability for physical inventory
2. **Predictive Stocking**: AI-based inventory level predictions
3. **Vendor Integration**: Direct ordering from suppliers
4. **Location Tracking**: More detailed storage location management
5. **FIFO Tracking**: First-in-first-out inventory management

This documentation provides a comprehensive overview of the Inventory Management System module of the Firewood Delivery Management System. For specific implementation details, refer to the codebase and associated comments.
