# Firewood Delivery Management System - Setup Guide

This guide is designed for AI assistants and contractors who need to understand and work with the Firewood Delivery Management System. It provides the system blueprint and safe onboarding process.

## System Architecture

- **React 18** with TypeScript
- **React Router DOM** for client-side routing
- **Supabase** for backend (database, authentication, storage)
- **Tailwind CSS** for styling
- **Vite** for build tooling and development server
- **GitHub** for code repository
- **Netlify** for deployment

## Prerequisites

Before beginning, ensure you have:

1. **Node.js** (version 16.x or higher)
2. **npm** or **yarn** package manager
3. **GitHub access** to the repository
4. **Supabase account** (for backup verification)
5. **Netlify account** (for deployment)

## CRITICAL: Safety Protocol (Do This First)

Before making any changes to the system, you must create and verify a backup of the production Supabase database.

### Step 1: Create Supabase Backup

1. **Get database access**: Request Supabase connection details from project owner
2. **Create backup Supabase project**:
   - Go to [https://supabase.com](https://supabase.com)
   - Create new project called "Firewood-Backup-[DATE]"
   - Choose same region as production
3. **Export production schema**:
   - In production Supabase dashboard, go to **Settings** > **Database**
   - Click **Database** tab, then **Connection Pooling**
   - Copy connection string
   - Use `pg_dump` to export schema and data:
   ```bash
   pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" > backup_$(date +%Y%m%d).sql
   ```
4. **Alternative method** (if pg_dump unavailable):
   - Go to **SQL Editor** in production Supabase
   - Export each table individually using:
   ```sql
   SELECT * FROM table_name;
   ```
   - Save results as CSV files

### Step 2: Verify Backup Works

1. **Import to backup project**:
   - In your backup Supabase project, go to **SQL Editor**
   - Import the SQL dump or recreate tables from CSV
2. **Test critical functions**:
   - Verify table structure matches production
   - Check that sample data imported correctly
   - Test authentication tables exist
   - Confirm foreign key relationships work
3. **Document backup location**: Save backup project URL and date created

### Step 3: Test Restore Process

Before working on production, verify you can actually restore from backup:

1. **Create test project**: "Firewood-Restore-Test-[DATE]"
2. **Import your backup**: Use same process as Step 2
3. **Verify it works**: Check all tables, data, and relationships
4. **Delete test project**: Clean up after successful test

⚠️ **Only proceed to production work after successful backup verification**

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/firewood-management.git
cd firewood-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Connect to Production Supabase

#### Get Connection Details
Request these from the project owner:
- **Supabase URL**: `https://[project-id].supabase.co`
- **Supabase anon key**: Public API key starting with `eyJ...`

#### Configure Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

⚠️ **Important**: These connect to the live production database. Handle with care.

### 4. Test Local Connection

```bash
npm run dev
```

1. Open browser to `http://localhost:5173`
2. Verify the app loads without errors
3. Test login with existing account (request credentials from owner)
4. Navigate through key sections to confirm database connectivity
5. **Do not create test data** - you're working with live production data

## Production Deployment

### 1. Connect GitHub to Netlify

1. **In Netlify dashboard**:
   - Click "Add new site" > "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select the firewood-management repository

2. **Configure build settings**:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Add environment variables** in Netlify:
   - Go to **Site settings** > **Environment variables**
   - Add:
     - `VITE_SUPABASE_URL`: [production Supabase URL]
     - `VITE_SUPABASE_ANON_KEY`: [production anon key]

4. **Deploy**: Click "Deploy site"

### 2. Configure SPA Routing

Ensure you have a `public/_redirects` file:

```
/*    /index.html   200
```

This makes React Router work correctly in production.

### 3. Update Supabase Auth Settings

1. **In production Supabase dashboard**:
   - Go to **Authentication** > **Settings**
   - **Site URL**: Add your Netlify domain
   - **Redirect URLs**: Add `https://your-app.netlify.app/**`
   - Click "Save"

## Working Safely with Production Data

### Guidelines for Changes

1. **Always test queries** in SQL Editor before implementing in code
2. **Use transactions** for multi-step database operations
3. **Start with SELECT** statements to understand data before UPDATE/DELETE
4. **Make incremental changes** - commit frequently to GitHub
5. **Document what you're doing** in commit messages

### Emergency Procedures

If something goes wrong:

1. **Stop immediately** - don't try to "fix" with more changes
2. **Document the issue** - screenshot errors, copy error messages
3. **Restore from backup**:
   - Go to your backup Supabase project
   - Export the backup data
   - Import to a new project
   - Update environment variables to point to restored database
4. **Notify project owner** with details of what happened

### Backup Before Major Changes

Before any significant modifications:

1. **Create incremental backup**: Follow backup process above
2. **Name it descriptively**: "Pre-inventory-system-changes-[DATE]"
3. **Test the backup** before proceeding
4. **Document what you're about to change**

## System Understanding Checklist

Before making changes, ensure you understand:

- [ ] Database schema and relationships (see `docs/DATABASE_SCHEMA.md`)
- [ ] Authentication system and user roles (see `docs/authentication-system.md`)
- [ ] Component architecture (see `docs/COMPONENT_ARCHITECTURE.md`)
- [ ] Current implementation status (see `docs/FEATURE_IMPLEMENTATION_STATUS.md`)
- [ ] Business logic and workflows

## Typical Workflows

### For AI Assistants
1. Review relevant documentation first
2. Create backup before changes
3. Test changes incrementally
4. Commit frequently with clear messages
5. Verify functionality after each change

### For Contractors
1. Complete safety protocol above
2. Review codebase and documentation
3. Clarify requirements with project owner
4. Work in small, testable increments
5. Document changes and provide handoff notes

## Getting Help

- **Code Issues**: Check browser console and Supabase logs
- **Database Issues**: Use Supabase SQL Editor to debug queries
- **Deployment Issues**: Check Netlify build logs
- **Authentication Issues**: Verify Supabase auth settings match deployment URL

## Important Notes

- This is a **production system** with real business data
- **Always backup before making changes**
- **Test thoroughly** before considering work complete
- **Document your changes** for future maintainers
- **When in doubt, ask** rather than guess

This setup ensures safe, productive work on the Firewood Delivery Management System while protecting business-critical data.
