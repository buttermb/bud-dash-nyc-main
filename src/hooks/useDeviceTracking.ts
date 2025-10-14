import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { recordDeviceFingerprint } from "@/utils/deviceFingerprint";

export function useDeviceTracking() {
  useEffect(() => {
    const trackDevice = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await recordDeviceFingerprint(user.id, supabase);
        }
      } catch (error) {
        console.error("Error tracking device:", error);
      }
    };

    trackDevice();
  }, []);
}