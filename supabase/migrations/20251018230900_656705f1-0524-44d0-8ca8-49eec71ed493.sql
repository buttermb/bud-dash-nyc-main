
-- Remove the overly restrictive anonymous block policy on admin_users
DROP POLICY IF EXISTS "Block anonymous access to admin_users" ON admin_users;

-- Ensure clean admin access policy
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
CREATE POLICY "Admins can view all admin users"
ON admin_users
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view their own record even during login
CREATE POLICY "Users can view own admin record"
ON admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure the profiles table has proper access
-- (needed because admin_users references user_id which comes from auth)
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON profiles;
