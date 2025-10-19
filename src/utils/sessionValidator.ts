import { supabase } from '@/integrations/supabase/client';
import { clearAuthStorage } from './clearAuthStorage';

/**
 * Validates the current session and clears invalid tokens
 * This runs on app initialization to fix token mismatch issues
 */
export const validateAndCleanSession = async (): Promise<void> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Session validation error:', error.message);
      await clearAuthStorage();
      return;
    }

    if (!session) {
      // No session, nothing to validate
      return;
    }

    // Try to verify the session by fetching user data
    const { error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('User validation failed:', userError.message);
      
      // Check for specific "user doesn't exist" errors
      if (
        userError.message.includes('User from sub claim') ||
        userError.message.includes('JWT') ||
        userError.status === 403
      ) {
        console.log('Clearing invalid session tokens...');
        await clearAuthStorage();
        
        // Force reload to clear any React state
        window.location.reload();
      }
    }
  } catch (err) {
    console.error('Session validation error:', err);
    // On any critical error, clear auth to prevent crashes
    await clearAuthStorage();
  }
};
