import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourierData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  vehicle_type: string;
  is_online: boolean;
  commission_rate: number;
  current_lat?: number;
  current_lng?: number;
}

interface CourierContextType {
  courier: CourierData | null;
  loading: boolean;
  isOnline: boolean;
  toggleOnlineStatus: () => Promise<void>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
  refreshCourier: () => Promise<void>;
}

const CourierContext = createContext<CourierContextType | undefined>(undefined);

export function CourierProvider({ children }: { children: React.ReactNode }) {
  const [courier, setCourier] = useState<CourierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCourierData();
  }, []);

  // Track location when online
  useEffect(() => {
    if (!isOnline || !courier) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Location error:', error);
      },
      { enableHighAccuracy: true, maximumAge: 30000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnline, courier]);

  const loadCourierData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { endpoint: 'login' }
      });

      if (error) throw error;

      setCourier(data.courier);
      setIsOnline(data.courier.is_online);
    } catch (error) {
      console.error('Failed to load courier data:', error);
      toast({
        title: "Error",
        description: "Failed to load courier profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!courier) return;

    try {
      const newStatus = !isOnline;
      const { data, error } = await supabase.functions.invoke('courier-app', {
        body: { 
          endpoint: 'toggle-online',
          is_online: newStatus
        }
      });

      if (error) throw error;

      setIsOnline(newStatus);
      setCourier(data.courier);
      
      toast({
        title: newStatus ? "You're now online" : "You're now offline",
        description: newStatus ? "You can now receive orders" : "You won't receive new orders"
      });
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const updateLocation = async (lat: number, lng: number) => {
    if (!courier) return;

    try {
      await supabase.functions.invoke('courier-app', {
        body: {
          endpoint: 'update-location',
          lat,
          lng
        }
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const refreshCourier = async () => {
    await loadCourierData();
  };

  return (
    <CourierContext.Provider value={{
      courier,
      loading,
      isOnline,
      toggleOnlineStatus,
      updateLocation,
      refreshCourier
    }}>
      {children}
    </CourierContext.Provider>
  );
}

export function useCourier() {
  const context = useContext(CourierContext);
  if (context === undefined) {
    throw new Error('useCourier must be used within CourierProvider');
  }
  return context;
}
