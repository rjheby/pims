# Firewood Delivery Management System - Admin User Guide

This guide provides comprehensive instructions for administrators of the Firewood Delivery Management System. It covers system configuration, user management, and all administrative functions needed to maintain and operate the system.

## Getting Started

### Admin Dashboard Access

1. **Login** to the system using your administrator credentials
2. After login, you'll be directed to the main dashboard
3. The admin functions are accessible via the sidebar navigation

### Admin Mode

For making system changes, you'll need to enable Admin Mode:

1. Look for the "Enter Admin Mode" button in the top-right corner of the screen
2. Click the button to enable editing capabilities
3. The system background will change to a light red color to indicate you're in Admin Mode
4. When finished making changes, click "Exit Admin Mode" to return to normal viewing

> **Note**: Always exit Admin Mode when you're done making changes to prevent accidental modifications.

## User Management

### Viewing Users

1. Navigate to **Settings** > **Users** in the sidebar
2. View the list of all system users with their roles and status

### Adding New Users

1. In the Users section, click the "Add User" button
2. Enter the required information:
   - First Name and Last Name
   - Email Address
   - Role (select from dropdown)
   - Initial Password (or option to send setup email)
3. Click "Create User" to add them to the system

### Editing User Information

1. Find the user in the user list
2. Click the "Edit" button next to their name
3. Modify any required fields
4. Click "Save Changes"

### Managing Roles and Permissions

Users can be assigned the following roles:

- **Super Admin**: Complete system access including configuration
- **Admin**: Full operational access excluding system configuration
- **Manager**: Access to operations but limited administrative functions
- **Warehouse**: Access to inventory and production functions
- **Driver**: Limited access to delivery schedules and updates
- **Client**: Access to their own orders and delivery information

To change a user's role:

1. Find the user in the user list
2. Click "Edit"
3. Change the role from the dropdown menu
4. Click "Save Changes"

## System Configuration

### Delivery Settings

1. Navigate to **Settings** > **Delivery Configuration**
2. Configure the following settings:
   - Available delivery days of the week
   - Delivery time windows
   - Service area boundaries
   - Driver capacity defaults
   - Notification preferences

### Inventory Settings

1. Navigate to **Settings** > **Inventory Configuration**
2. Configure the following options:
   - Low stock threshold alerts
   - Default conversion ratios
   - Inventory location labels
   - Product category management

### Shopify Integration

1. Navigate to **Settings** > **Integrations** > **Shopify**
2. Enter your Shopify API credentials
3. Configure product mapping between Shopify and inventory items
4. Set synchronization preferences
5. Test the connection using the "Test Connection" button

## Inventory Management

### Managing Wholesale Products

1. Navigate to **Databases** > **Inventory**
2. Select the "Wholesale Inventory" tab
3. View current inventory levels for all wholesale products
4. Use filters to narrow down the display by species, size, or status
5. Enter Admin Mode to make changes

#### Adding a New Wholesale Product

1. Click the "Add New Product" button
2. Fill in the product details:
   - Species (e.g., Oak, Maple, Mixed)
   - Length (in inches)
   - Thickness/Split Size
   - Bundle Type
   - Unit Cost
   - Full Description
3. Click "Save Product"

#### Updating Inventory Levels

1. Find the product in the inventory list
2. Click "Update Inventory"
3. Enter the new quantity information:
   - Total Pallets
   - Pallets Available
   - Pallets Allocated
4. Add notes regarding the update if needed
5. Click "Save Changes"

### Managing Retail Products

1. Navigate to **Databases** > **Inventory**
2. Select the "Retail Inventory" tab
3. View current inventory of all retail-ready products

#### Adding a New Retail Product

1. Click the "Add New Product" button
2. Fill in the product details:
   - Item Name
   - Species
   - Length
   - Split Size
   - Package Type (Bundle, Box, etc.)
   - Minimum Quantity
3. Click "Save Product"

### Processing Inventory

To convert wholesale products into retail packages:

1. Navigate to **Databases** > **Inventory**
2. Select the "Processing Records" tab
3. Click "New Processing Record"
4. Select the wholesale product being converted
5. Select the retail product being created
6. Enter the quantity of pallets used
7. Enter the number of retail packages created
8. The system will calculate the conversion ratio
9. Add notes if needed
10. Click "Save Record"

