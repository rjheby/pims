# Firewood Delivery Management System - System Architecture Guide

## Overview

The Firewood Delivery Management System is a comprehensive web application designed to manage all aspects of a firewood delivery business, from inventory management through order processing to delivery scheduling and financial tracking.

## Technology Stack

The system is built using the following technologies:

### Frontend
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Adds static typing to JavaScript for improved code quality
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: Handles navigation and routing between pages
- **Context API**: Manages application state across components

### Backend
- **Supabase**: PostgreSQL database with built-in authentication and real-time capabilities
- **Supabase Auth**: Handles user authentication and authorization
- **Supabase Storage**: Manages file uploads (for delivery photos, etc.)

### Integrations
- **Shopify API**: Connects with your e-commerce platform
- **QuickBooks Online**: For financial data synchronization
- **AudienceTap**: For customer management
- **Zapier**: For workflow automation

## Application Structure

The application follows a modular structure organized by domain:

```
src/
├── components/       # Reusable UI components
│   ├── layout/       # Application structure components
│   ├── inventory/    # Inventory-related components
│   ├── dispatch/     # Scheduling and delivery components
│   ├── orders/       # Order processing components
│   ├── common/       # Shared utility components
│   └── icons/        # Custom icon components
├── context/          # State management with Context API
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and Supabase client
├── pages/            # Page components for each route
├── types/            # TypeScript type definitions
└── index.tsx         # Application entry point
```

## Key Components

### Layout Components
- **AppLayout**: Main layout wrapper with sidebar and header
- **AppHeader**: Top navigation with user info and admin controls
- **AppSidebar**: Navigation menu with role-based items
- **MobileNavigation**: Bottom navigation for mobile devices

### Context Providers
- **AuthContext**: Manages user authentication and permissions
- **AdminContext**: Controls admin mode for editing system data
- **InventoryContext**: Manages inventory state and operations
- **DispatchContext**: Handles scheduling and delivery state

### Core Modules
- **Inventory Management**: Tracks wholesale and retail products
- **Dispatch System**: Manages delivery scheduling and routing
- **Order Processing**: Handles customer and supplier orders
- **Customer Management**: Stores customer data and preferences

## Database Schema

The Supabase database includes the following key tables:

### User and Organization Tables
- **profiles**: User information with role-based permissions
- **customers**: Customer contact and delivery information

### Inventory Tables
- **wood_products**: Wholesale products (species, dimensions, etc.)
- **firewood_products**: Retail products with packaging information
- **inventory_items**: Tracks quantity of available wholesale inventory
- **retail_inventory**: Tracks quantity of available retail packages
- **processing_records**: Logs conversion from wholesale to retail

### Scheduling Tables
- **dispatch_schedules**: Master delivery schedule information
- **delivery_stops**: Individual delivery information
- **drivers**: Driver details and capacity information

### Order Tables
- **wholesale_orders**: Supplier orders for restocking
- **client_orders**: Customer orders for delivery
- **order_items**: Individual line items in orders

## Integration Points

The system connects with external services through these integration points:

1. **Shopify Integration**
   - Imports e-commerce orders via Shopify API
   - Syncs inventory between systems
   - Maps branded product names to internal inventory items

2. **QuickBooks Integration**
   - Exports delivery information for invoicing
   - Imports financial data for reporting
   - Tracks accounts receivable and payable

3. **Communication Systems**
   - Sends customer notifications via email/SMS
   - Delivery confirmations and reminders
   - Status updates for deliveries

## Data Flow

1. **Inventory Management Flow**
   - Wholesale products are received and entered into inventory
   - Processing converts wholesale to retail packages
   - Inventory levels are updated in real-time

2. **Order Processing Flow**
   - Orders come from direct entry or Shopify integration
   - System checks inventory availability
   - Orders are queued for scheduling

3. **Scheduling Flow**
   - Available orders are assigned to delivery days
   - Stops are sequenced for efficient routing
   - Drivers are assigned based on capacity and availability

4. **Delivery Execution Flow**
   - Drivers access their schedules via mobile interface
   - Update delivery status as they complete stops
   - System tracks delivery completion and customer confirmation

5. **Reporting Flow**
   - System aggregates delivery, inventory, and order data
   - Generates financial and operational reports
   - Provides analytics for business decision-making

## Security Model

The application implements role-based access control with these primary roles:

- **Admin**: Full system access including settings and configuration
- **Manager**: Access to operations but not system configuration
- **Warehouse**: Access to inventory and production functions
- **Driver**: Limited access to assigned delivery schedules
- **Client**: Access to their own orders and delivery information

## Performance Considerations

- Database queries use appropriate indexes for performance
- React components implement memoization to reduce re-renders
- Large data sets use pagination and virtual scrolling
- Background processes handle automated calculations

This architecture provides a scalable, maintainable foundation that can grow with your business needs while maintaining performance and security.
