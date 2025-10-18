import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "admin" | "compliance_officer" | "support";
}

interface AdminContextType {
  admin: AdminUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const verifyAdmin = async (currentSession: Session) => {
    try {
      setError(null);
      // Get admin details directly
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("id, email, full_name, role")
        .eq("user_id", currentSession.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (adminError) {
        console.error("Admin lookup error:", adminError);
        throw adminError;
      }

      if (adminData) {
        setAdmin({
          id: adminData.id,
          email: adminData.email,
          full_name: adminData.full_name,
          role: adminData.role
        });
        setSession(currentSession);
        setError(null);
      } else {
        setAdmin(null);
        setSession(null);
        setError("Admin account not found or inactive");
      }
    } catch (err: any) {
      console.error("Admin verification failed:", err);
      setAdmin(null);
      setSession(null);
      setError(err.message || "Admin verification failed");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        // Check existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session fetch error:", error);
          if (mounted) {
            setError(error.message);
            setLoading(false);
          }
          return;
        }

        if (session && mounted) {
          await verifyAdmin(session);
        } else if (mounted) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Auth initialization error:", err);
        if (mounted) {
          setError(err.message || "Failed to initialize auth");
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        
        if (session) {
          verifyAdmin(session);
        } else {
          setAdmin(null);
          setSession(null);
          setError(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.session) throw new Error("No session returned");

      // Get admin details directly
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("id, email, full_name, role")
        .eq("user_id", authData.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (adminError) throw adminError;
      if (!adminData) throw new Error("You don't have admin access");

      setSession(authData.session);
      setAdmin({
        id: adminData.id,
        email: adminData.email,
        full_name: adminData.full_name,
        role: adminData.role
      });

      // Log admin login (fire and forget, don't await)
      supabase.from("security_events").insert({
        event_type: "admin_login",
        user_id: authData.user.id,
        details: { email, timestamp: new Date().toISOString() }
      });

      toast({
        title: "Welcome back!",
        description: `Logged in as ${adminData.full_name}`,
      });
    } catch (error: any) {
      console.error("Admin sign in error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Log admin logout to security events
      if (session?.user?.id) {
        await supabase.from("security_events").insert({
          event_type: "admin_logout",
          user_id: session.user.id,
          details: { timestamp: new Date().toISOString() }
        });
      }
      
      await supabase.auth.signOut();
      setAdmin(null);
      setSession(null);
      
      toast({
        title: "Signed out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AdminContext.Provider value={{ admin, session, loading, error, signIn, signOut }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
