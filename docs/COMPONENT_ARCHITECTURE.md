
# Component Architecture Documentation

This document describes the component architecture used in our React application, focusing on the organization, responsibilities, and interactions between components.

## Architecture Overview

Our application uses a component-based architecture with React and follows these principles:
- Functional components with hooks for state management
- Composition over inheritance
- Separation of concerns between UI components and business logic
- Reusable component library built on shadcn/ui

## Component Organization

```
src/
├── components/           # Shared components
│   ├── ui/               # UI component library (shadcn/ui)
│   ├── templates/        # Layout templates
│   └── sheets/           # Data sheet components
├── hooks/                # Shared hooks
├── pages/                # Page components
│   ├── customers/        # Customer management
│   ├── dispatch/         # Dispatch and scheduling
│   │   ├── components/   # Dispatch-specific components
│   │   ├── context/      # Dispatch-specific context
│   │   ├── hooks/        # Dispatch-specific hooks
│   │   └── utils/        # Dispatch-specific utilities
│   ├── inventory/        # Inventory management
│   ├── wholesale-order/  # Wholesale order management
│   │   ├── components/   # Order-specific components
│   │   ├── context/      # Order-specific context
│   │   ├── hooks/        # Order-specific hooks
│   │   └── utils/        # Order-specific utilities
│   └── ...               # Other page modules
├── integrations/         # Third-party integrations
│   └── supabase/         # Supabase client and related code
├── utils/                # Shared utilities
└── App.tsx               # Main application component
```

## Core Components

### Template Components

#### BaseOrderSummary

Provides a consistent layout for order summaries across different order types.

```typescript
// Component Signature
interface BaseOrderSummaryProps {
  items: {
    totalQuantity: number;
    totalValue: number;
    quantityByPackaging?: Record<string, number>;
  };
  renderCustomSummary?: () => React.ReactNode;
}
```

#### BaseOrderDetails

Provides a consistent layout for order details across different order types.

```typescript
// Component Signature
interface BaseOrderDetailsProps {
  orderNumber: string;
  orderDate: string;
  deliveryDate?: string;
  onOrderDateChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeliveryDateChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}
```

#### BaseOrderActions

Provides a consistent set of actions for orders across different order types.

```typescript
// Component Signature
interface BaseOrderActionsProps {
  onSave: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  archiveLink?: string;
  isSaving?: boolean;
  isSubmitting?: boolean;
  mobileLayout?: boolean;
}
```

### Wholesale Order Components

#### WholesaleOrderSummary

Displays a summary of a wholesale order with capacity calculations.

```typescript
// Component Signature
interface WholesaleOrderSummaryProps {
  items: OrderItem[];
}
```

#### OrderTable

Displays a table of order items with editing capabilities.

```typescript
// Component Signature
interface OrderTableProps {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  disabled?: boolean;
}
```

### Dispatch Components

#### StopsTable

Displays and manages delivery stops with drag-and-drop reordering.

```typescript
// Component Signature
interface StopsTableProps {
  stops: any[];
  onStopsChange: (stops: any[]) => void;
  useMobileLayout?: boolean;
  readOnly?: boolean;
  masterScheduleId: string;
}
```

#### CustomerSelector

Allows selecting customers with search and filtering.

```typescript
// Component Signature
interface CustomerSelectorProps {
  onSelect: (customer: Customer) => void;
  selectedCustomerId?: string;
  disabled?: boolean;
}
```

#### ItemSelector

Allows selecting items with search and filtering.

```typescript
// Component Signature
interface ItemSelectorProps {
  onSelect: (items: string) => void;
  selectedItems?: string;
  disabled?: boolean;
}
```

## Custom Hooks

### useOrderCalculations

Provides calculations for order quantities, costs, and capacity.

```typescript
// Hook Signature
function useOrderCalculations() {
  // Returns
  return {
    calculateTotalQuantity,
    calculateTotalCost,
    formatCurrency,
    generateItemName,
    calculateTotalPallets,
    calculateTotalPalletEquivalents,
    calculateCapacityPercentage,
    calculateItemGroups,
    safeNumber,
    getPackagingConversion,
    isOverCapacity,
    calculateRemainingCapacity
  };
}
```

