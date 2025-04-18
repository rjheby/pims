# Types Directory

This directory contains centralized type definitions for the application.

## Structure

- `delivery.ts`: Types related to delivery stops and routes
- `customer.ts`: Customer-related types
- `driver.ts`: Driver-related types
- `recurring.ts`: Recurring order and schedule types
- `status.ts`: Status enums and related utilities
- `index.ts`: Barrel file that exports all types

## Usage

Import types from the central types directory:

```typescript
import { DeliveryStop, Customer, Driver } from '@/types';
```

## Type Exports

All types are exported using the `export type` syntax to ensure proper type-only exports when using TypeScript's `isolatedModules` option.

## Adding New Types

When adding new types:

1. Create a new file in the appropriate category or create a new category file
2. Define the type with proper JSDoc comments
3. Export the type using `export type`
4. Add the export to the barrel file (index.ts) 