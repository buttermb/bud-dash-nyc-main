-- Fix search_path for remaining functions

-- Fix generate_otp function
CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  otp TEXT;
BEGIN
  otp := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN otp;
END;
$$;

-- Fix issue_welcome_discount trigger function
CREATE OR REPLACE FUNCTION public.issue_welcome_discount()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_welcome_discounts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;