### useCustomers

Provides customer data and management functions.

```typescript
// Hook Signature
function useCustomers() {
  // Returns
  return {
    customers,
    commercialCustomers,
    residentialCustomers,
    loading,
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchTerm,
    setSearchTerm
  };
}
```

### useWholesaleOrderForm

Manages the wholesale order form state and actions.

```typescript
// Hook Signature
function useWholesaleOrderForm() {
  // Returns
  return {
    orderData,
    orderStatus,
    loading,
    error,
    isSaving,
    isSubmitting,
    handleOrderDateChange,
    handleDeliveryDateChange,
    handleOrderItemsChange,
    handleSave,
    handleSubmit
  };
}
```

## Context Providers

### WholesaleOrderContext

Provides state management for wholesale orders.

```typescript
// Context Signature
interface WholesaleOrderContextType {
  items: OrderItem[];
  setItems: (items: OrderItem[]) => void;
  orderOptions: {
    species: string[];
    length: string[];
    bundleType: string[];
    thickness: string[];
    packaging: string[];
  };
}
```

### DispatchScheduleContext

Provides state management for dispatch schedules.

```typescript
// Context Signature
interface DispatchScheduleContextType {
  schedule: any;
  setSchedule: (schedule: any) => void;
  stops: any[];
  setStops: (stops: any[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}
```

## Component Relationships

### Order Management Flow

```
WholesaleOrderForm
├── OrderDetails
├── OrderTable
│   ├── OrderTableRow
│   │   ├── OrderTableDropdownCell
│   │   └── ProductSelector
│   └── OrderTableMobileRow
├── WholesaleOrderSummary
└── OrderActions
```

### Dispatch Management Flow

```
DispatchForm
├── BaseOrderDetails
├── StopsTable
│   ├── StopsDesktopTable (for desktop)
│   │   └── CustomerSelector
│   └── StopsMobileCards (for mobile)
│       └── CustomerSelector
├── BaseOrderSummary
└── BaseOrderActions
```

## State Management

Our application uses React's built-in state management with:
- `useState` for component-local state
- `useContext` for sharing state between related components
- Custom hooks for encapsulating business logic and data fetching

## Data Flow

1. **Data Fetching**:
   - Custom hooks fetch data from Supabase
   - Loading states are managed during async operations
   - Error states capture and display fetch failures

2. **Data Manipulation**:
   - Components receive data via props or context
   - User interactions trigger state updates
   - State changes trigger re-renders with updated UI

3. **Data Persistence**:
   - Save/submit actions call API functions to persist changes
   - Optimistic updates improve perceived performance
   - Error handling reverts optimistic updates when needed

## Component Design Patterns

### Compound Components

Used for complex interactive components that manage their own state.

```tsx
<Tabs>
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings...</TabsContent>
  <TabsContent value="password">Password settings...</TabsContent>
</Tabs>
```

### Render Props

Used to customize the rendering of child components.

```tsx
<BaseOrderSummary
  items={calculateTotals()}
  renderCustomSummary={() => (
    <div className="custom-summary">
      {/* Custom summary content */}
    </div>
  )}
/>
```

### Higher-Order Components

Used to add common functionality to components.

```tsx
const withErrorBoundary = (Component) => {
  return (props) => (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

const SafeComponent = withErrorBoundary(MyComponent);
```

## Responsive Design

Our application implements responsive design with:
- Tailwind CSS for responsive utility classes
- Custom hooks (e.g., `useIsMobile`) to adapt to screen size
- Component variants for different screen sizes
- Mobile-first approach to layout and interaction design

## Best Practices

- Components are focused, with each serving a single purpose
- Props have TypeScript interfaces for type safety
- Components use composition to maximize reusability
- UI state is separated from business logic
- Performance optimizations with `useMemo` and `useCallback` where needed
- Accessibility concerns addressed with ARIA attributes and keyboard navigation
