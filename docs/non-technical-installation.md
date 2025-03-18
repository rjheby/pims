# Firewood Delivery Management System - Installation Guide for Non-Technical Users

This guide provides step-by-step instructions for setting up the Firewood Delivery Management System, designed specifically for users with limited technical experience.

## Before You Begin

### System Requirements

Before starting the installation, make sure you have:

- A computer with internet access
- A modern web browser (Chrome, Firefox, Edge, or Safari)
- A Supabase account (free to start)
- A Netlify account (free to start)
- A GitHub account (free)

### Preparing Your Information

Gather these items before you begin:

- Your business name and logo
- List of products with descriptions
- List of staff members who will need access
- Customer contact information (for importing)

## Step 1: Setting Up Supabase (Database)

Supabase will store all your business data securely.

### Creating a Supabase Account

1. Open your web browser and go to [https://supabase.com](https://supabase.com)
2. Click "Start for Free"
3. Sign up using your email or GitHub account
4. Verify your email address

### Creating a New Project

1. After logging in, click "New Project"
2. Enter a name for your project (e.g., "Firewood-Management")
3. Choose a strong password (write this down somewhere safe!)
4. Select the region closest to your location
5. Click "Create New Project"
6. Wait for your project to be created (this may take a few minutes)

### Setting Up the Database

1. Once your project is ready, click on the "SQL Editor" tab in the left sidebar
2. We'll need to run the database setup scripts. To do this:
   - Download the setup files (your developer will provide these)
   - Open each file in a text editor (like Notepad)
   - Copy the entire contents
   - Paste into the SQL Editor in Supabase
   - Click "Run" to execute the script
3. Run each script in this order:
   - `01_auth_schema.sql`
   - `02_tables.sql`
   - `03_functions.sql`
   - `04_initial_data.sql`

### Getting Your Database Connection Information

1. Click on "Settings" (gear icon) in the left sidebar
2. Click on "API" in the submenu
3. Under "Project API keys," find:
   - **URL**: This will look like `https://xyzabc123.supabase.co`
   - **anon key**: A long string starting with "eyJ..."
4. Copy these values to a secure document - you'll need them later

## Step 2: Deploying with Netlify

Netlify will host your application so you can access it from anywhere.

### Creating a Netlify Account

1. Open your web browser and go to [https://netlify.com](https://netlify.com)
2. Click "Sign up"
3. Choose to sign up with GitHub (recommended) or your email
4. Complete the signup process

### Deploying from GitHub

1. Once logged in, click "Add new site" → "Import an existing project"
2. Choose "GitHub" as your Git provider
3. Authorize Netlify to access your GitHub account if prompted
4. Select the repository containing your Firewood Management System
   - Your developer will provide this repository or help you fork it
5. Configure build settings:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. Click "Show advanced" to add environment variables
7. Add these environment variables (copy them exactly as written):
   - `NEXT_PUBLIC_SUPABASE_URL`: Paste your Supabase URL from earlier
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Paste your anon key from earlier
8. Click "Deploy site"
9. Wait for the deployment to complete (this may take a few minutes)

### Setting Up Your Domain (Optional)

To use a custom domain name like "firewood.yourcompany.com":

1. From your site dashboard, click "Domain settings"
2. Click "Add a domain"
3. Enter your domain name
4. Follow the instructions to verify domain ownership
   - This usually involves adding DNS records at your domain registrar
   - Netlify provides step-by-step instructions for most registrars

## Step 3: Initial System Setup

Now that your system is deployed, you'll need to configure it for first use.

### Creating an Admin User

1. Visit your new site (Netlify provides a temporary URL)
2. You'll see a login screen
3. Click "Sign up" to create the first admin account
4. Enter your email and create a strong password
5. Verify your email by clicking the link sent to your inbox

### Setting Admin Privileges

For this step, you'll need to update your database:

1. Return to your Supabase dashboard
2. Click on "Table Editor" in the left sidebar
3. Select the "profiles" table
4. Find your newly created user (match by email)
5. Click on the row to edit it
6. Change the "role" field to "SUPER_ADMIN"
7. Click "Save"

### Basic System Configuration

1. Log in to your system using your admin account
2. Go to "Settings" in the navigation menu
3. Configure these essential settings:
   - **Business Information**: Add your company name, logo, and contact details
   - **User Roles**: Set up accounts for your staff members
   - **Delivery Settings**: Configure available delivery days and time windows
   - **Product Catalog**: Add your wood products and pricing

## Step 4: Importing Your Data

Now that the system is set up, you can import your existing data.

### Importing Customers

1. Prepare a CSV file of your customers with these columns:
   - first_name, last_name, email, phone, address, city, state, zip
2. Go to "Databases" → "Customers" in your system
3. Click "Import Customers"
4. Select your CSV file
5. Map the columns to match your file
6. Click "Import"

### Importing Inventory

1. Prepare a CSV file of your inventory with these columns:
   - product_name, species, length, thickness, quantity
2. Go to "Databases" → "Inventory" in your system
3. Click "Import Inventory"
4. Select your CSV file
5. Map the columns to match your file
6. Click "Import"

## Step 5: Testing Your System

Before going live, test these key functions:

### Basic Testing Checklist

1. **User Accounts**:
   - Create a test user for each role
   - Log in with each account
   - Verify appropriate access levels

2. **Inventory Management**:
   - Add a test product
   - Update inventory quantities
   - Process a test conversion

3. **Delivery Scheduling**:
   - Create a test schedule
   - Add delivery stops
   - Assign drivers
   - Finalize the schedule

4. **Order Processing**:
   - Create a test customer order
   - Add it to a delivery schedule
   - Complete the delivery

## Troubleshooting Common Issues

### "Site not found" Error

- **Cause**: Netlify deployment hasn't completed
- **Solution**: Wait a few minutes and refresh the page

### Can't Log In

- **Cause 1**: Email verification not completed
- **Solution 1**: Check your email for the verification link
- **Cause 2**: Incorrect password
- **Solution 2**: Use the "Forgot Password" link

### Database Connection Error

- **Cause**: Incorrect environment variables
- **Solution**: Check your Supabase URL and anon key in Netlify environment settings

### Import Failures

- **Cause**: Incorrect CSV format
- **Solution**: Ensure your CSV has the correct headers and no special characters

## Getting Support

If you encounter issues during setup:

1. Check the troubleshooting section above
2. Contact your developer for assistance
3. Post on the user forum (if available)
4. Email support@yourdomain.com for help

## Next Steps

After successful installation:

1. **Train Your Staff**: Show them how to use the system
2. **Enter Real Data**: Start adding your actual inventory and customers
3. **Create Standard Operating Procedures**: Document how your team will use the system
4. **Schedule Regular Backups**: Set calendar reminders to export data regularly

Congratulations! Your Firewood Delivery Management System is now set up and ready to use. This new system will help streamline your operations and improve customer service.
