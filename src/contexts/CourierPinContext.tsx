import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CourierPinContextType {
  hasPinSetup: boolean;
  isUnlocked: boolean;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  lockSession: () => void;
}

const CourierPinContext = createContext<CourierPinContextType | undefined>(undefined);

export const CourierPinProvider = ({ children }: { children: ReactNode }) => {
  const [hasPinSetup, setHasPinSetup] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [autoLockTimeout, setAutoLockTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check server-side PIN session on mount
  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if PIN is set up
      const { data: courier } = await supabase
        .from('couriers')
        .select('id, admin_pin, pin_set_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (courier?.admin_pin) {
        // Check if PIN needs to be reset (30 days since last set)
        if (courier.pin_set_at) {
          const pinSetDate = new Date(courier.pin_set_at);
          const daysSinceSet = (Date.now() - pinSetDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceSet > 30) {
            setHasPinSetup(false);
          } else {
            setHasPinSetup(true);
          }
        } else {
          setHasPinSetup(true);
        }

        // Check if we have a valid session token
        const storedToken = sessionStorage.getItem('courier_session_token');
        if (storedToken && courier.id) {
          try {
            const { data: isValid } = await supabase.rpc('validate_courier_pin_session', {
              p_session_token: storedToken,
              p_courier_id: courier.id
            });

            if (isValid) {
              setIsUnlocked(true);
              setSessionToken(storedToken);
            } else {
              sessionStorage.removeItem('courier_session_token');
            }
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('Session validation failed:', error);
            }
            sessionStorage.removeItem('courier_session_token');
          }
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking PIN setup:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-lock timer
  const resetAutoLockTimer = () => {
    if (autoLockTimeout) {
      clearTimeout(autoLockTimeout);
    }

    const timeout = setTimeout(() => {
      lockSession();
      toast.info('Session locked due to inactivity');
    }, 30 * 60 * 1000); // 30 minutes

    setAutoLockTimeout(timeout);
  };

  useEffect(() => {
    if (!isUnlocked) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetAutoLockTimer));
    resetAutoLockTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetAutoLockTimer));
      if (autoLockTimeout) {
        clearTimeout(autoLockTimeout);
      }
    };
  }, [isUnlocked]);

  const setupPin = async (pin: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Hash PIN server-side
    const { data: pinHash, error: hashError } = await supabase.rpc('hash_admin_pin', {
      pin_text: pin
    });

    if (hashError) throw hashError;

    const { error } = await supabase
      .from('couriers')
      .update({ 
        admin_pin: pinHash,
        pin_set_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) throw error;

    setHasPinSetup(true);
    
    // Auto-verify after setup
    await verifyPin(pin);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return false;
      }

      const { data: courier } = await supabase
        .from('couriers')
        .select('id, user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!courier) {
        toast.error('Courier not found');
        return false;
      }

      // Verify PIN server-side
      const { data: isValid, error: verifyError } = await supabase.rpc('verify_admin_pin', {
        courier_user_id: courier.user_id,
        pin: pin
      });

      if (verifyError) {
        if (import.meta.env.DEV) {
          console.error('PIN verification error:', verifyError);
        }
        toast.error('PIN verification failed');
        return false;
      }

      if (isValid) {
        // Create server-side session
        const { data: token, error: sessionError } = await supabase.rpc('create_courier_pin_session', {
          p_courier_id: courier.id
        });

        if (sessionError || !token) {
          if (import.meta.env.DEV) {
            console.error('Session creation error:', sessionError);
          }
          toast.error('Failed to create session');
          return false;
        }

        // Store session token (not unlock status)
        setSessionToken(token);
        sessionStorage.setItem('courier_session_token', token);
        setIsUnlocked(true);
        
        // Log successful verification (fire and forget)
        supabase.from('security_events').insert({
          event_type: 'courier_pin_verification',
          user_id: courier.user_id,
          details: { success: true }
        });

        // Set up auto-lock
        resetAutoLockTimer();
        
        toast.success('PIN verified successfully');
        return true;
      } else {
        // Log failed attempt (fire and forget)
        supabase.from('security_events').insert({
          event_type: 'courier_pin_verification',
          user_id: courier.user_id,
          details: { success: false }
        });
        
        toast.error('Invalid PIN');
        return false;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('PIN verification error:', error);
      }
      toast.error('Failed to verify PIN');
      return false;
    }
  };

  const lockSession = () => {
    setIsUnlocked(false);
    setSessionToken(null);
    sessionStorage.removeItem('courier_session_token');
    if (autoLockTimeout) {
      clearTimeout(autoLockTimeout);
      setAutoLockTimeout(null);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <CourierPinContext.Provider value={{ hasPinSetup, isUnlocked, setupPin, verifyPin, lockSession }}>
      {children}
    </CourierPinContext.Provider>
  );
};

export const useCourierPin = () => {
  const context = useContext(CourierPinContext);
  if (!context) {
    throw new Error('useCourierPin must be used within CourierPinProvider');
  }
  return context;
};
