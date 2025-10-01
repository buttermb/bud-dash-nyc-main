import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Courier {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  is_active: boolean;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
}

interface CourierContextType {
  courier: Courier | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateLocation: (lat: number, lng: number) => Promise<void>;
  toggleOnlineStatus: () => Promise<void>;
}

const CourierContext = createContext<CourierContextType | undefined>(undefined);

export const CourierProvider = ({ children }: { children: ReactNode }) => {
  const [courier, setCourier] = useState<Courier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCourierSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        await loadCourierData(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setCourier(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkCourierSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadCourierData(session.user.id);
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourierData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("couriers")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setCourier(data);
    } catch (error) {
      console.error("Failed to load courier data:", error);
      setCourier(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) return { error: authError };

      // Verify user is a courier
      const { data: courierData, error: courierError } = await supabase
        .from("couriers")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (courierError || !courierData) {
        await supabase.auth.signOut();
        return { error: { message: "Not authorized as a courier" } };
      }

      if (!courierData.is_active) {
        await supabase.auth.signOut();
        return { error: { message: "Courier account is inactive" } };
      }

      setCourier(courierData);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    if (courier) {
      await supabase
        .from("couriers")
        .update({ is_online: false })
        .eq("id", courier.id);
    }
    await supabase.auth.signOut();
    setCourier(null);
  };

  const updateLocation = async (lat: number, lng: number) => {
    if (!courier) return;

    try {
      const { error } = await supabase
        .from("couriers")
        .update({ current_lat: lat, current_lng: lng })
        .eq("id", courier.id);

      if (error) throw error;
      setCourier({ ...courier, current_lat: lat, current_lng: lng });
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!courier) return;

    try {
      const newStatus = !courier.is_online;
      const { error } = await supabase
        .from("couriers")
        .update({ is_online: newStatus })
        .eq("id", courier.id);

      if (error) throw error;
      setCourier({ ...courier, is_online: newStatus });
    } catch (error) {
      console.error("Failed to toggle online status:", error);
    }
  };

  return (
    <CourierContext.Provider
      value={{
        courier,
        loading,
        signIn,
        signOut,
        updateLocation,
        toggleOnlineStatus,
      }}
    >
      {children}
    </CourierContext.Provider>
  );
};

export const useCourier = () => {
  const context = useContext(CourierContext);
  if (context === undefined) {
    throw new Error("useCourier must be used within a CourierProvider");
  }
  return context;
};
