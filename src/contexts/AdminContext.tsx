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
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const verifyAdmin = async (currentSession: Session) => {
    try {
      console.log("Verifying admin with token...");
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "verify" },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      console.log("Admin verify response:", { data, error });

      if (error) {
        console.error("Admin verify error:", error);
        throw error;
      }
      
      if (data?.admin) {
        console.log("Admin verified:", data.admin.email);
        setAdmin(data.admin);
        setSession(currentSession);
      } else {
        console.warn("No admin data in response, checking database directly...");
        
        // Fallback: check database directly
        const { data: adminData, error: dbError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", currentSession.user.id)
          .eq("is_active", true)
          .single();
        
        console.log("Database check:", { adminData, dbError });
        
        if (adminData && !dbError) {
          console.log("Admin found in database:", adminData.email);
          setAdmin({
            id: adminData.id,
            email: adminData.email,
            full_name: adminData.full_name,
            role: adminData.role
          });
          setSession(currentSession);
        } else {
          console.error("Not an admin user");
          setAdmin(null);
          setSession(null);
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error("Admin verification failed:", error);
      setAdmin(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Admin session check:", session ? "Found" : "None");
        
        if (mounted) {
          if (session) {
            await verifyAdmin(session);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Session init error:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Admin auth change:", _event, session ? "Has session" : "No session");
        if (mounted) {
          if (session) {
            await verifyAdmin(session);
          } else {
            setAdmin(null);
            setSession(null);
            setLoading(false);
          }
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
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "login", email, password },
      });

      if (error) throw error;

      if (data?.session && data?.admin) {
        setSession(data.session);
        setAdmin(data.admin);
        
        // Set the session in Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.admin.full_name}`,
        });
      } else {
        throw new Error("Invalid credentials");
      }
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
      if (session) {
        await supabase.functions.invoke("admin-auth", {
          body: { action: "logout" },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
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
    <AdminContext.Provider value={{ admin, session, loading, signIn, signOut }}>
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
