import { supabase } from '@/integrations/supabase/client';

/**
 * Completely clears all authentication data from browser storage
 * Use this when:
 * - User signs out
 * - Auth verification fails
 * - 403 errors from Supabase
 * - Session is invalid or expired
 */
export const clearAuthStorage = async (): Promise<void> => {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear specific auth token
    localStorage.removeItem('sb-vltveasdxtfvvqbzxzuf-auth-token');
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    // Clear any other auth-related items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('Auth storage cleared successfully');
  } catch (error) {
    console.error('Error clearing auth storage:', error);
    // Force clear anyway
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to force clear storage:', e);
    }
  }
};

/**
 * Clears auth storage and redirects to login
 */
export const clearAuthAndRedirect = async (redirectPath: string = '/admin/login'): Promise<void> => {
  await clearAuthStorage();
  
  // Small delay to ensure storage is cleared
  setTimeout(() => {
    window.location.href = redirectPath;
  }, 100);
};