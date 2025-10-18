-- Fix search_path for calculate_fraud_score function
CREATE OR REPLACE FUNCTION public.calculate_fraud_score(p_email text, p_phone text, p_device_fingerprint text, p_ip_address text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  score INTEGER := 0;
  duplicate_count INTEGER;
  failed_count INTEGER;
BEGIN
  -- Check for duplicate entries
  SELECT COUNT(*) INTO duplicate_count
  FROM giveaway_entries
  WHERE user_email = p_email OR user_phone = p_phone OR device_fingerprint = p_device_fingerprint;
  
  IF duplicate_count > 0 THEN
    score := score + 50;
  END IF;
  
  -- Check failed attempts from same IP/device
  SELECT COUNT(*) INTO failed_count
  FROM giveaway_queue
  WHERE (last_error IS NOT NULL)
    AND created_at > now() - interval '1 hour';
  
  IF failed_count > 3 THEN
    score := score + 30;
  END IF;
  
  -- Check for suspicious patterns
  IF p_email LIKE '%test%' OR p_email LIKE '%fake%' THEN
    score := score + 20;
  END IF;
  
  RETURN score;
END;
$$;