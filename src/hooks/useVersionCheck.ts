import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const VERSION_KEY = 'app_version';

async function clearAllCaches() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
  }
  
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
  }
  
  localStorage.clear();
  sessionStorage.clear();
}

export function useVersionCheck() {
  const checkInProgress = useRef(false);
  const currentVersion = useRef<string | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      if (checkInProgress.current) return;
      checkInProgress.current = true;

      try {
        // Fetch with cache-busting
        const response = await fetch(`/index.html?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        const html = await response.text();
        
        // Extract build timestamp from meta tag or generate from content hash
        const metaMatch = html.match(/<meta name="build-time" content="([^"]+)"/);
        const newVersion = metaMatch ? metaMatch[1] : html.substring(0, 100);
        
        // Initialize version on first check
        if (currentVersion.current === null) {
          currentVersion.current = newVersion;
          localStorage.setItem(VERSION_KEY, newVersion);
          return;
        }
        
        // Check if version changed
        const storedVersion = localStorage.getItem(VERSION_KEY);
        if (storedVersion && storedVersion !== newVersion) {
          toast.info('New version available! Updating...', {
            duration: 3000
          });
          
          await clearAllCaches();
          localStorage.setItem(VERSION_KEY, newVersion);
          
          // Reload after short delay
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('Version check failed:', error);
      } finally {
        checkInProgress.current = false;
      }
    };

    // Check immediately on mount
    checkVersion();

    // Check periodically
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Check on visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