The system will automatically update both wholesale and retail inventory levels based on the conversion.

## Schedule Management

### Creating Delivery Schedules

1. Navigate to **Dispatch** > **Schedules**
2. Click "Create New Schedule"
3. Select the delivery date
4. The system will generate a schedule number
5. Add any required notes
6. Click "Create Schedule"

### Adding Delivery Stops

1. Open a schedule
2. Click "Add Stop"
3. Use the Customer Selector to choose a customer
4. Use the Driver Selector to assign a driver
5. Use the Item Selector to add products for delivery
6. Enter the stop sequence number
7. Add delivery notes if needed
8. Click "Add Stop"

### Managing Delivery Routes

1. View the stops in the schedule
2. Drag and drop stops to reorder them
3. Or update the sequence numbers directly
4. Check the estimated time calculations
5. Ensure driver capacity isn't exceeded

### Managing Multiple Drivers

For schedules requiring multiple drivers:

1. Open the schedule
2. Click "Manage Drivers"
3. Assign drivers to specific stops
4. Use the "Balance Loads" feature to distribute stops evenly
5. Review capacity utilization for each driver
6. Click "Save Assignments"

### Generating Driver Schedules

1. Once the master schedule is complete, click "Generate Driver Schedules"
2. The system will create individual schedules for each assigned driver
3. Review each driver's schedule
4. Make any final adjustments
5. Click "Finalize Schedules"

## Order Management

### Managing Client Orders

1. Navigate to **Orders** > **Client Orders**
2. View all pending and historical orders
3. Use filters to narrow results by date, customer, or status

#### Creating a New Client Order

1. Click "New Order"
2. Select the customer
3. Choose the order type (One-time or Recurring)
4. For recurring orders, set the frequency pattern
5. Add products using the Item Selector
6. Set the requested delivery date
7. Add any special instructions
8. Click "Create Order"

### Managing Supplier Orders

1. Navigate to **Orders** > **Supplier Orders**
2. View all pending and historical supplier orders

#### Creating a New Supplier Order

1. Click "New Order"
2. Select the supplier
3. Add products with quantities
4. Set the expected delivery date
5. Add any special instructions
6. Click "Create Order"

## Reports and Analytics

### Financial Reports

1. Navigate to **Reports** > **Financial**
2. Select the report type:
   - Revenue Summary
   - Cost Analysis
   - Profitability Report
3. Set the date range
4. Click "Generate Report"
5. Use the "Export" button to download as Excel or PDF

### Operations Reports

1. Navigate to **Reports** > **Operations**
2. Select the report type:
   - Delivery Performance
   - Driver Metrics
   - Inventory Turnover
3. Set the date range
4. Click "Generate Report"

### Custom Reports

1. Navigate to **Reports** > **Custom Report**
2. Select the data fields to include
3. Set filters and parameters
4. Choose display options
5. Click "Generate Report"
6. Save the report configuration for future use if needed

## System Maintenance

### Backing Up Data

While Supabase handles database backups automatically, you can export critical data:

1. Navigate to **Settings** > **System** > **Data Export**
2. Select the data tables to export
3. Choose the format (CSV, JSON)
4. Click "Export Data"

### System Logs

To review system activity:

1. Navigate to **Settings** > **System** > **Logs**
2. View user activity, system operations, and error logs
3. Use filters to narrow down results
4. Export logs for further analysis if needed

### Testing System Features

Before rolling out new features to all users:

1. Navigate to **Settings** > **System** > **Testing Mode**
2. Enable testing for specific features
3. Test functionality with sample data
4. Disable testing mode when complete

## Best Practices for Administrators

1. **Regularly review user accounts** and remove access for departed employees
2. **Monitor inventory levels** to ensure accurate stock counts
3. **Back up critical data** before making major system changes
4. **Train new users** thoroughly before granting system access
5. **Review reports** regularly to identify trends and issues
6. **Test integrations** periodically to ensure proper function
7. **Document custom configurations** for future reference

This guide covers the main administrative functions for the Firewood Delivery Management System. For technical support or questions about specific features, please contact system support.
