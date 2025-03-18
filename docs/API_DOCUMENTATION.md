
# API Documentation

This document describes the APIs available in our system, including both internal service APIs and external integration points.

## Internal APIs

### Inventory Management API

#### Get Inventory Items

```typescript
// Retrieves inventory items based on specified filters
const getWholesaleInventory = async (woodProductId: string): Promise<InventoryItem | null> => {
  try {
    const { data, error } = await supabaseSafeFrom(supabase, supabaseTable.inventory_items)
      .select('*')
      .eq('wood_product_id', woodProductId)
      .single();
    
    if (error) {
      console.error("Error fetching wholesale inventory:", error);
      return null;
    }
    
    return data as unknown as InventoryItem;
  } catch (err) {
    console.error("Error in getWholesaleInventory:", err);
    return null;
  }
};
```

#### Update Inventory

```typescript
// Updates inventory based on order changes
const updateInventoryFromOrder = async (items: OrderItem[]): Promise<{ success: boolean; error?: any }> => {
  try {
    // Implementation details
    return { success: true };
  } catch (error) {
    console.error("Error updating inventory:", error);
    return { success: false, error };
  }
};
```

### Order Management API

#### Create Order

```typescript
// Creates a new wholesale order
const createOrder = async (orderData: Omit<WholesaleOrderData, 'id'>): Promise<{ success: boolean; data?: any; error?: any }> => {
  try {
    // Implementation details
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error };
  }
};
```

#### Update Order

```typescript
// Updates an existing order
const updateOrder = async (id: string, updates: Partial<WholesaleOrderData>): Promise<{ success: boolean; error?: any }> => {
  try {
    // Implementation details
    return { success: true };
  } catch (error) {
    console.error("Error updating order:", error);
    return { success: false, error };
  }
};
```

### Customer Management API

#### Get Customers

```typescript
// Retrieves customer data with optional filtering
const getCustomers = async (type?: 'commercial' | 'residential'): Promise<Customer[]> => {
  try {
    let query = supabase.from("customers").select("*");
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }
    
    return data as Customer[];
  } catch (error) {
    console.error("Error in getCustomers:", error);
    return [];
  }
};
```

#### Add Customer

```typescript
// Adds a new customer to the system
const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: any; error?: any }> => {
  try {
    // Implementation details
    return { success: true, data };
  } catch (error) {
    console.error("Error adding customer:", error);
    return { success: false, error };
  }
};
```

### Dispatch API

#### Create Schedule

```typescript
// Creates a new dispatch schedule
const createSchedule = async (scheduleData: DispatchScheduleData): Promise<{ success: boolean; data?: any; error?: any }> => {
  try {
    // Implementation details
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error creating schedule:", error);
    return { success: false, error };
  }
};
```

#### Add Stop

```typescript
// Adds a delivery stop to a schedule
const addStop = async (stop: DeliveryStop): Promise<{ success: boolean; data?: any; error?: any }> => {
  try {
    // Implementation details
    return { success: true, data };
  } catch (error) {
    console.error("Error adding stop:", error);
    return { success: false, error };
  }
};
```

## External Integrations

### Shopify Integration API

#### Fetch Orders

```typescript
// Fetches orders from Shopify
const fetchShopifyOrders = async (params: ShopifyOrderParams): Promise<ShopifyOrder[]> => {
  try {
    // Implementation will use Shopify API
    return [];
  } catch (error) {
    console.error("Error fetching Shopify orders:", error);
    return [];
  }
};
```

#### Sync Product Inventory

```typescript
// Syncs inventory between our system and Shopify
const syncShopifyInventory = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    // Implementation will use Shopify API
    return { success: true };
  } catch (error) {
    console.error("Error syncing Shopify inventory:", error);
    return { success: false, error };
  }
};
```

### Payment Processing API

```typescript
// Processes payment for an order
const processPayment = async (orderId: string, paymentDetails: PaymentDetails): Promise<{ success: boolean; transactionId?: string; error?: any }> => {
  try {
    // Implementation will use payment gateway API
    return { success: true, transactionId: "mock-transaction-id" };
  } catch (error) {
    console.error("Error processing payment:", error);
    return { success: false, error };
  }
};
```

### Email/SMS Notification API

```typescript
// Sends notifications to customers
const sendNotification = async (customerId: string, notificationType: 'confirmation' | 'reminder' | 'update', data: any): Promise<{ success: boolean; error?: any }> => {
  try {
    // Implementation will use email/SMS service
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error };
  }
};
```

## Data Models

### Order Item

```typescript
interface OrderItem {
  id: number;
  species: string;
  length: string;
  bundleType: string;
  thickness: string;
  packaging: string;
  pallets: number;
  unitCost: number;
  productId?: string;
}
```

### Customer

```typescript
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  type: string | "commercial" | "residential";
  created_at?: string;
  updated_at?: string;
  profile_id?: string;
  latitude?: number;
  longitude?: number;
}
```

### Delivery Stop

```typescript
interface DeliveryStop {
  id?: string;
  customer_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_phone?: string;
  items?: string;
  price?: number;
  status?: string;
  recurring?: RecurringOrderSettings;
  notes?: string;
  driver_id?: string;
  driver_name?: string;
  sequence?: number;
  stop_number?: number;
  master_schedule_id?: string;
  created_at?: string;
  updated_at?: string;
}
```

## Authentication

All API endpoints require authentication using JWT tokens issued by Supabase Auth.

### Request Header

```
Authorization: Bearer {jwt_token}
```

## Error Handling

All APIs follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per user. Exceeding this limit will result in a 429 Too Many Requests response.
