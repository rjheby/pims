  // Fetch recent Shopify orders
  const fetchShopifyOrders = async (limit = 50) => {
    setLoadingOrders(true);
    try {
      // Use Shopify GraphQL API to fetch recent orders
      const ordersResponse = await shopifyClient.get({
        path: 'orders',
        query: {
          limit: limit.toString(),
          status: 'any',
          fields: 'id,name,email,created_at,processed_at,customer,shipping_address,line_items,note,tags,total_price,financial_status,fulfillment_status'
        }
      });
      
      if (!ordersResponse.body?.orders) throw new Error('No orders returned from Shopify');
      
      // Get delivery date metafields for these orders
      const orderIds = ordersResponse.body.orders.map((order: any) => order.id);
      const metafieldsResponse = await fetchOrderMetafields(orderIds);
      
      // Merge metafield data with orders
      const enrichedOrders = enrichOrdersWithMetafields(
        ordersResponse.body.orders,
        metafieldsResponse
      );
      
      setShopifyOrders(enrichedOrders);
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      console.error('Error fetching Shopify orders:', error);
      setSyncStatus('error');
    } finally {
      setLoadingOrders(false);
    }
  };
  
  // Save order from Shopify to internal system
  const saveShopifyOrder = async (shopifyOrder: ShopifyOrder): Promise<boolean> => {
    try {
      // Check if order already exists in our system
      const { data: existingOrder } = await supabase
        .from('client_orders')
        .select('id')
        .eq('shopify_order_id', shopifyOrder.id)
        .single();
      
      if (existingOrder) {
        console.log(`Order ${shopifyOrder.name} already exists in our system`);
        return true; // Already processed
      }
      
      // Find or create customer
      const customerId = await findOrCreateCustomer(shopifyOrder.customer, shopifyOrder.shipping_address);
      
      if (!customerId) {
        throw new Error('Failed to find or create customer');
      }
      
      // Convert Shopify line items to our internal format
      const itemsString = convertLineItemsToInternalFormat(shopifyOrder.line_items);
      
      // Create internal order
      const { data, error } = await supabase
        .from('client_orders')
        .insert([{
          order_number: shopifyOrder.name,
          order_date: shopifyOrder.processed_at || shopifyOrder.created_at,
          customer_id: customerId,
          items: itemsString,
          total_price: parseFloat(shopifyOrder.total_price),
          status: 'PENDING',
          notes: shopifyOrder.note || '',
          delivery_date: shopifyOrder.delivery_date,
          delivery_window: shopifyOrder.delivery_window,
          source: 'SHOPIFY',
          shopify_order_id: shopifyOrder.id
        }]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error saving Shopify order ${shopifyOrder.name}:`, error);
      return false;
    }
  };
  
  // Convert Shopify line items to internal format
  const convertLineItemsToInternalFormat = (lineItems: ShopifyOrder['line_items']): string => {
    const convertedItems = lineItems.map(item => {
      // Find product mapping for this Shopify product
      const mapping = productMappings.find(m => 
        m.shopifyProductId === item.product_id && 
        m.shopifyVariantId === item.variant_id
      );
      
      if (mapping) {
        // Use internal product name from mapping
        const internalProduct = getInternalProductById(mapping.internalProductId, mapping.internalProductType);
        if (internalProduct) {
          const quantity = item.quantity * (mapping.conversionRatio || 1);
          return `${quantity}x ${internalProduct.name}`;
        }
      }
      
      // Fallback to Shopify product title if no mapping found
      return `${item.quantity}x ${item.title}`;
    });
    
    return convertedItems.join(', ');
  };
  
  // Find or create customer from Shopify data
  const findOrCreateCustomer = async (
    shopifyCustomer: ShopifyOrder['customer'],
    shippingAddress: ShopifyOrder['shipping_address']
  ): Promise<string | null> => {
    try {
      // Check if customer exists by email
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', shopifyCustomer.email)
        .single();
      
      if (existingCustomer) {
        return existingCustomer.id;
      }
      
      // Create new customer
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([{
          first_name: shopifyCustomer.first_name,
          last_name: shopifyCustomer.last_name,
          email: shopifyCustomer.email,
          phone: shopifyCustomer.phone,
          address: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          state: shippingAddress.province,
          zip: shippingAddress.zip,
          lat: shippingAddress.latitude,
          lng: shippingAddress.longitude,
          customer_type: 'RETAIL',
          source: 'SHOPIFY'
        }])
        .select('id')
        .single();
      
      if (error) throw error;
      return newCustomer?.id || null;
    } catch (error) {
      console.error('Error finding or creating customer:', error);
      return null;
    }
  };
  
  // Update order fulfillment in Shopify
  const updateShopifyFulfillment = async (
    orderId: string,
    shopifyOrderId: string,
    status: 'fulfilled' | 'partial' | 'cancelled'
  ): Promise<boolean> => {
    try {
      // Get the line items for this order from Shopify
      const orderResponse = await shopifyClient.get({
        path: `orders/${shopifyOrderId}`,
        query: { fields: 'line_items' }
      });
      
      if (!orderResponse.body?.order) {
        throw new Error('Order not found in Shopify');
      }
      
      const lineItems = orderResponse.body.order.line_items;
      const lineItemIds = lineItems.map((item: any) => item.id);
      
      // Create fulfillment
      if (status === 'fulfilled' || status === 'partial') {
        const fulfillmentData = {
          line_items: lineItemIds.map((id: string) => ({ id })),
          notify_customer: true,
          status: status === 'partial' ? 'partial' : 'success',
          tracking_info: {
            company: 'Woodbourne Delivery',
            number: `DEL-${orderId}`,
            url: `https://your-system-url.com/tracking/${orderId}`
          }
        };
        
        await shopifyClient.post({
          path: `orders/${shopifyOrderId}/fulfillments`,
          data: { fulfillment: fulfillmentData }
        });
      } 
      // Cancel order
      else if (status === 'cancelled') {
        await shopifyClient.post({
          path: `orders/${shopifyOrderId}/cancel`,
          data: { email: true }
        });
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating Shopify fulfillment for order ${shopifyOrderId}:`, error);
      return false;
    }
  };
  
  // Helper function to get internal product by ID
  const getInternalProductById = (
    productId: string, 
    type: 'wholesale' | 'retail'
  ): { id: string, name: string } | null => {
    const { woodProducts, firewoodProducts } = useInventory();
    
    if (type === 'wholesale') {
      const product = woodProducts.find(p => p.id === productId);
      return product ? { id: product.id, name: product.full_description } : null;
    } else {
      const product = firewoodProducts.find(p => p.id === productId);
      return product ? { id: product.id, name: product.item_name } : null;
    }
  };
  
  // Synchronize all pending Shopify orders
  const syncAllPendingOrders = async (): Promise<{ 
    success: number, 
    failed: number 
  }> => {
    setSyncStatus('syncing');
    let successCount = 0;
    let failedCount = 0;
    
    try {
      // Fetch recent unprocessed orders from Shopify
      await fetchShopifyOrders(50);
      
      // Filter for orders that are paid but not fulfilled
      const pendingOrders = shopifyOrders.filter(order => 
        order.financial_status === 'paid' && 
        (!order.fulfillment_status || order.fulfillment_status === 'partial')
      );
      
      // Process each order
      for (const order of pendingOrders) {
        const success = await saveShopifyOrder(order);
        if (success) {
          successCount++;
        } else {
          failedCount++;
        }
      }
      
      setLastSyncTime(new Date().toISOString());
      setSyncStatus('idle');
    } catch (error) {
      console.error('Error syncing pending orders:', error);
      setSyncStatus('error');
    }
    
    return { success: successCount, failed: failedCount };
  };
  
  // Initialize by loading product mappings
  useEffect(() => {
    fetchProductMappings();
  }, []);
  
  // Value object for context provider
  const value = {
    productMappings,
    shopifyOrders,
    syncStatus,
    lastSyncTime,
    loadingMappings,
    loadingOrders,
    fetchProductMappings,
    fetchShopifyOrders,
    saveShopifyOrder,
    updateShopifyFulfillment,
    syncAllPendingOrders
  };
  
  return (
    <ShopifyContext.Provider value={value}>
      {children}
    </ShopifyContext.Provider>
  );
};
```

### Shopify Webhook Handler

The application includes an API endpoint to process incoming Shopify webhooks:

```typescript
// src/pages/api/shopify/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { shopifyConfig } from '../../../lib/shopify';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Verify Shopify webhook signature
  const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
  const topic = req.headers['x-shopify-topic'] as string;
  const shopDomain = req.headers['x-shopify-shop-domain'] as string;
  
  if (!hmacHeader || !topic || !shopDomain) {
    return res.status(401).json({ error: 'Missing headers' });
  }
  
  // Verify webhook is actually from Shopify
  const body = JSON.stringify(req.body);
  const generated_hash = crypto
    .createHmac('sha256', shopifyConfig.webhookSecret)
    .update(body, 'utf8')
    .digest('base64');
  
  if (generated_hash !== hmacHeader) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process different webhook topics
  try {
    switch (topic) {
      case 'orders/create':
        await handleOrderCreated(req.body);
        break;
      case 'orders/updated':
        await handleOrderUpdated(req.body);
        break;
      case 'orders/cancelled':
        await handleOrderCancelled(req.body);
        break;
      // Add more webhook handlers as needed
    }
    
    // Log the webhook event
    await supabase.from('shopify_webhook_logs').insert({
      topic,
      shop_domain: shopDomain,
      data: req.body,
      processed_at: new Date().toISOString()
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Handler for order created webhook
async function handleOrderCreated(order: any) {
  // Convert Shopify order format to internal format
  const shopifyOrder: ShopifyOrder = {
    id: order.id,
    name: order.name,
    email: order.email,
    created_at: order.created_at,
    processed_at: order.processed_at,
    customer: {
      id: order.customer.id,
      first_name: order.customer.first_name,
      last_name: order.customer.last_name,
      email: order.customer.email,
      phone: order.customer.phone
    },
    shipping_address: order.shipping_address || {},
    line_items: order.line_items.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      title: item.title,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price
    })),
    note: order.note,
    tags: order.tags.split(',').map((tag: string) => tag.trim()),
    total_price: order.total_price,
    financial_status: order.financial_status,
    fulfillment_status: order.fulfillment_status
  };
  
  // Fetch delivery date metafields if any
  if (order.metafields) {
    const deliveryDateMeta = order.metafields.find(
      (m: any) => m.key === 'delivery_date'
    );
    if (deliveryDateMeta) {
      shopifyOrder.delivery_date = deliveryDateMeta.value;
    }
    
    const deliveryWindowMeta = order.metafields.find(
      (m: any) => m.key === 'delivery_window'
    );
    if (deliveryWindowMeta) {
      shopifyOrder.delivery_window = deliveryWindowMeta.value;
    }
  }
  
  // Only process paid orders
  if (shopifyOrder.financial_status === 'paid') {
    // Save to internal system
    // Note: In a real implementation, you'd use a queue system for reliability
    const { saveShopifyOrder } = useShopify();
    await saveShopifyOrder(shopifyOrder);
  }
}

// Handler for order updated webhook
async function handleOrderUpdated(order: any) {
  // Handle updates (like status changes or payment status)
  const { data } = await supabase
    .from('client_orders')
    .select('id, status')
    .eq('shopify_order_id', order.id)
    .single();
  
  if (data) {
    // Update local order status based on Shopify changes
    if (order.cancelled_at && data.status !== 'CANCELLED') {
      await supabase
        .from('client_orders')
        .update({ status: 'CANCELLED' })
        .eq('id', data.id);
    }
    else if (order.financial_status === 'paid' && data.status === 'PENDING') {
      await supabase
        .from('client_orders')
        .update({ status: 'CONFIRMED' })
        .eq('id', data.id);
    }
  }
}

// Handler for order cancelled webhook
async function handleOrderCancelled(order: any) {
  // Cancel order in our system
  await supabase
    .from('client_orders')
    .update({ status: 'CANCELLED' })
    .eq('shopify_order_id', order.id);
  
  // If inventory was already allocated, release it
  // (This would be handled by a trigger or separate function)
}
```

### Product Mapping Admin Interface

The application includes a component to manage Shopify product mappings:

```tsx
// src/components/shopify/ProductMappingManager.tsx
const ProductMappingManager: React.FC = () => {
  const { 
    productMappings, 
    fetchProductMappings,
    loadingMappings
  } = useShopify();
  const { woodProducts, firewoodProducts } = useInventory();
  const [isAddingMapping, setIsAddingMapping] = useState(false);
  
  // Add new mapping
  const handleAddMapping = async (mapping: Omit<ProductMapping, 'id'>) => {
    try {
      const { error } = await supabase
        .from('shopify_product_mappings')
        .insert([mapping]);
      
      if (error) throw error;
      
      await fetchProductMappings();
      setIsAddingMapping(false);
    } catch (error) {
      console.error('Error adding product mapping:', error);
    }
  };
  
  // Toggle mapping active state
  const toggleMappingActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('shopify_product_mappings')
        .update({ isActive })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchProductMappings();
    } catch (error) {
      console.error('Error updating product mapping:', error);
    }
  };
  
  // Delete mapping
  const deleteMapping = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopify_product_mappings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchProductMappings();
    } catch (error) {
      console.error('Error deleting product mapping:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shopify Product Mappings</h2>
        <button
          onClick={() => setIsAddingMapping(true)}
          className="px-3 py-1 bg-green-600 text-white rounded-md"
        >
          Add Mapping
        </button>
      </div>
      
      {loadingMappings ? (
        <div className="py-8 text-center">Loading mappings...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shopify Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internal Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Ratio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productMappings.map(mapping => (
                <tr key={mapping.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {mapping.shopifyTitle}
                    </div>
                    <div className="text-sm text-gray-500">
                      SKU: {mapping.shopifySKU}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getInternalProductName(
                        mapping.internalProductId, 
                        mapping.internalProductType
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Type: {mapping.internalProductType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {mapping.conversionRatio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      mapping.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mapping.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleMappingActive(mapping.id, !mapping.isActive)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      {mapping.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteMapping(mapping.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {productMappings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No product mappings found. Add one to start connecting Shopify products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Mapping Modal */}
      {isAddingMapping && (
        <ProductMappingForm
          onSubmit={handleAddMapping}
          onCancel={() => setIsAddingMapping(false)}
          woodProducts={woodProducts}
          firewoodProducts={firewoodProducts}
        />
      )}
    </div>
  );
  
  // Helper function to get internal product name
  function getInternalProductName(id: string, type: 'wholesale' | 'retail'): string {
    if (type === 'wholesale') {
      const product = woodProducts.find(p => p.id === id);
      return product ? product.full_description : 'Unknown';
    } else {
      const product = firewoodProducts.find(p => p.id === id);
      return product ? product.item_name : 'Unknown';
    }
  }
};
```

## Core Workflows

### Importing Shopify Orders

The system handles Shopify order import via:

1. **Webhooks**: For real-time order notifications
   - Orders are sent to the webhook endpoint when created
   - System validates webhook signature
   - New orders are processed and saved to internal database

2. **Manual Synchronization**: For bulk imports or to recover from webhook failures
   - Administrator initiates sync from UI
   - System calls Shopify API to fetch recent orders
   - Orders are matched against existing records to prevent duplicates
   - New orders are processed in batches

### Product Mapping Process

When connecting Shopify products to internal inventory:

1. Administrator navigates to the Product Mapping interface
2. Clicks "Add Mapping" and enters:
   - Shopify product details (can be entered manually or selected from list)
   - Internal product (selected from wholesale or retail inventory)
   - Conversion ratio (how to convert Shopify quantities to internal units)
3. System saves the mapping to database
4. Future orders use this mapping to convert products automatically

### Order Status Synchronization

When a delivery is completed in your system:

1. Order status is updated to "DELIVERED"
2. System checks if order originated from Shopify
3. If yes, calls Shopify API to mark order as fulfilled
4. Delivery details are sent to Shopify for tracking

## Shopify Product Conversion Logic

The system converts between Shopify product names and internal inventory using these rules:

```typescript
// src/utils/shopifyConversion.ts
export function convertShopifyToInternalItems(
  shopifyItems: ShopifyOrder['line_items'],
  productMappings: ProductMapping[]
): string {
  const result: string[] = [];
  
  shopifyItems.forEach(item => {
    // Try to find mapping for this product
    const mapping = productMappings.find(m => 
      m.shopifyProductId === item.product_id &&
      m.shopifyVariantId === item.variant_id &&
      m.isActive
    );
    
    if (mapping) {
      const quantity = item.quantity * mapping.conversionRatio;
      const internalProduct = getInternalProductName(
        mapping.internalProductId,
        mapping.internalProductType
      );
      
      result.push(`${quantity}x ${internalProduct}`);
    } else {
      // Fallback to Shopify product name if no mapping exists
      result.push(`${item.quantity}x ${item.title} (Shopify)`);
    }
  });
  
  return result.join(', ');
}

// Determine wood product needed based on branded Shopify name
export function inferProductTypeFromShopifyName(name: string): {
  species?: string;
  length?: string;
  split?: string;
  package?: string;
} {
  const result: any = {};
  
  // Detect species
  const speciesPatterns = [
    { pattern: /oak/i, value: 'Oak' },
    { pattern: /maple/i, value: 'Maple' },
    { pattern: /cherry/i, value: 'Cherry' },
    { pattern: /birch/i, value: 'Birch' },
    { pattern: /hickory/i, value: 'Hickory' },
    { pattern: /mixed/i, value: 'Mixed' }
  ];
  
  for (const { pattern, value } of speciesPatterns) {
    if (pattern.test(name)) {
      result.species = value;
      break;
    }
  }
  
  // Detect length
  const lengthMatch = name.match(/(\d+)[""]|(\d+)\s*inch/i);
  if (lengthMatch) {
    result.length = lengthMatch[1] || lengthMatch[2];
  }
  
  // Detect split size
  if (/split/i.test(name)) {
    if (/thin/i.test(name)) result.split = 'Thin';
    else if (/medium/i.test(name)) result.split = 'Medium';
    else if (/thick/i.test(name)) result.split = 'Thick';
    else result.split = 'Standard';
  }
  
  // Detect package type
  if (/bundle/i.test(name)) result.package = 'Bundle';
  else if (/box/i.test(name)) result.package = 'Box';
  else if (/cord/i.test(name)) result.package = 'Cord';
  else if (/pallet/i.test(name)) result.package = 'Pallet';
  
  return result;
}
```

## Shopify Configuration Requirements

To make this integration work, you'll need to configure Shopify with:

### Webhook Endpoints

Set up these webhooks in your Shopify admin panel:

1. **orders/create**: Sends notification when new orders are created
   - URL: `https://your-app-url.com/api/shopify/webhook`
   - Format: JSON

2. **orders/updated**: Sends notification when orders are changed
   - URL: `https://your-app-url.com/api/shopify/webhook`
   - Format: JSON

3. **orders/cancelled**: Sends notification when orders are cancelled
   - URL: `https://your-app-url.com/api/shopify/webhook`
   - Format: JSON

### Custom Metafields

Create these metafields to handle delivery information:

1. **delivery_date**: For storing requested delivery date
   - Namespace: `firewood`
   - Key: `delivery_date`
   - Type: `date`

2. **delivery_window**: For storing preferred time window
   - Namespace: `firewood`
   - Key: `delivery_window`
   - Type: `string`

### Checkout Customization

Modify your Shopify checkout to collect delivery information:

1. Add a date picker for delivery date
2. Add a dropdown for delivery windows
3. Store selections as order attributes
4. These will be accessible in the webhook payload

## Security Considerations

The Shopify integration implements these security measures:

1. **Webhook Signature Verification**: Ensures webhooks are actually from Shopify
2. **Access Token Protection**: API tokens are stored securely in environment variables
3. **Data Validation**: All incoming data is validated before processing
4. **Error Logging**: Failed webhook processing is logged for troubleshooting
5. **Rate Limiting**: Respects Shopify API rate limits to prevent throttling

## Troubleshooting

Common issues and their resolutions:

1. **Webhook Verification Failures**
   - Check webhook secret is correctly configured
   - Verify request body isn't being modified in transit
   - Ensure correct computation of HMAC signature

2. **Product Mapping Issues**
   - Verify Shopify product IDs and variant IDs are correct
   - Check that internal product IDs exist and are active
   - Ensure conversion ratios are appropriate

3. **Order Sync Problems**
   - Check for API permissions in Shopify
   - Verify network connectivity between systems
   - Look for data format changes in the Shopify API

4. **Fulfillment Update Failures**
   - Ensure order is eligible for fulfillment in Shopify
   - Check for sufficient inventory in Shopify
   - Verify correct line item IDs are being sent

## Testing Approach

The Shopify integration is tested through:

1. **Webhook Testing**: Using Shopify's webhook tester tool
2. **Order Flow Testing**: Creating test orders in Shopify
3. **Product Mapping Testing**: Verifying correct conversion
4. **Edge Case Testing**: Handling unusual order structures
5. **Performance Testing**: Ensuring system can handle order volume

## Future Enhancements

Planned improvements to the# Shopify Integration - Technical Documentation

This document provides detailed technical information about the Shopify integration module of the Firewood Delivery Management System. It covers API connections, data mapping, synchronization processes, and implementation details.

## Overview

The Shopify integration allows seamless transfer of order information from your Shopify e-commerce store to the Firewood Delivery Management System. It handles product mapping, inventory synchronization, and order status updates between the two platforms.

## Integration Architecture

The integration uses a bidirectional data flow:

1. **Incoming** (Shopify → Firewood System)
   - New orders
   - Customer information
   - Product mapping

2. **Outgoing** (Firewood System → Shopify)
   - Inventory updates
   - Order fulfillment status
   - Delivery tracking

The system uses Shopify webhooks for real-time notifications and scheduled API calls for periodic synchronization.

## Configuration Settings

### Shopify API Configuration

```typescript
// src/lib/shopify.ts
interface ShopifyConfig {
  shopUrl: string;          // Your Shopify store URL
  apiVersion: string;       // Shopify API version (e.g., "2023-10")
  accessToken: string;      // Private app access token
  webhookSecret: string;    // Secret for webhook verification
}

// Load configuration from environment variables
export const shopifyConfig: ShopifyConfig = {
  shopUrl: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_URL || '',
  apiVersion: process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2023-10',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || '',
};

// Initialize Shopify API client
export const shopifyClient = new Shopify.Clients.Rest({
  domain: shopifyConfig.shopUrl.replace('https://', ''),
  accessToken: shopifyConfig.accessToken,
  apiVersion: shopifyConfig.apiVersion,
});
```

### Product Mapping Configuration

Product mapping connects Shopify products to your internal inventory:

```typescript
// src/types/shopify.ts
export interface ProductMapping {
  shopifyProductId: string;      // Shopify product ID
  shopifyVariantId: string;      // Shopify variant ID (if applicable)
  shopifyTitle: string;          // Shopify product title
  shopifySKU: string;            // Shopify SKU
  internalProductId: string;     // Your internal product ID
  internalProductType: 'wholesale' | 'retail'; // Type of product
  conversionRatio: number;       // For converting units if needed
  isActive: boolean;             // Whether mapping is active
}
```

## Data Models

### Shopify Order Type

```typescript
// src/types/shopify.ts
export interface ShopifyOrder {
  id: string;                    // Shopify order ID (gid://shopify/Order/1234567890)
  name: string;                  // Order number (e.g., "#1001")
  email: string;                 // Customer email
  created_at: string;            // Creation date
  processed_at: string;          // Processing date
  customer: {
    id: string;                  // Shopify customer ID
    first_name: string;          // Customer first name
    last_name: string;           // Customer last name
    email: string;               // Customer email
    phone: string;               // Customer phone
  };
  shipping_address: {
    address1: string;            // Street address
    address2: string;            // Apartment, suite, etc.
    city: string;                // City
    province: string;            // State/province
    zip: string;                 // Postal/ZIP code
    country: string;             // Country
    latitude?: number;           // Latitude coordinate
    longitude?: number;          // Longitude coordinate
  };
  line_items: {
    id: string;                  // Line item ID
    product_id: string;          // Shopify product ID
    variant_id: string;          // Shopify variant ID
    title: string;               // Product title
    sku: string;                 // Product SKU
    quantity: number;            // Quantity ordered
    price: string;               // Unit price
  }[];
  note: string;                  // Order notes
  tags: string[];                // Order tags
  total_price: string;           // Total price
  financial_status: string;      // Payment status
  fulfillment_status: string | null; // Fulfillment status
  delivery_date?: string;        // Custom delivery date (metafield)
  delivery_window?: string;      // Custom delivery window (metafield)
}
```

### Internal Order Type

The Shopify orders are converted to your internal order format:

```typescript
// src/types/orders.ts
export interface ClientOrder {
  id: string;                    // Internal order ID
  order_number: string;          // Order number
  order_date: string;            // Order date
  customer_id: string;           // Customer reference
  items: string;                 // Formatted items string
  total_price: number;           // Total price
  status: OrderStatus;           // Order status
  notes: string;                 // Order notes
  delivery_date?: string;        // Requested delivery date
  delivery_window?: string;      // Requested delivery window
  source: 'SHOPIFY' | 'INTERNAL'; // Order source
  shopify_order_id?: string;     // Reference to Shopify
  created_at: string;            // Creation timestamp
  updated_at: string;            // Update timestamp
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SCHEDULED' | 'DELIVERED' | 'CANCELLED';
```

## Core Components

### ShopifyContext

The `ShopifyContext` provides global state management for Shopify operations:

```typescript
// src/context/ShopifyContext.tsx
export const ShopifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State variables for Shopify integration
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);
  const [shopifyOrders, setShopifyOrders] = useState<ShopifyOrder[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Loading states
  const [loadingMappings, setLoadingMappings] = useState<boolean>(false);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  
  // Fetch product mappings from database
  const fetchProductMappings = async () => {
    setLoadingMappings(true);
    try {
      const { data, error } = await supabase
        .from('shopify_product_mappings')
        .select('*')
        .order('shopifyTitle', { ascending: true });
      
      if (error) throw error;
      setProductMappings(data || []);
    } catch (error) {
      console.error('Error fetching product mappings:', error);
    } finally {
      setLoadingMappings(false);
    }
  };
  
  // Fetch recent Shopify orders
  const fetchShopifyOrders = async (limit = 50) => {
    set