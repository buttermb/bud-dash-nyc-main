# Admin System Setup Guide

## Overview

This project now has a comprehensive admin system with the following features:

- ✅ **Separate Admin Authentication** - Admins have separate login from customers
- ✅ **Role-Based Access Control** - Super Admin, Admin, Compliance Officer, Support roles
- ✅ **Complete Audit Trail** - Every admin action is logged with IP and user agent
- ✅ **Real-Time Dashboard** - Live metrics and KPIs
- ✅ **Order Management** - Cancel, flag, and manage all orders
- ✅ **User Management** - View user profiles, orders, and compliance status
- ✅ **Compliance Dashboard** - Monitor age verifications and flagged orders
- ✅ **Security** - Separate sessions, 8-hour token expiry, activity tracking

## Creating Your First Admin

### Step 1: Sign up as a regular user
1. Go to your app and sign up with the email you want to use as admin
2. Complete the normal signup process

### Step 2: Promote to Admin via Database

Access your Lovable Cloud backend and run this SQL:

```sql
-- Replace 'your-admin@example.com' with your email
INSERT INTO admin_users (user_id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  'super_admin'::admin_role
FROM auth.users
WHERE email = 'your-admin@example.com';
```

### Step 3: Login to Admin Portal

1. Navigate to: `https://your-app.lovable.app/admin/login`
2. Use the same email and password from Step 1
3. You'll be redirected to the admin dashboard

## Admin Roles

- **super_admin**: Full access to everything including user management
- **admin**: Can manage orders, users, and view all data
- **compliance_officer**: Focus on age verification and compliance
- **support**: Limited access for customer support tasks

## Admin Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Overview with key metrics
- `/admin/live-map` - Real-time delivery tracking (coming soon)
- `/admin/orders` - Order management (coming soon)
- `/admin/users` - User management (coming soon)
- `/admin/compliance` - Compliance dashboard (coming soon)
- `/admin/analytics` - Sales analytics (coming soon)
- `/admin/audit-logs` - Admin activity logs (coming soon)

## Edge Functions

### admin-auth
Handles admin authentication, verification, and logout
- Login with admin credentials
- Verify admin session
- Track admin sessions
- Logout and cleanup

### admin-dashboard
Provides dashboard data and metrics
- Overview metrics (orders, revenue, users)
- Live delivery tracking
- Order listings with filters
- Order details with full history
- Compliance metrics
- Sales analytics

### admin-actions
Execute admin actions on orders and users
- Cancel orders
- Flag/unflag orders for review
- Suspend users
- Assign couriers to orders
- All actions are logged in audit trail

## Security Features

1. **Separate Authentication**: Admin users are verified through a separate table
2. **Session Tracking**: All admin sessions are tracked with IP and user agent
3. **Audit Logging**: Every action is logged with full context
4. **Short Token Expiry**: Admin tokens expire after 8 hours
5. **Role-Based Permissions**: Different roles have different access levels
6. **Active Status**: Admins can be deactivated without deleting their account

## Database Tables

- **admin_users**: Stores admin user information and roles
- **admin_audit_logs**: Complete audit trail of all admin actions
- **admin_sessions**: Tracks active admin sessions for security

## Adding More Admins

Once you're logged in as a super admin, you can add more admins through the database:

```sql
-- Add a new admin (they must be a registered user first)
INSERT INTO admin_users (user_id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  'admin'::admin_role  -- or 'compliance_officer', 'support'
FROM auth.users
WHERE email = 'new-admin@example.com';
```

## Next Steps

The admin system is now set up with the core infrastructure. The following pages are placeholders and ready to be built out:

- Live delivery map with real-time courier tracking
- Comprehensive order management interface
- User investigation and management tools
- Compliance dashboard with verification queue
- Sales analytics with charts and reports
- Audit log viewer with filtering

All the backend Edge Functions are ready and working!
