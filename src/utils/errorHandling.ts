import { toast } from '@/hooks/use-toast';

/**
 * Centralized error handling utilities
 */

interface ErrorDetails {
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}

/**
 * Parse error into user-friendly message
 */
export const parseError = (error: unknown): ErrorDetails => {
  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      title: 'Connection Error',
      description: 'Unable to connect to server. Please check your internet connection.',
    };
  }

  // Supabase errors
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = (error as any).message;
    
    if (errorMessage?.includes('JWT')) {
      return {
        title: 'Session Expired',
        description: 'Please sign in again to continue.',
        action: () => window.location.href = '/',
        actionLabel: 'Sign In',
      };
    }

    if (errorMessage?.includes('duplicate')) {
      return {
        title: 'Duplicate Entry',
        description: 'This item already exists.',
      };
    }

    if (errorMessage?.includes('violates foreign key')) {
      return {
        title: 'Invalid Reference',
        description: 'The referenced item no longer exists.',
      };
    }

    return {
      title: 'Operation Failed',
      description: errorMessage,
    };
  }

  // Default error
  return {
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
  };
};

/**
 * Show user-friendly error toast
 */
export const showErrorToast = (error: unknown) => {
  const details = parseError(error);
  
  toast({
    variant: 'destructive',
    title: details.title,
    description: details.description,
  });

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Error:', error);
  }
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, baseDelay * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError;
};
