import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateDeviceFingerprint } from "@/utils/deviceFingerprint";

export function useDeviceTracking() {
  useEffect(() => {
    const trackDevice = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const deviceInfo = generateDeviceFingerprint();
          
          // Call edge function to track access and check blocks
          const { data, error } = await supabase.functions.invoke('track-access', {
            body: {
              userId: user.id,
              fingerprint: deviceInfo.fingerprint,
              deviceType: deviceInfo.deviceType,
              browser: deviceInfo.browser,
              os: deviceInfo.os,
            },
          });

          if (error) throw error;

          // If blocked, sign out and redirect
          if (data?.blocked) {
            await supabase.auth.signOut();
            window.location.href = '/';
            alert('Your access has been restricted. Please contact support if you believe this is an error.');
          }
        }
      } catch (error) {
        console.error("Error tracking device:", error);
      }
    };

    trackDevice();

    // Track on auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        trackDevice();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}