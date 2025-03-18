
# Database Schema Documentation

This document describes the database schema used in our scheduling and logistics system.

## Tables Overview

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ customers           │     │ dispatch_schedules  │     │ delivery_schedules  │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│ id                  │     │ id                  │     │ id                  │
│ name                │     │ schedule_number     │     │ master_schedule_id  │
│ email               │     │ schedule_date       │     │ customer_id         │
│ phone               │     │ status              │     │ driver_id           │
│ address             │     │ notes               │     │ items               │
│ street_address      │     │ created_at          │     │ notes               │
│ city                │     │ updated_at          │     │ status              │
│ state               │     └─────────────────────┘     │ delivery_date       │
│ zip_code            │                                 │ recurring_day        │
│ notes               │                                 │ schedule_type        │
│ type                │                                 │ created_at           │
│ profile_id          │                                 └─────────────────────┘
│ latitude            │                                          │
│ longitude           │                                          │
│ created_at          │                                          │
│ updated_at          │                                          │
└─────────────────────┘                                          │
        │                                                        │
        │                                                        │
        │                                                        │
        ▼                                                        ▼
┌─────────────────────┐                             ┌─────────────────────┐
│ recurring_orders    │                             │ delivery_stops      │
├─────────────────────┤                             ├─────────────────────┤
│ id                  │                             │ id                  │
│ customer_id         │                             │ master_schedule_id  │
│ frequency           │                             │ customer_id         │
│ preferred_day       │                             │ customer_name       │
│ preferred_time      │                             │ customer_address    │
│ created_at          │                             │ customer_phone      │
│ updated_at          │                             │ driver_id           │
└─────────────────────┘                             │ driver_name         │
                                                    │ sequence            │
                                                    │ stop_number         │
                                                    │ items               │
                                                    │ price               │
                                                    │ notes               │
                                                    │ status              │
                                                    │ created_at          │
                                                    │ updated_at          │
                                                    └─────────────────────┘
        
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ wood_products       │     │ wholesale_orders    │     │ inventory_items     │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│ id                  │     │ id                  │     │ id                  │
│ species             │     │ order_number        │     │ wood_product_id     │
│ length              │     │ order_name          │     │ total_pallets       │
│ bundle_type         │     │ order_date          │     │ pallets_available   │
│ thickness           │     │ delivery_date       │     │ pallets_allocated   │
│ full_description    │     │ items               │     │ location            │
│ unit_cost           │     │ status              │     │ notes               │
│ is_popular          │     │ admin_editable      │     │ last_updated        │
│ popularity_rank     │     │ submitted_at        │     └─────────────────────┘
│ created_at          │     │ template_id         │
└─────────────────────┘     │ created_at          │
        │                   └─────────────────────┘
        │                             │
        │                             │
        ▼                             ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ firewood_products   │     │ processing_records  │     │ wholesale_order_opts│
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│ id                  │     │ id                  │     │ id                  │
│ item_name           │     │ wood_product_id     │     │ species             │
│ item_full_name      │     │ firewood_product_id │     │ length              │
│ species             │     │ wholesale_pallets_used │  │ bundleType          │
│ length              │     │ retail_packages_created│  │ thickness           │
│ split_size          │     │ expected_ratio      │     │ packaging           │
│ package_size        │     │ actual_conversion_ratio│  │ created_at          │
│ product_type        │     │ processed_by        │     └─────────────────────┘
│ minimum_quantity    │     │ processed_date      │
│ image_reference     │     │ notes               │
│ created_at          │     └─────────────────────┘
└─────────────────────┘
```

## Table Descriptions

### customers

Stores information about customers in the system.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Customer name |
| email | text | Customer email (optional) |
| phone | text | Customer phone number (optional) |
| address | text | Full address (optional) |
| street_address | text | Street address component (optional) |
| city | text | City component (optional) |
| state | text | State component (optional) |
| zip_code | text | Zip code component (optional) |
| notes | text | Additional notes about the customer (optional) |
| type | text | Customer type (commercial, residential, etc.) |
| profile_id | uuid | Associated user profile ID (optional) |
| latitude | numeric | Location latitude for mapping (optional) |
| longitude | numeric | Location longitude for mapping (optional) |
| created_at | timestamp | Record creation timestamp |
| updated_at | timestamp | Record update timestamp |

### dispatch_schedules

Master schedule records for delivery routes.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| schedule_number | character varying | Unique identifier for the schedule |
| schedule_date | date | Date of the schedule |
| status | text | Schedule status (draft, submitted, etc.) |
| notes | text | Additional notes (optional) |
| created_at | timestamp | Record creation timestamp |
| updated_at | timestamp | Record update timestamp |

### delivery_schedules

Individual delivery schedules linked to master schedules.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| master_schedule_id | uuid | Foreign key to dispatch_schedules |
| customer_id | uuid | Foreign key to customers (optional) |
| driver_id | text | Driver identifier (optional) |
| items | text | Items to be delivered (optional) |
| notes | text | Additional notes (optional) |
| status | text | Delivery status |
| delivery_date | timestamp | Scheduled delivery date/time (optional) |
| recurring_day | text | Day for recurring deliveries (optional) |
| schedule_type | text | Type of schedule |
| created_at | timestamp | Record creation timestamp |

### delivery_stops

Individual stops within a delivery route.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| master_schedule_id | uuid | Foreign key to dispatch_schedules (optional) |
| customer_id | uuid | Foreign key to customers (optional) |
| customer_name | text | Customer name (optional) |
| customer_address | text | Customer address (optional) |
| customer_phone | text | Customer phone (optional) |
| driver_id | uuid | Driver identifier (optional) |
| driver_name | text | Driver name (optional) |
| sequence | integer | Order in the route (optional) |
| stop_number | integer | Stop number (optional) |
| items | text | Items to be delivered (optional) |
| price | numeric | Price for the delivery (defaults to 0) |
| notes | text | Additional notes (optional) |
| status | text | Stop status (defaults to 'pending') |
| created_at | timestamp | Record creation timestamp |
| updated_at | timestamp | Record update timestamp |

### recurring_orders

Stores configuration for recurring customer orders.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| customer_id | uuid | Foreign key to customers |
| frequency | text | Frequency of recurrence |
| preferred_day | text | Preferred day of delivery (optional) |
| preferred_time | text | Preferred time of delivery (optional) |
| created_at | timestamp | Record creation timestamp |
| updated_at | timestamp | Record update timestamp |

### wood_products

Catalog of wholesale wood products.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| species | text | Wood species |
| length | text | Wood length |
| bundle_type | text | Bundle type |
| thickness | text | Wood thickness |
| full_description | text | Complete product description |
| unit_cost | numeric | Cost per unit |
| is_popular | boolean | Popular item flag (optional, defaults to false) |
| popularity_rank | integer | Ranking for popular items (optional) |
| created_at | timestamp | Record creation timestamp |

### wholesale_orders

Records of wholesale orders.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| order_number | text | Unique identifier for the order |
| order_name | text | Name/title of the order (optional) |
| order_date | timestamp | Date the order was placed |
| delivery_date | timestamp | Scheduled delivery date (optional) |
| items | jsonb | JSON data of ordered items |
| status | text | Order status (optional) |
| admin_editable | boolean | Flag for admin editing (optional, defaults to true) |
| submitted_at | timestamp | Submission timestamp (optional) |
| template_id | uuid | Reference to order template (optional) |
| created_at | timestamp | Record creation timestamp |

### inventory_items

Tracks inventory levels for wood products.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| wood_product_id | uuid | Foreign key to wood_products |
| total_pallets | numeric | Total number of pallets (defaults to 0) |
| pallets_available | numeric | Available pallets (defaults to 0) |
| pallets_allocated | numeric | Allocated pallets (defaults to 0) |
| location | text | Storage location (optional) |
| notes | text | Additional notes (optional) |
| last_updated | timestamp | Last update timestamp |

### firewood_products

Catalog of retail firewood products.

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| item_name | character varying | Short product name |
| item_full_name | character varying | Complete product name |
| species | character varying | Wood species |
| length | character varying | Wood length |
| split_size | character varying | Split size |
| package_size | character varying | Package size |
| product_type | character varying | Product type |
| minimum_quantity | integer | Minimum order quantity |
| image_reference | character varying | Reference to product image (optional) |
| created_at | timestamp | Record creation timestamp |

### processing_records

Records of converting wholesale to retail inventory.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| wood_product_id | uuid | Foreign key to wood_products |
| firewood_product_id | integer | Foreign key to firewood_products |
| wholesale_pallets_used | numeric | Number of pallets consumed |
| retail_packages_created | integer | Number of retail packages produced |
| expected_ratio | numeric | Expected conversion ratio (optional) |
| actual_conversion_ratio | numeric | Actual achieved conversion ratio |
| processed_by | text | Person who processed the conversion |
| processed_date | timestamp | Date of processing |
| notes | text | Additional notes (optional) |

### wholesale_order_options

Dropdown options for wholesale order forms.

| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| species | text[] | Available wood species options |
| length | text[] | Available length options |
| bundleType | text[] | Available bundle type options |
| thickness | text[] | Available thickness options |
| packaging | text[] | Available packaging options |
| created_at | timestamp | Record creation timestamp |

## Relationships

- `customers` to `recurring_orders`: One-to-many (One customer can have multiple recurring orders)
- `customers` to `delivery_schedules`: One-to-many (One customer can be in multiple delivery schedules)
- `customers` to `delivery_stops`: One-to-many (One customer can have multiple delivery stops)
- `dispatch_schedules` to `delivery_schedules`: One-to-many (One master schedule can have multiple delivery schedules)
- `dispatch_schedules` to `delivery_stops`: One-to-many (One master schedule can have multiple stops)
- `wood_products` to `inventory_items`: One-to-one (Each wood product has one inventory record)
- `wood_products` to `processing_records`: One-to-many (One wood product can be processed multiple times)
- `firewood_products` to `processing_records`: One-to-many (One firewood product can be created in multiple processing records)

## Indexes

For optimal performance, we maintain indexes on:
- Primary keys (all tables)
- Foreign keys (for relationship lookups)
- `customers.name` (for quick customer searches)
- `customers.type` (for filtering by customer type)
- `delivery_stops.master_schedule_id` (for retrieving all stops in a schedule)
- `wholesale_orders.order_number` (for order lookups)
- `wholesale_orders.status` (for filtering by status)
- `inventory_items.wood_product_id` (for product inventory lookups)

## Data Constraints

- `customers.type` must be a valid customer type
- `delivery_schedules.status` must be a valid status value
- `delivery_stops.status` must be a valid status value
- `inventory_items.pallets_available` must be >= 0
- `wholesale_orders.items` must contain valid JSON in the expected format

## Data Migration and Management

- Database migrations are managed through Supabase migrations
- Backup strategy: Daily automated backups with 30-day retention
- Data archiving: Orders older than 2 years are archived to historical tables
