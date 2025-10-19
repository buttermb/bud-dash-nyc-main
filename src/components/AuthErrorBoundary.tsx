import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
}

interface State {
  hasAuthError: boolean;
  error: Error | null;
  isClearing: boolean;
}

/**
 * Specialized error boundary for authentication-related errors
 * Automatically clears session and redirects to login on auth failures
 */
export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasAuthError: false,
    error: null,
    isClearing: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is an authentication-related error
    const isAuthError = 
      error.message?.includes('JWT') ||
      error.message?.includes('auth') ||
      error.message?.includes('User from sub claim') ||
      error.message?.includes('403') ||
      error.message?.includes('Unauthorized');

    if (isAuthError) {
      return { hasAuthError: true, error };
    }
    
    // Let other error boundaries handle non-auth errors
    throw error;
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught auth error:', error, errorInfo);
    
    // Clear auth data immediately
    this.clearAuthAndRedirect();
  }

  private clearAuthAndRedirect = async () => {
    this.setState({ isClearing: true });
    
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear localStorage and sessionStorage
      localStorage.removeItem('sb-vltveasdxtfvvqbzxzuf-auth-token');
      sessionStorage.clear();
      
      // Log security event
      await supabase.from('security_events').insert({
        event_type: 'auth_error_boundary_triggered',
        details: { 
          error: this.state.error?.message || 'Unknown auth error',
          url: window.location.href 
        }
      });
      
      // Redirect to login
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 1500);
    } catch (e) {
      console.error('Failed to clear auth data:', e);
      // Force redirect anyway
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    }
  };

  public render() {
    if (this.state.hasAuthError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Session Expired</CardTitle>
              </div>
              <CardDescription>
                {this.state.isClearing 
                  ? 'Clearing session data and redirecting to login...'
                  : 'Your session has expired or is invalid. Please log in again.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!this.state.isClearing && (
                <Button 
                  onClick={() => window.location.href = '/admin/login'} 
                  className="w-full"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Go to Login
                </Button>
              )}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Error details (dev only)
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-48">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}