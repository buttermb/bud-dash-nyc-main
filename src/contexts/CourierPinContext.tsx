import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    checkPinSetup();
    
    // Auto-lock after 5 minutes of inactivity
    let inactivityTimer: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (isUnlocked) {
        inactivityTimer = setTimeout(() => {
          lockSession();
        }, 5 * 60 * 1000); // 5 minutes
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isUnlocked]);

  const checkPinSetup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('couriers')
        .select('pin_hash, pin_set_at')
        .eq('user_id', user.id)
        .single();

      if (!error && data?.pin_hash) {
        // Check if PIN has expired (5 days)
        if (data.pin_set_at) {
          const pinSetDate = new Date(data.pin_set_at);
          const daysSinceSet = (Date.now() - pinSetDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceSet > 5) {
            // PIN expired, need to set new one
            setHasPinSetup(false);
          } else {
            setHasPinSetup(true);
          }
        } else {
          setHasPinSetup(true);
        }
      }
    } catch (error) {
      console.error('Error checking PIN setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupPin = async (pin: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Simple hash (in production, use proper hashing on backend)
    const pinHash = btoa(pin);

    const { error } = await supabase
      .from('couriers')
      .update({ 
        pin_hash: pinHash,
        pin_set_at: new Date().toISOString(),
        pin_last_verified_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) throw error;

    setHasPinSetup(true);
    setIsUnlocked(true);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('couriers')
      .select('pin_hash, pin_set_at')
      .eq('user_id', user.id)
      .single();

    const pinHash = btoa(pin);
    if (data?.pin_hash === pinHash) {
      // Update last verified timestamp
      await supabase
        .from('couriers')
        .update({ pin_last_verified_at: new Date().toISOString() })
        .eq('user_id', user.id);
      
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const lockSession = () => {
    setIsUnlocked(false);
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
