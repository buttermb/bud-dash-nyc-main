-- Fix 1: Orders Table RLS Policies - Replace permissive policy with proper access control
DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
DROP POLICY IF EXISTS "Users can view orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Couriers can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Users can only view their own orders
CREATE POLICY "Users can view own orders" ON orders
FOR SELECT USING (auth.uid() = user_id);

-- Couriers can view orders assigned to them
CREATE POLICY "Couriers can view assigned orders" ON orders
FOR SELECT USING (
  courier_id IN (
    SELECT id FROM couriers WHERE user_id = auth.uid()
  )
);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Move extensions from public schema to dedicated schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Fix 3: Create courier PIN session table for server-side validation
CREATE TABLE IF NOT EXISTS courier_pin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id uuid NOT NULL REFERENCES couriers(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on courier_pin_sessions
ALTER TABLE courier_pin_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "System can insert PIN sessions" ON courier_pin_sessions;
DROP POLICY IF EXISTS "Couriers can view own sessions" ON courier_pin_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON courier_pin_sessions;

-- Only system can insert sessions
CREATE POLICY "System can insert PIN sessions" ON courier_pin_sessions
FOR INSERT WITH CHECK (true);

-- Couriers can view their own sessions
CREATE POLICY "Couriers can view own sessions" ON courier_pin_sessions
FOR SELECT USING (
  courier_id IN (
    SELECT id FROM couriers WHERE user_id = auth.uid()
  )
);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions" ON courier_pin_sessions
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to validate courier PIN session
CREATE OR REPLACE FUNCTION validate_courier_pin_session(
  p_session_token text,
  p_courier_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM courier_pin_sessions
    WHERE session_token = p_session_token
      AND courier_id = p_courier_id
      AND expires_at > now()
  );
END;
$$;

-- Function to create courier PIN session
CREATE OR REPLACE FUNCTION create_courier_pin_session(
  p_courier_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_token text;
BEGIN
  -- Generate secure random token
  v_session_token := encode(gen_random_bytes(32), 'base64');
  
  -- Delete expired sessions
  DELETE FROM courier_pin_sessions
  WHERE courier_id = p_courier_id AND expires_at < now();
  
  -- Insert new session
  INSERT INTO courier_pin_sessions (courier_id, session_token)
  VALUES (p_courier_id, v_session_token);
  
  RETURN v_session_token;
END;
$$;