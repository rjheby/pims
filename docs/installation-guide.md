# Firewood Delivery Management System - Installation & Deployment Guide

This guide provides step-by-step instructions for setting up and deploying the Firewood Delivery Management System, with special attention to those who are new to coding and deployment processes.

## Prerequisites

Before beginning the installation process, ensure you have the following:

1. **GitHub Account**: Used for storing and managing your code repository
2. **Supabase Account**: For database and authentication services
3. **Netlify Account**: For deploying the web application
4. **Node.js**: Version 16.x or higher installed on your local machine
5. **npm**: Usually comes with Node.js installation

## Local Development Setup

### 1. Clone the Repository

```bash
# Open your command line or terminal and run:
git clone https://github.com/your-username/firewood-management.git
cd firewood-management
```

### 2. Install Dependencies

```bash
# Install all required packages
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project dashboard under "Project Settings" > "API".

### 4. Set Up Supabase Database

1. **Create a New Supabase Project**:
   - Log in to Supabase (https://app.supabase.io/)
   - Click "New Project"
   - Enter your project details and create the project

2. **Run Database Setup Scripts**:
   - Navigate to the "SQL Editor" in your Supabase dashboard
   - Open the database setup SQL files from the `database` folder in the project
   - Run the scripts in the following order:
     - 1_auth_schema.sql
     - 2_tables.sql
     - 3_functions.sql
     - 4_initial_data.sql

3. **Configure Authentication**:
   - Go to "Authentication" > "Settings" in your Supabase dashboard
   - Enable Email authentication
   - Set up any other authentication providers you need

### 5. Start the Development Server

```bash
npm run dev
```

The application should now be running at http://localhost:3000.

## Deploying to Netlify

### 1. Prepare for Deployment

Before deploying, make sure:
- All your changes are committed to GitHub
- Your environment variables are ready to be configured in Netlify
- You have administrator access to your Netlify account

### 2. Connect to Netlify

1. **Login to Netlify** and go to your dashboard
2. **Click "New site from Git"**
3. **Choose GitHub** as your Git provider
4. **Authorize Netlify** to access your GitHub repositories
5. **Select your repository** from the list

### 3. Configure Build Settings

Enter the following settings:

- **Build command**: `npm run build`
- **Publish directory**: `build` (or `dist` depending on your configuration)
- **Environment variables**: Add the same variables from your `.env.local` file:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Deploy the Site

Click "Deploy site" to start the deployment process. Netlify will build your application and deploy it to a random URL.

### 5. Set Up Custom Domain (Optional)

1. Go to "Domain settings" for your site in Netlify
2. Click "Add custom domain"
3. Follow the instructions to connect your domain

### 6. Enable Continuous Deployment

By default, Netlify will automatically redeploy your site whenever you push changes to the main branch of your GitHub repository.

## Post-Deployment Configuration

### 1. Set Up Redirect Rules

Create a `_redirects` file in your `public` folder to handle client-side routing:

```
/*    /index.html   200
```

This ensures that React Router works correctly with Netlify.

### 2. Configure CORS in Supabase

1. Go to your Supabase project settings
2. Navigate to the API section
3. Add your Netlify domain to the allowed origins

### 3. Create Initial Admin User

1. Use the Supabase Auth UI to create your first user
2. Connect to the Supabase SQL editor and run:

```sql
UPDATE profiles
SET role = 'SUPER_ADMIN'
WHERE id = 'your-user-id';
```

Replace 'your-user-id' with the actual user ID from your authentication system.

## Troubleshooting Common Issues

### Build Failures

If your build fails on Netlify, check:
- The build command is correct
- All dependencies are properly listed in package.json
- Environment variables are correctly set

### Database Connection Issues

If the application can't connect to Supabase:
- Verify your environment variables are correctly set in Netlify
- Check that your Supabase project is active
- Ensure CORS is properly configured

### Authentication Problems

If login isn't working:
- Confirm that authentication is enabled in Supabase
- Check that your application is using the correct API keys
- Verify that the profiles table exists with the correct structure

### Routing Issues

If pages aren't loading correctly:
- Make sure the `_redirects` file is properly configured
- Check that React Router is correctly set up in your application
- Verify the Netlify configuration for handling single-page applications

## Updating Your Deployment

To update your application:

1. Make changes to your local code
2. Test locally using `npm run dev`
3. Commit changes to your GitHub repository
4. Push to the main branch
5. Netlify will automatically rebuild and deploy the updated site

## Maintenance Tasks

### Database Backups

Regularly back up your Supabase database:
1. Go to the Supabase dashboard for your project
2. Navigate to "Database" > "Backups"
3. Create a manual backup or set up automatic backups

### Monitoring Performance

Monitor your application's performance using Netlify Analytics or by connecting an external analytics service like Google Analytics.

### Checking for Updates

Regularly update dependencies to maintain security and performance:

```bash
npm outdated
npm update
```

This installation and deployment guide should help you get your Firewood Delivery Management System up and running, even if you're new to coding and deployment processes. For further assistance, refer to the troubleshooting section or contact your development team.
